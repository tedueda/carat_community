#!/usr/bin/env python3
"""Delete a user from the database by email.

Usage: poetry run python delete_user.py <email>
"""
import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

def delete_user_by_email(email: str):
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL environment variable not set")
        return False
    
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        result = db.execute(
            text("SELECT id, email, display_name FROM users WHERE email = :email"),
            {"email": email}
        )
        user = result.fetchone()
        
        if not user:
            print(f"❌ User with email '{email}' not found in database")
            return False
        
        print(f"Found user: ID={user[0]}, Email={user[1]}, Name={user[2]}")
        print(f"Deleting user and all related data...")
        
        db.execute(text("DELETE FROM user_awards WHERE user_id = :user_id"), {"user_id": user[0]})
        db.execute(text("DELETE FROM point_events WHERE user_id = :user_id"), {"user_id": user[0]})
        db.execute(text("DELETE FROM blocks WHERE blocker_user_id = :user_id OR blocked_user_id = :user_id"), {"user_id": user[0]})
        db.execute(text("DELETE FROM reports WHERE reporter_user_id = :user_id"), {"user_id": user[0]})
        db.execute(text("DELETE FROM notifications WHERE user_id = :user_id"), {"user_id": user[0]})
        db.execute(text("DELETE FROM reactions WHERE user_id = :user_id"), {"user_id": user[0]})
        db.execute(text("DELETE FROM follows WHERE follower_user_id = :user_id OR followee_user_id = :user_id"), {"user_id": user[0]})
        db.execute(text("DELETE FROM post_tags WHERE post_id IN (SELECT id FROM posts WHERE user_id = :user_id)"), {"user_id": user[0]})
        db.execute(text("DELETE FROM post_media WHERE post_id IN (SELECT id FROM posts WHERE user_id = :user_id)"), {"user_id": user[0]})
        db.execute(text("DELETE FROM comments WHERE user_id = :user_id OR post_id IN (SELECT id FROM posts WHERE user_id = :user_id)"), {"user_id": user[0]})
        db.execute(text("DELETE FROM posts WHERE user_id = :user_id"), {"user_id": user[0]})
        db.execute(text("DELETE FROM reviews WHERE user_id = :user_id"), {"user_id": user[0]})
        db.execute(text("DELETE FROM profiles WHERE user_id = :user_id"), {"user_id": user[0]})
        db.execute(text("DELETE FROM media_assets WHERE user_id = :user_id"), {"user_id": user[0]})
        db.execute(text("DELETE FROM users WHERE id = :user_id"), {"user_id": user[0]})
        
        db.commit()
        
        verify = db.execute(
            text("SELECT COUNT(*) FROM users WHERE email = :email"),
            {"email": email}
        )
        count = verify.fetchone()[0]
        
        if count == 0:
            print(f"✅ Successfully deleted user '{email}' and all related data")
            return True
        else:
            print(f"❌ Failed to delete user '{email}'")
            return False
            
    except Exception as e:
        db.rollback()
        print(f"❌ Error deleting user: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: poetry run python delete_user.py <email>")
        sys.exit(1)
    
    email = sys.argv[1]
    success = delete_user_by_email(email)
    sys.exit(0 if success else 1)
