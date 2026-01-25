from datetime import timedelta, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models import User, Profile, MatchingProfile
from app.schemas import UserCreate, User as UserSchema, Token, PhoneVerificationRequest, PhoneVerificationConfirm, UserRegistrationStep1
from app.auth import authenticate_user, create_access_token, get_password_hash, get_current_active_user, get_current_admin_user, ACCESS_TOKEN_EXPIRE_MINUTES
from app.sms_service import sms_service
import random
import os
import logging

router = APIRouter(prefix="/api/auth", tags=["authentication"])

PHONE_AUTH_ENABLED = os.getenv("PHONE_AUTH_ENABLED", "false").lower() == "true"

@router.get("/health")
async def auth_health():
    """Health check endpoint for authentication service - no authentication required"""
    return {"status": "ok", "service": "authentication"}

@router.post("/send-verification-code")
async def send_verification_code(request: PhoneVerificationRequest, db: Session = Depends(get_db)):
    """携帯番号にSMS認証コードを送信"""
    if not PHONE_AUTH_ENABLED:
        raise HTTPException(status_code=501, detail="Phone authentication is not enabled")
    
    # 携帯番号の形式をバリデーション
    if not sms_service.validate_phone_number(request.phone_number):
        raise HTTPException(
            status_code=400,
            detail="無効な携帯番号形式です"
        )
    
    # 携帯番号をフォーマット
    formatted_phone = sms_service.format_phone_number(request.phone_number)
    
    # 既存ユーザーチェック
    existing_user = db.query(User).filter(User.phone_number == formatted_phone).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="この携帯番号は既に登録されています"
        )
    
    # 認証コード生成
    verification_code = sms_service.generate_verification_code()
    expires_at = datetime.utcnow() + timedelta(minutes=5)  # 5分間有効
    
    # SMS送信
    if not sms_service.send_verification_sms(formatted_phone, verification_code):
        raise HTTPException(
            status_code=500,
            detail="SMS送信に失敗しました"
        )
    
    # 一時的にセッションに保存（実際の実装では Redis や DB の一時テーブルを使用）
    # ここでは簡易的にユーザーレコードを作成して認証コードを保存
    temp_user = db.query(User).filter(User.phone_number == formatted_phone).first()
    if not temp_user:
        temp_user = User(
            phone_number=formatted_phone,
            email="temp@temp.com",  # 一時的なメール
            password_hash="temp",   # 一時的なパスワード
            display_name="temp",    # 一時的な表示名
            phone_verification_code=verification_code,
            phone_verification_expires=expires_at,
            is_active=False  # 認証完了まで非アクティブ
        )
        db.add(temp_user)
    else:
        temp_user.phone_verification_code = verification_code
        temp_user.phone_verification_expires = expires_at
    
    db.commit()
    
    return {"message": "認証コードを送信しました", "expires_in": 300}

@router.post("/verify-phone")
async def verify_phone(request: PhoneVerificationConfirm, db: Session = Depends(get_db)):
    """携帯番号の認証コードを確認"""
    if not PHONE_AUTH_ENABLED:
        raise HTTPException(status_code=501, detail="Phone authentication is not enabled")
    
    formatted_phone = sms_service.format_phone_number(request.phone_number)
    
    # ユーザー検索
    user = db.query(User).filter(User.phone_number == formatted_phone).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="認証コードが見つかりません"
        )
    
    # 認証コードチェック
    if user.phone_verification_code != request.verification_code:
        raise HTTPException(
            status_code=400,
            detail="認証コードが正しくありません"
        )
    
    # 有効期限チェック
    if user.phone_verification_expires < datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="認証コードの有効期限が切れています"
        )
    
    # 認証完了
    user.phone_verified = True
    user.phone_verification_code = None
    user.phone_verification_expires = None
    db.commit()
    
    return {"message": "携帯番号の認証が完了しました"}

