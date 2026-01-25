#!/usr/bin/env python3
"""
Reset all post likes and user carats to clean state

Usage:
    python reset_carat_likes.py

This script will:
1. Delete all post like reactions from the database
2. Reset all user carats to 0
3. Show confirmation of changes

Make sure DATABASE_URL environment variable is set or .env file exists.
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

def reset_likes():
    """Reset all post likes and user carats"""
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("❌ ERROR: DATABASE_URL environment variable not set")
        print("\nPlease set DATABASE_URL or create a .env file with:")
        print("DATABASE_URL=postgresql+psycopg2://user:password@host:5432/database?sslmode=require")
        sys.exit(1)
    
    print("Connecting to database...")
    print(f"Host: {database_url.split('@')[1].split('/')[0] if '@' in database_url else 'unknown'}")
    print()
    
    engine = create_engine(database_url)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        result = session.execute(
            text("SELECT COUNT(*) FROM reactions WHERE target_type='post' AND reaction_type='like'")
        )
        before_reactions = result.scalar()
        
        result = session.execute(
            text("SELECT COUNT(*), COALESCE(SUM(carats), 0) FROM users")
        )
        user_count, total_carats = result.fetchone()
        
        print(f"📊 Current state:")
        print(f"   - Post like reactions: {before_reactions}")
        print(f"   - Total users: {user_count}")
        print(f"   - Total carats: {total_carats}")
        print()
        
        response = input("⚠️  Are you sure you want to reset all likes and carats? (yes/no): ")
        if response.lower() != 'yes':
            print("❌ Cancelled by user")
            sys.exit(0)
        
        print("\n🔄 Resetting...")
        
        result = session.execute(
            text("DELETE FROM reactions WHERE target_type='post' AND reaction_type='like'")
        )
        deleted_reactions = result.rowcount
        print(f"   ✓ Deleted {deleted_reactions} post like reactions")
        
        result = session.execute(
            text("UPDATE users SET carats = 0 WHERE carats != 0")
        )
        updated_users = result.rowcount
        print(f"   ✓ Reset carats to 0 for {updated_users} users")
        
        session.commit()
        
        result = session.execute(
            text("SELECT COUNT(*) FROM reactions WHERE target_type='post' AND reaction_type='like'")
        )
        after_reactions = result.scalar()
        
        result = session.execute(
            text("SELECT COALESCE(SUM(carats), 0) FROM users")
        )
        after_carats = result.scalar()
        
        print()
        print("✅ Database reset complete!")
        print(f"   - Post like reactions: {after_reactions}")
        print(f"   - Total carats: {after_carats}")
        print()
        print("You can now deploy the updated code and test the carat system.")
        
    except Exception as e:
        session.rollback()
        print(f"\n❌ Error resetting database: {e}")
        sys.exit(1)
    finally:
        session.close()

if __name__ == "__main__":
    print("=" * 60)
    print("Reset Carat Likes and User Carats")
    print("=" * 60)
    print()
    reset_likes()
