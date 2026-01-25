import os
import sys
import sqlite3
from datetime import datetime, timedelta
import random
from dotenv import load_dotenv

load_dotenv()

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.auth import get_password_hash

def create_sqlite_data():
    print("Creating SQLite fallback data for deployed backend...")
    
    conn = sqlite3.connect('lgbtq_community.db')
    cursor = conn.cursor()
    
    try:
        users_data = [
            ("tedyueda@gmail.com", "tedyueda2024!", "Ted Ueda", "premium"),
            ("admin@rainbow.com", "admin123", "Admin User", "admin"),
            ("anonymous@example.com", "anonymous123", "Anonymous User", "free")
        ]
        
        for email, password, display_name, membership_type in users_data:
            cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
            if not cursor.fetchone():
                hashed_password = get_password_hash(password)
                cursor.execute("""
                    INSERT INTO users (email, password_hash, display_name, membership_type, is_active, created_at)
                    VALUES (?, ?, ?, ?, 1, datetime('now'))
                """, (email, hashed_password, display_name, membership_type))
                print(f"Created user: {email}")
        
        cursor.execute("SELECT id FROM users WHERE email = 'tedyueda@gmail.com'")
        ted_user_id = cursor.fetchone()[0]
        
        posts_data = [
            ("職場での理解を得るには", "職場でLGBTQ+であることを理解してもらうにはどうすればいいでしょうか？ #board", ted_user_id),
            ("カミングアウトについて相談です", "家族にカミングアウトを考えています。経験者の方、アドバイスをお願いします。 #board", ted_user_id),
            ("デジタルアートでポートレート制作", "プライドフラッグをモチーフにしたポートレートを描きました。 #art", ted_user_id),
            ("虹色の抽象画を描きました", "感情を色で表現した抽象画です。見てください！ #art", ted_user_id),
            ("プライドパレードで流れていた曲", "先日のパレードで印象的だった楽曲を共有します。 #music", ted_user_id),
            ("心に響くLGBTQ+アーティストの楽曲", "おすすめのアーティストと楽曲を紹介させてください。 #music", ted_user_id),
            ("新宿二丁目のおすすめバー", "フレンドリーな雰囲気で安心して過ごせるバーです。 #shops", ted_user_id),
            ("渋谷のLGBTQフレンドリーカフェ", "居心地の良いカフェを見つけました。ぜひ行ってみてください。 #shops", ted_user_id),
            ("東京プライドウォーク参加中", "今年のプライドウォークに参加しています！一緒に歩きませんか？ #tours", ted_user_id),
            ("大阪のLGBTQ+スポット巡り", "大阪でLGBTQ+フレンドリーなスポットを巡るツアーを企画中です。 #tours", ted_user_id),
            ("おすすめのBLコミック紹介", "最近読んで感動したBLコミックを紹介します。 #comics", ted_user_id),
            ("LGBTQ+テーマの映画レビュー", "心に残るLGBTQ+映画のレビューを書きました。 #comics", ted_user_id),
        ]
        
        for title, body, user_id in posts_data:
            cursor.execute("SELECT id FROM posts WHERE title = ?", (title,))
            if not cursor.fetchone():
                created_at = datetime.now() - timedelta(days=random.randint(1, 7))
                cursor.execute("""
                    INSERT INTO posts (user_id, title, body, visibility, created_at, updated_at)
                    VALUES (?, ?, ?, 'public', ?, ?)
                """, (user_id, title, body, created_at, created_at))
                print(f"Created post: {title}")
        
        conn.commit()
        print("✅ SQLite dummy data created successfully!")
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Error creating SQLite data: {e}")
        import traceback
        traceback.print_exc()
    finally:
        conn.close()

if __name__ == "__main__":
    create_sqlite_data()
