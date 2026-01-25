import sqlite3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.auth import get_password_hash

def create_ted_user():
    conn = sqlite3.connect('lgbtq_community.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM users WHERE email = ?", ("tedyueda@gmail.com",))
    if cursor.fetchone():
        print("Ted user already exists")
        conn.close()
        return
    
    hashed_password = get_password_hash("tedyueda2024!")
    cursor.execute("""
        INSERT INTO users (email, password_hash, display_name, membership_type, is_active)
        VALUES (?, ?, ?, ?, ?)
    """, ("tedyueda@gmail.com", hashed_password, "Ted Ueda", "premium", True))
    
    user_id = cursor.lastrowid
    
    cursor.execute("""
        INSERT INTO profiles (user_id, handle, bio, is_profile_public)
        VALUES (?, ?, ?, ?)
    """, (user_id, f"ted_ueda_{user_id}", "Caratの開発者です。よろしくお願いします！", True))
    
    conn.commit()
    conn.close()
    print("Created Ted user: tedyueda@gmail.com / tedyueda2024!")

if __name__ == "__main__":
    create_ted_user()
