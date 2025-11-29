from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import date
import json
import os
import uuid
import boto3
from botocore.exceptions import ClientError

from app.database import get_db
from app.auth import get_current_active_user
from app.models import DonationProject, DonationSupport, DonationProjectImage, User

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

router = APIRouter(
    prefix="/api/donation",
    tags=["donation"],
)

@router.get("/projects")
def list_projects(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """寄付プロジェクト一覧を取得"""
    query = db.query(DonationProject)
    
    if category and category != 'all':
        query = query.filter(DonationProject.category == category)
    
    projects = query.order_by(DonationProject.created_at.desc()).all()
    
    result = []
    for project in projects:
        user = db.query(User).filter(User.id == project.creator_id).first()
        
        # プロジェクトの画像を取得
        images = db.query(DonationProjectImage).filter(
            DonationProjectImage.project_id == project.id
        ).order_by(DonationProjectImage.display_order).all()
        image_urls = [img.image_url for img in images]
        
        result.append({
            "id": project.id,
            "title": project.title,
            "description": project.description,
            "category": project.category,
            "goal_amount": project.goal_amount,
            "current_amount": project.current_amount,
            "deadline": project.deadline.isoformat(),
            "image_urls": image_urls,
            "supporters_count": project.supporters_count,
            "creator_id": project.creator_id,
            "creator_name": user.display_name if user else "不明",
            "created_at": project.created_at.isoformat()
        })
    
    return result

from pydantic import BaseModel

class DonationProjectCreate(BaseModel):
    title: str
    description: str
    category: str
    goal_amount: int
    deadline: str
    media_ids: List[int] = []

@router.post("/projects")
def create_project(
    project_data: DonationProjectCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """新規寄付プロジェクトを作成（CreatePostと同じ仕様）"""
    from app.models import MediaAsset
    
    # media_idsから画像URLを取得
    image_urls = []
    if project_data.media_ids:
        for media_id in project_data.media_ids[:5]:
            media = db.query(MediaAsset).filter(MediaAsset.id == media_id).first()
            if media and media.url:
                image_urls.append(media.url)
    
    # プロジェクト作成
    project = DonationProject(
        creator_id=current_user.id,
        title=project_data.title,
        description=project_data.description,
        category=project_data.category,
        goal_amount=project_data.goal_amount,
        deadline=date.fromisoformat(project_data.deadline)
    )
    
    db.add(project)
    db.commit()
    db.refresh(project)
    
    # 画像をdonation_project_imagesテーブルに保存
    for idx, url in enumerate(image_urls):
        project_image = DonationProjectImage(
            project_id=project.id,
            image_url=url,
            display_order=idx
        )
        db.add(project_image)
    db.commit()
    
    return {
        "id": project.id,
        "title": project.title,
        "description": project.description,
        "category": project.category,
        "goal_amount": project.goal_amount,
        "current_amount": project.current_amount,
        "deadline": project.deadline.isoformat(),
        "image_urls": [],
        "supporters_count": project.supporters_count,
        "creator_name": current_user.display_name,
        "created_at": project.created_at.isoformat()
    }

@router.post("/projects/{project_id}/support")
def support_project(
    project_id: int,
    amount: int,
    message: Optional[str] = None,
    is_anonymous: bool = False,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """プロジェクトを支援"""
    
    project = db.query(DonationProject).filter(DonationProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")
    
    # 支援記録を作成
    support = DonationSupport(
        project_id=project_id,
        user_id=current_user.id,
        amount=amount,
        message=message,
        is_anonymous=is_anonymous
    )
    
    db.add(support)
    
    # プロジェクトの金額と支援者数を更新
    project.current_amount += amount
    project.supporters_count += 1
    
    db.commit()
    
    return {"message": "支援が完了しました", "amount": amount}

@router.get("/projects/{project_id}")
def get_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    """プロジェクト詳細を取得"""
    
    project = db.query(DonationProject).filter(DonationProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")
    
    user = db.query(User).filter(User.id == project.creator_id).first()
    
    # 画像を取得
    images = db.query(DonationProjectImage).filter(
        DonationProjectImage.project_id == project.id
    ).order_by(DonationProjectImage.display_order).all()
    image_urls = [img.image_url for img in images]
    
    return {
        "id": project.id,
        "title": project.title,
        "description": project.description,
        "category": project.category,
        "goal_amount": project.goal_amount,
        "current_amount": project.current_amount,
        "deadline": project.deadline.isoformat(),
        "image_urls": image_urls,
        "supporters_count": project.supporters_count,
        "creator_id": project.creator_id,
        "creator_name": user.display_name if user else "不明",
        "created_at": project.created_at.isoformat()
    }

class DonationProjectUpdate(BaseModel):
    title: str
    description: str
    category: str
    goal_amount: int
    deadline: str

@router.put("/projects/{project_id}")
def update_project(
    project_id: int,
    project_data: DonationProjectUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """プロジェクトを更新"""
    
    project = db.query(DonationProject).filter(DonationProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")
    
    if project.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="このプロジェクトを編集する権限がありません")
    
    project.title = project_data.title
    project.description = project_data.description
    project.category = project_data.category
    project.goal_amount = project_data.goal_amount
    project.deadline = date.fromisoformat(project_data.deadline)
    
    db.commit()
    db.refresh(project)
    
    # 画像を取得
    images = db.query(DonationProjectImage).filter(
        DonationProjectImage.project_id == project.id
    ).order_by(DonationProjectImage.display_order).all()
    image_urls = [img.image_url for img in images]
    
    return {
        "id": project.id,
        "title": project.title,
        "description": project.description,
        "category": project.category,
        "goal_amount": project.goal_amount,
        "current_amount": project.current_amount,
        "deadline": project.deadline.isoformat(),
        "image_urls": image_urls,
        "supporters_count": project.supporters_count,
        "creator_id": project.creator_id,
        "creator_name": current_user.display_name,
        "created_at": project.created_at.isoformat()
    }

@router.delete("/projects/{project_id}")
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """プロジェクトを削除"""
    
    project = db.query(DonationProject).filter(DonationProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")
    
    if project.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="このプロジェクトを削除する権限がありません")
    
    # 画像を削除
    db.query(DonationProjectImage).filter(DonationProjectImage.project_id == project_id).delete()
    
    # プロジェクトを削除
    db.delete(project)
    db.commit()
    
    return {"message": "プロジェクトを削除しました"}

class SupportMessageRequest(BaseModel):
    project_id: int
    amount: Optional[int] = None
    message: str

@router.post("/support-message")
def send_support_message(
    request: SupportMessageRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """支援メッセージを送信（マッチングなしで直接送信可能）"""
    from app.models import Match, Chat, Message
    
    # プロジェクトを取得
    project = db.query(DonationProject).filter(DonationProject.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")
    
    # 自分自身には送信できない
    if project.creator_id == current_user.id:
        raise HTTPException(status_code=400, detail="自分のプロジェクトには支援メッセージを送れません")
    
    # Matchを確認または作成
    a, b = sorted([current_user.id, project.creator_id])
    match = db.query(Match).filter(Match.user_a_id == a, Match.user_b_id == b).first()
    if not match:
        match = Match(user_a_id=a, user_b_id=b)
        db.add(match)
        db.commit()
        db.refresh(match)
    
    # Chatを確認または作成
    chat = db.query(Chat).filter(Chat.match_id == match.id).first()
    if not chat:
        chat = Chat(match_id=match.id)
        db.add(chat)
        db.commit()
        db.refresh(chat)
    
    # メッセージを送信
    msg = Message(chat_id=chat.id, sender_id=current_user.id, body=request.message)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    
    return {
        "success": True,
        "chat_id": chat.id,
        "message_id": msg.id
    }
