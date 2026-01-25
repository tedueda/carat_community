from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Profile, MatchingProfile, MatchingProfileImage, Post, MediaAsset
from sqlalchemy import text
import os

router = APIRouter(prefix="/api/ops", tags=["ops"])


@router.post("/run_migration")
def run_migration(
    db: Session = Depends(get_db),
    x_admin_secret: str | None = Header(default=None, alias="X-Admin-Secret"),
):
    # Safety guard: require both env flag and admin secret header
    if os.getenv("ALLOW_MIGRATION_API", "false").lower() != "true":
        raise HTTPException(status_code=403, detail="migration_api_disabled")
    admin_secret = os.getenv("ADMIN_SECRET")
    if not admin_secret or x_admin_secret != admin_secret:
        raise HTTPException(status_code=401, detail="unauthorized")

    # 1) Columns
    db.execute(text("ALTER TABLE matching_profiles ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500)"))
    db.execute(text("ALTER TABLE matching_profiles ADD COLUMN IF NOT EXISTS meeting_style VARCHAR(50)"))

    # 2) Data backfill
    db.execute(text(
        """
        UPDATE matching_profiles
        SET meeting_style = meet_pref
        WHERE meet_pref IS NOT NULL AND meeting_style IS NULL
        """
    ))

    # 3) Images table
    db.execute(text(
        """
        CREATE TABLE IF NOT EXISTS matching_profile_images (
            id SERIAL PRIMARY KEY,
            profile_id INTEGER NOT NULL REFERENCES matching_profiles(user_id) ON DELETE CASCADE,
            image_url VARCHAR(500) NOT NULL,
            display_order INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            CONSTRAINT unique_profile_order UNIQUE (profile_id, display_order),
            CONSTRAINT check_order_range CHECK (display_order >= 0 AND display_order < 5)
        )
        """
    ))
    db.execute(text("CREATE INDEX IF NOT EXISTS idx_profile_images_profile_id ON matching_profile_images(profile_id)"))

    # 4) Donation tables
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS donation_projects (
            id SERIAL PRIMARY KEY,
            creator_id INTEGER NOT NULL REFERENCES users(id),
            title VARCHAR(200) NOT NULL,
            description TEXT NOT NULL,
            category VARCHAR(50) NOT NULL,
            goal_amount INTEGER NOT NULL,
            current_amount INTEGER NOT NULL DEFAULT 0,
            deadline DATE NOT NULL,
            supporters_count INTEGER NOT NULL DEFAULT 0,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    """))
    
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS donation_project_images (
            id SERIAL PRIMARY KEY,
            project_id INTEGER NOT NULL REFERENCES donation_projects(id) ON DELETE CASCADE,
            image_url VARCHAR(500) NOT NULL,
            display_order INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    """))
    
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS donation_supports (
            id SERIAL PRIMARY KEY,
            project_id INTEGER NOT NULL REFERENCES donation_projects(id),
            user_id INTEGER NOT NULL REFERENCES users(id),
            amount INTEGER NOT NULL,
            message TEXT,
            is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    """))
    
    db.execute(text("CREATE INDEX IF NOT EXISTS ix_donation_projects_creator_id ON donation_projects(creator_id)"))
    db.execute(text("CREATE INDEX IF NOT EXISTS ix_donation_project_images_project_id ON donation_project_images(project_id)"))
    db.execute(text("CREATE INDEX IF NOT EXISTS ix_donation_supports_project_id ON donation_supports(project_id)"))

    # 5) Posts table funding columns
    db.execute(text("ALTER TABLE posts ADD COLUMN IF NOT EXISTS goal_amount INTEGER DEFAULT 0"))
    db.execute(text("ALTER TABLE posts ADD COLUMN IF NOT EXISTS current_amount INTEGER DEFAULT 0"))
    db.execute(text("ALTER TABLE posts ADD COLUMN IF NOT EXISTS deadline DATE"))

    # 6) Hobbies seed (idempotent)
    hobbies = [
        '料理','グルメ','カフェ巡り','お酒・バー','お菓子作り',
        '旅行','温泉','ドライブ','バイク','キャンプ','登山','釣り','海・ビーチ',
        'スポーツ観戦','ランニング','筋トレ','ヨガ','ダンス','サイクリング',
        '音楽鑑賞','楽器','カラオケ','DJ',
        '映画','海外ドラマ','アニメ','マンガ','コスプレ','ゲーム','ボードゲーム',
        'アート','写真','デザイン','ファッション','手芸・DIY',
        '読書','語学','プログラミング','テクノロジー',
        'ペット','ガーデニング','ボランティア','その他'
    ]
    for name in hobbies:
        db.execute(text("INSERT INTO hobbies (name) VALUES (:n) ON CONFLICT (name) DO NOTHING"), {"n": name})

    db.commit()
    return {"status": "ok"}


@router.post("/cleanup-test-data")
def cleanup_test_data(
    payload: dict,
    db: Session = Depends(get_db),
    x_admin_secret: str | None = Header(default=None, alias="X-Admin-Secret"),
):
    """テストデータをクリーンアップ（指定されたユーザーID以外を削除）"""
    # Safety guard
    if os.getenv("ALLOW_MIGRATION_API", "false").lower() != "true":
        raise HTTPException(status_code=403, detail="migration_api_disabled")
    admin_secret = os.getenv("ADMIN_SECRET")
    if not admin_secret or x_admin_secret != admin_secret:
        raise HTTPException(status_code=401, detail="unauthorized")
    
    keep_user_ids = payload.get("keep_user_ids", [])
    
    if not keep_user_ids:
        raise HTTPException(status_code=400, detail="keep_user_ids is required")
    
    # 削除対象のユーザーIDを取得
    users_to_delete = db.query(User).filter(~User.id.in_(keep_user_ids)).all()
    user_ids_to_delete = [u.id for u in users_to_delete]
    
    # カウント用
    deleted_users = len(user_ids_to_delete)
    deleted_profiles = 0
    deleted_matching_profiles = 0
    deleted_images = 0
    deleted_posts = 0
    
    if user_ids_to_delete:
        # 関連データを削除
        # 1. マッチングプロフィール画像
        deleted_images = db.query(MatchingProfileImage).filter(
            MatchingProfileImage.profile_id.in_(user_ids_to_delete)
        ).delete(synchronize_session=False)
        
        # 2. マッチングプロフィール
        deleted_matching_profiles = db.query(MatchingProfile).filter(
            MatchingProfile.user_id.in_(user_ids_to_delete)
        ).delete(synchronize_session=False)
        
        # 3. プロフィール
        deleted_profiles = db.query(Profile).filter(
            Profile.user_id.in_(user_ids_to_delete)
        ).delete(synchronize_session=False)
        
        # 4. 投稿
        deleted_posts = db.query(Post).filter(
            Post.user_id.in_(user_ids_to_delete)
        ).delete(synchronize_session=False)
        
        # 5. メディアアセット
        db.query(MediaAsset).filter(
            MediaAsset.user_id.in_(user_ids_to_delete)
        ).delete(synchronize_session=False)
        
        # 6. ユーザー
        db.query(User).filter(
            User.id.in_(user_ids_to_delete)
        ).delete(synchronize_session=False)
        
        db.commit()
    
    # 残っているユーザーを取得
    remaining_users = db.query(User).all()
    
    return {
        "status": "ok",
        "deleted_users": deleted_users,
        "deleted_profiles": deleted_profiles,
        "deleted_matching_profiles": deleted_matching_profiles,
        "deleted_images": deleted_images,
        "deleted_posts": deleted_posts,
        "remaining_users": [
            {"id": u.id, "email": u.email, "display_name": u.display_name}
            for u in remaining_users
        ]
    }
