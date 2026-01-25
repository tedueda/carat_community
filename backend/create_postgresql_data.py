import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import random
from dotenv import load_dotenv

load_dotenv()

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.auth import get_password_hash

def create_postgresql_data():
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL or DATABASE_URL.startswith("sqlite"):
        print("This script is for PostgreSQL only")
        return
        
    print(f"Connecting to PostgreSQL: {DATABASE_URL}")
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        users_data = [
            ("tedyueda@gmail.com", "tedyueda2024!", "Ted Ueda", "premium"),
            ("admin@rainbow.com", "admin123", "Admin User", "admin"),
            ("anonymous@example.com", "anonymous123", "Anonymous User", "free")
        ]
        
        for email, password, display_name, membership_type in users_data:
            result = db.execute(text("SELECT id FROM users WHERE email = :email"), {"email": email})
            if not result.fetchone():
                hashed_password = get_password_hash(password)
                db.execute(text("""
                    INSERT INTO users (email, password_hash, display_name, membership_type, is_active, created_at)
                    VALUES (:email, :password_hash, :display_name, :membership_type, true, CURRENT_TIMESTAMP)
                """), {
                    "email": email,
                    "password_hash": hashed_password,
                    "display_name": display_name,
                    "membership_type": membership_type
                })
                print(f"Created user: {email}")
        
        ted_result = db.execute(text("SELECT id FROM users WHERE email = 'tedyueda@gmail.com'"))
        ted_user_id = ted_result.fetchone()[0]
        
        posts_data = [
            ("職場での理解を得るには", "職場でLGBTQ+であることを理解してもらうにはどうすればいいでしょうか？ #board", ted_user_id),
            ("カミングアウトについて相談です", "家族にカミングアウトを考えています。経験者の方、アドバイスをお願いします。 #board", ted_user_id),
            ("デジタルアートでポートレート制作", "プライドフラッグをモチーフにしたポートレートを描きました。 #art", ted_user_id),
            ("虹色の抽象画を描きました", "感情を色で表現した抽象画です。見てください！ #art", ted_user_id),
            ("プライドパレードで流れていた曲", "先日のパレードで印象的だった楽曲を共有します。 #music", ted_user_id),
            ("心に響くLGBTQ+アーティストの楽曲", "おすすめのアーティストと楽曲を紹介させてください。 #music", ted_user_id),
            ("新宿二丁目のおすすめバー", "フレンドリーな雰囲気で安心して過ごせるバーです。 #shops", ted_user_id),
            ("渋谷のLGBTQフレンドリーカフェ", "居心地の良いカフェを見つけました。ぜひ行ってみてください。 #shops", ted_user_id),
            ("東京プライドウォーク参加中", "今年のプライドウォークに参加しています！一緒に歩きませんか？ #tourism", ted_user_id),
            ("大阪のLGBTQ+スポット巡り", "大阪でLGBTQ+フレンドリーなスポットを巡るツアーを企画中です。 #tourism", ted_user_id),
            ("おすすめのBLコミック紹介", "最近読んで感動したBLコミックを紹介します。 #comics", ted_user_id),
            ("LGBTQ+テーマの映画レビュー", "心に残るLGBTQ+映画のレビューを書きました。 #comics", ted_user_id),
        ]
        
        for title, body, user_id in posts_data:
            result = db.execute(text("SELECT id FROM posts WHERE title = :title"), {"title": title})
            if not result.fetchone():
                created_at = datetime.now() - timedelta(days=random.randint(1, 7))
                db.execute(text("""
                    INSERT INTO posts (user_id, title, body, visibility, created_at, updated_at)
                    VALUES (:user_id, :title, :body, 'public', :created_at, :created_at)
                """), {
                    "user_id": user_id,
                    "title": title,
                    "body": body,
                    "created_at": created_at
                })
                print(f"Created post: {title}")
        
        db.commit()
        print("✅ PostgreSQL dummy data created successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating PostgreSQL data: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    create_postgresql_data()
