import sqlite3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.auth import get_password_hash

def create_admin_user():
    conn = sqlite3.connect('lgbtq_community.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM users WHERE email = ?", ("admin@rainbow.com",))
    if cursor.fetchone():
        print("Admin user already exists")
        conn.close()
        return
    
    hashed_password = get_password_hash("admin123")
    cursor.execute("""
        INSERT INTO users (email, password_hash, display_name, membership_type, is_active)
        VALUES (?, ?, ?, ?, ?)
    """, ("admin@rainbow.com", hashed_password, "Admin User", "admin", True))
    
    user_id = cursor.lastrowid
    
    cursor.execute("""
        INSERT INTO profiles (user_id, handle, bio, is_profile_public)
        VALUES (?, ?, ?, ?)
    """, (user_id, f"admin_{user_id}", "Carat Administrator", True))
    
    conn.commit()
    conn.close()
    print("Created admin user: admin@rainbow.com / admin123")

if __name__ == "__main__":
    create_admin_user()