@router.post("/register-with-phone", response_model=UserSchema)
async def register_with_phone(user_data: UserRegistrationStep1, db: Session = Depends(get_db)):
    """携帯番号認証後のユーザー登録"""
    if not PHONE_AUTH_ENABLED:
        raise HTTPException(status_code=501, detail="Phone authentication is not enabled")
    
    formatted_phone = sms_service.format_phone_number(user_data.phone_number)
    
    # メールアドレス重複チェック
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="このメールアドレスは既に使用されています"
        )
    
    # 認証済みユーザーを検索、なければ新規作成
    user = db.query(User).filter(User.phone_number == formatted_phone).first()
    
    if user:
        # 既存ユーザーの場合は情報を更新
        if not user.phone_verified:
            raise HTTPException(
                status_code=400,
                detail="携帯番号の認証が完了していません"
            )
        user.email = user_data.email
        user.password_hash = get_password_hash(user_data.password)
        user.display_name = user_data.display_name
        user.is_active = True
        user.membership_type = "premium"
    else:
        # 新規ユーザー作成（開発環境用：認証をスキップ）
        user = User(
            phone_number=formatted_phone,
            email=user_data.email,
            password_hash=get_password_hash(user_data.password),
            display_name=user_data.display_name,
            is_active=True,
            membership_type="premium",
            phone_verified=True  # 開発環境用
        )
        db.add(user)
        db.flush()  # IDを取得するため
    
    db.commit()
    db.refresh(user)
    
    # プロフィール作成（既存チェック）
    existing_profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not existing_profile:
        db_profile = Profile(
            user_id=user.id,
            handle=f"user_{user.id}"
        )
        db.add(db_profile)
        db.commit()
    
    # マッチングプロフィール作成（ニックネームに表示名を設定）
    existing_matching_profile = db.query(MatchingProfile).filter(MatchingProfile.user_id == user.id).first()
    if not existing_matching_profile:
        matching_profile = MatchingProfile(
            user_id=user.id,
            nickname=user_data.display_name,  # 表示名をニックネームに設定
            display_flag=True,
            prefecture="未設定"
        )
        db.add(matching_profile)
        db.commit()
    
    return user

@router.post("/register", response_model=UserSchema)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Email-based user registration"""
    # メールアドレスの重複チェック
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    
    db_user = User(
        email=user.email,
        password_hash=hashed_password,
        display_name=user.display_name,
        phone_number=user.phone_number,
        membership_type="premium"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    db_profile = Profile(
        user_id=db_user.id,
        handle=f"user_{db_user.id}"
    )
    db.add(db_profile)
    
    db_matching_profile = MatchingProfile(
        user_id=db_user.id,
        display_flag=True,  # デフォルトで公開
        prefecture='未設定'
    )
    db.add(db_matching_profile)
    
    db.commit()
    
    return db_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserSchema)
async def read_users_me(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Get avatar URL from matching_profiles or profiles
    from app.models import MatchingProfile, Profile
    avatar_url = None
    matching_profile = db.query(MatchingProfile).filter(MatchingProfile.user_id == current_user.id).first()
    if matching_profile and matching_profile.avatar_url:
        avatar_url = matching_profile.avatar_url
    else:
        profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
        if profile and profile.avatar_url:
            avatar_url = profile.avatar_url
    
    user_dict = {
        "id": current_user.id,
        "email": current_user.email,
        "display_name": current_user.display_name,
        "nickname": current_user.display_name,  # Use display_name as fallback
        "membership_type": current_user.membership_type,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
        "avatar_url": avatar_url
    }
    
    return user_dict

@router.get("/admin/users", response_model=List[UserSchema])
async def get_all_users(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    return users

@router.get("/admin/posts")
async def get_all_posts(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    from app.models import Post
    posts = db.query(Post).all()
    return posts

@router.get("/admin/stats")
async def get_user_stats(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    return {
        "total_users": total_users,
        "active_users": active_users
    }

@router.post("/fix-meeting-style")
def fix_meeting_style_column(db: Session = Depends(get_db)):
    """meeting_styleカラムを削除（緊急対応用）"""
    try:
        db.execute(text("ALTER TABLE matching_profiles DROP COLUMN IF EXISTS meeting_style"))
        db.commit()
        return {"status": "success", "message": "meeting_style column dropped"}
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}

@router.post("/add-phone-number-column")
def add_phone_number_column(db: Session = Depends(get_db)):
    """phone_numberカラムを追加（緊急対応用）"""
    try:
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20)"))
        db.commit()
        return {"status": "success", "message": "phone_number column added successfully"}
    except Exception as e:
        db.rollback()
        return {"status": "error", "message": str(e)}
