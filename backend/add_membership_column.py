import sqlite3
import os

def add_membership_column():
    db_path = 'lgbtq_community.db'
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'membership_type' not in columns:
        print("Adding membership_type column to users table...")
        cursor.execute("ALTER TABLE users ADD COLUMN membership_type VARCHAR(20) DEFAULT 'premium'")
        conn.commit()
        print("Successfully added membership_type column")
    else:
        print("membership_type column already exists")
    
    conn.close()

if __name__ == "__main__":
    add_membership_column()
