"""Create test premium user for testing login functionality."""
import os
import sys
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from app.models import User
from app.auth import get_password_hash

DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql+psycopg2://dbadmin:0034caretLgbtQ@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require'
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def create_test_user():
    """Create premium test user if it doesn't exist."""
    db = SessionLocal()
    try:
        stmt = select(User).where(User.email == 'premium@test.com')
        existing_user = db.execute(stmt).scalar_one_or_none()
        
        if existing_user:
            print(f"✅ User premium@test.com already exists:")
            print(f"   ID: {existing_user.id}")
            print(f"   Email: {existing_user.email}")
            print(f"   Display Name: {existing_user.display_name}")
            print(f"   Membership Type: {existing_user.membership_type}")
            print(f"   Is Active: {existing_user.is_active}")
            
            existing_user.password_hash = get_password_hash('premium123')
            db.commit()
            print("✅ Password updated to 'premium123'")
        else:
            new_user = User(
                email='premium@test.com',
                display_name='Premium User',
                password_hash=get_password_hash('premium123'),
                membership_type='premium',
                is_active=True
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            print(f"✅ Created new premium test user:")
            print(f"   ID: {new_user.id}")
            print(f"   Email: {new_user.email}")
            print(f"   Display Name: {new_user.display_name}")
            print(f"   Password: premium123")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()

if __name__ == '__main__':
    create_test_user()
