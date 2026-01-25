import sqlite3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.auth import get_password_hash

def create_dummy_premium_user():
    conn = sqlite3.connect('lgbtq_community.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM users WHERE email = ?", ("premium@test.com",))
    if cursor.fetchone():
        print("Dummy premium user already exists")
        conn.close()
        return
    
    hashed_password = get_password_hash("premium123")
    cursor.execute("""
        INSERT INTO users (email, password_hash, display_name, membership_type, is_active)
        VALUES (?, ?, ?, ?, ?)
    """, ("premium@test.com", hashed_password, "Premium User", "premium", True))
    
    user_id = cursor.lastrowid
    
    cursor.execute("""
        INSERT INTO profiles (user_id, handle, bio, is_profile_public)
        VALUES (?, ?, ?, ?)
    """, (user_id, f"premium_user_{user_id}", "テスト用プレミアムユーザーです", True))
    
    conn.commit()
    conn.close()
    print("Created dummy premium user: premium@test.com / premium123")

if __name__ == "__main__":
    create_dummy_premium_user()
