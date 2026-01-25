import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.auth import get_password_hash

def create_ted_user():
    # 本番データベースURL
    DATABASE_URL = "postgresql+psycopg2://dbadmin:NewPassword123!@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require"
    
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # ユーザーが既に存在するか確認
        result = conn.execute(text("SELECT id FROM users WHERE email = :email"), {"email": "tedyueda@gmail.com"})
        if result.fetchone():
            print("Ted user already exists")
            return
        
        # パスワードをハッシュ化
        hashed_password = get_password_hash("tedyueda2024!")
        
        # ユーザーを作成
        result = conn.execute(text("""
            INSERT INTO users (email, password_hash, display_name, membership_type, is_active)
            VALUES (:email, :password_hash, :display_name, :membership_type, :is_active)
            RETURNING id
        """), {
            "email": "tedyueda@gmail.com",
            "password_hash": hashed_password,
            "display_name": "Ted Ueda",
            "membership_type": "premium",
            "is_active": True
        })
        
        user_id = result.fetchone()[0]
        
        # プロフィールを作成
        conn.execute(text("""
            INSERT INTO profiles (user_id, handle, bio, is_profile_public)
            VALUES (:user_id, :handle, :bio, :is_profile_public)
        """), {
            "user_id": user_id,
            "handle": f"ted_ueda_{user_id}",
            "bio": "Caratの開発者です。よろしくお願いします！",
            "is_profile_public": True
        })
        
        conn.commit()
        print("✅ Created Ted user: tedyueda@gmail.com / tedyueda2024!")

if __name__ == "__main__":
    create_ted_user()
