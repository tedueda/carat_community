"""Verify that premium@test.com can authenticate with password premium123."""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.auth import authenticate_user

DATABASE_URL = os.getenv(
    'DATABASE_URL',
    'postgresql+psycopg2://dbadmin:0034caretLgbtQ@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require'
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def verify_login():
    """Test authentication with the same code the backend uses."""
    db = SessionLocal()
    try:
        print(f"🔄 Testing authentication against:")
        print(f"   {DATABASE_URL.split('@')[1].split('?')[0]}")
        print()
        
        email = 'premium@test.com'
        password = 'premium123'
        
        user = authenticate_user(db, email, password)
        
        if user:
            print(f"✅ Authentication SUCCESSFUL!")
            print(f"   User ID: {user.id}")
            print(f"   Email: {user.email}")
            print(f"   Display Name: {user.display_name}")
            print(f"   Membership Type: {user.membership_type}")
            print(f"   Is Active: {user.is_active}")
        else:
            print(f"❌ Authentication FAILED!")
            print(f"   Email: {email}")
            print(f"   Password: {password}")
            print()
            print("   This means either:")
            print("   - User doesn't exist in this database")
            print("   - Password hash doesn't match")
            
    except Exception as e:
        print(f"❌ Error during authentication test: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == '__main__':
    verify_login()
