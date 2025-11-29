from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi import Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, MediaAsset
from app.auth import get_current_active_user
import os
import uuid
from pathlib import Path
import json
import boto3
from botocore.exceptions import ClientError

router = APIRouter(prefix="/api/media", tags=["media"])

# S3設定 - 開発環境ではローカルストレージを使用
S3_BUCKET = os.getenv("AWS_S3_BUCKET", "rainbow-community-media-prod")
S3_REGION = os.getenv("AWS_REGION", "ap-northeast-1")
USE_S3 = os.getenv("USE_S3", "false").lower() == "true"  # デフォルトfalseに変更

# S3クライアント初期化
if USE_S3:
    s3_client = boto3.client(
        's3',
        region_name=S3_REGION,
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
    )
else:
    s3_client = None

# ローカルストレージ（フォールバック）
media_base = os.getenv("MEDIA_DIR")
if not media_base:
    media_base = "/data/media" if os.path.exists("/data") else "media"
MEDIA_DIR = Path(media_base)
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Validate content type defensively (content_type can be None)
    allowed_types = ['image/jpeg', 'image/png', 'image/webp']
    if not file.content_type or file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, and WEBP images are allowed")

    # Read content to determine size (UploadFile has no .size attribute)
    content = await file.read()
    max_bytes = 10 * 1024 * 1024  # 10MB
    if len(content) > max_bytes:
        raise HTTPException(status_code=400, detail="File too large")

    file_extension = file.filename.split('.')[-1] if file.filename and '.' in file.filename else 'jpg'
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    
    if USE_S3 and s3_client:
        # S3にアップロード
        try:
            s3_key = f"media/{unique_filename}"
            s3_client.put_object(
                Bucket=S3_BUCKET,
                Key=s3_key,
                Body=content,
                ContentType=file.content_type or "application/octet-stream"
            )
            # S3のURL
            url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{s3_key}"
        except ClientError as e:
            raise HTTPException(status_code=500, detail=f"S3 upload failed: {str(e)}")
    else:
        # ローカルファイルシステムにフォールバック
        file_path = MEDIA_DIR / unique_filename
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        url = f"/media/{unique_filename}"

    media_asset = MediaAsset(
        user_id=current_user.id,
        url=url,
        mime_type=file.content_type or "application/octet-stream",
        size_bytes=len(content)
    )
    db.add(media_asset)
    db.commit()
    db.refresh(media_asset)
    
    return {"id": media_asset.id, "url": media_asset.url}


@router.get("/user/images")
def list_user_images(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all images uploaded by the current user, ordered by newest first."""
    assets = (
        db.query(MediaAsset)
        .filter(MediaAsset.user_id == current_user.id)
        .filter(MediaAsset.mime_type.like('image/%'))
        .order_by(MediaAsset.created_at.desc())
        .all()
    )
    
    if USE_S3:
        valid_assets = assets
    else:
        # ローカルストレージ使用時のみファイル存在チェック
        valid_assets = []
        for a in assets:
            file_path = MEDIA_DIR / a.url.split('/')[-1]
            if file_path.exists():
                valid_assets.append(a)
            else:
                # ファイルが存在しない場合でも、他テーブルから参照されている可能性があるため
                # ここではレコード削除は行わず、ログ出力のみに留める
                print(f"Skipping orphaned media record (not deleting to avoid FK issues): {a.id}, missing file: {file_path}")

    # ユーザーごとの順序ファイルがあれば、その順序で並べ替え
    try:
        order_file = MEDIA_DIR / f"user_{current_user.id}_order.json"
        if order_file.exists():
            with open(order_file, 'r', encoding='utf-8') as f:
                id_order = json.load(f) or []
            pos = {int(i): idx for idx, i in enumerate(id_order)}
            valid_assets.sort(key=lambda a: pos.get(int(a.id), 1_000_000))
    except Exception as e:
        print(f"order apply failed: {e}")

    return {"items": [{"id": a.id, "url": a.url, "created_at": a.created_at, "size_bytes": a.size_bytes} for a in valid_assets]}


@router.delete("/{media_id}")
def delete_media(
    media_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a media asset. Only the owner can delete."""
    asset = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Media not found")
    if asset.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    # S3またはローカルから削除
    if USE_S3 and s3_client and asset.url.startswith('https://'):
        # S3から削除
        try:
            s3_key = asset.url.split(f"{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/")[1]
            s3_client.delete_object(Bucket=S3_BUCKET, Key=s3_key)
        except Exception as e:
            print(f"S3 delete failed: {e}")
    else:
        # ローカルファイルから削除
        file_path = MEDIA_DIR / asset.url.split('/')[-1]
        if file_path.exists():
            file_path.unlink()
    
    db.delete(asset)
    db.commit()
    return {"status": "deleted"}


@router.put("/user/images/order")
def save_user_image_order(
    payload: dict = Body(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Persist the display order of user's images server-side (shared across devices).
    payload: { "order": [media_id1, media_id2, ...] }
    """
    if "order" not in payload or not isinstance(payload["order"], list):
        raise HTTPException(status_code=400, detail="order must be a list")
    ids = [int(i) for i in payload["order"] if str(i).isdigit()]
    
    if ids:
        # Validate ownership only when list is not empty
        owned_ids = {a.id for a in db.query(MediaAsset).filter(MediaAsset.user_id == current_user.id).all()}
        for mid in ids:
            if mid not in owned_ids:
                raise HTTPException(status_code=403, detail=f"Media {mid} not owned by user")

    order_file = MEDIA_DIR / f"user_{current_user.id}_order.json"
    try:
        with open(order_file, 'w', encoding='utf-8') as f:
            json.dump(ids, f, ensure_ascii=False)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save order: {e}")

    return {"status": "ok"}
