import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import sqlite3

load_dotenv()

def check_database_connection():
    print("=== Database Connection Check ===")
    
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./lgbtq_community.db")
    print(f"DATABASE_URL: {DATABASE_URL}")
    
    if DATABASE_URL.startswith("postgresql"):
        print("\n--- Testing PostgreSQL Connection ---")
        try:
            engine = create_engine(DATABASE_URL)
            with engine.connect() as conn:
                result = conn.execute(text("SELECT version()"))
                version = result.fetchone()[0]
                print(f"✅ PostgreSQL connected: {version}")
                
                result = conn.execute(text("SELECT COUNT(*) FROM posts"))
                count = result.fetchone()[0]
                print(f"Posts in PostgreSQL: {count}")
                
        except Exception as e:
            print(f"❌ PostgreSQL connection failed: {e}")
    
    print("\n--- Testing SQLite Connection ---")
    try:
        conn = sqlite3.connect('lgbtq_community.db')
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM posts")
        count = cursor.fetchone()[0]
        print(f"✅ SQLite connected. Posts: {count}")
        
        cursor.execute("SELECT id, title FROM posts LIMIT 3")
        posts = cursor.fetchall()
        for post in posts:
            print(f"  - {post[0]}: {post[1]}")
            
        conn.close()
        
    except Exception as e:
        print(f"❌ SQLite connection failed: {e}")

if __name__ == "__main__":
    check_database_connection()
