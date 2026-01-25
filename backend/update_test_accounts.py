#!/usr/bin/env python3

import os
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.database import get_db
from app.models import User
from app.auth import get_password_hash
from sqlalchemy.orm import Session

def update_test_accounts():
    """Update test accounts with specified passwords"""
    
    db = next(get_db())
    
    try:
        ted_user = db.query(User).filter(User.email == "tedyueda@gmail.com").first()
        if ted_user:
            ted_user.password_hash = get_password_hash("tedyueda0000")
            ted_user.membership_type = "premium"
            ted_user.is_active = True
            print(f"✅ Updated tedyueda@gmail.com password and confirmed premium membership")
        else:
            ted_user = User(
                email="tedyueda@gmail.com",
                password_hash=get_password_hash("tedyueda0000"),
                display_name="Ted Ueda",
                membership_type="premium",
                is_active=True
            )
            db.add(ted_user)
            print(f"✅ Created tedyueda@gmail.com with premium membership")
        
        admin_user = db.query(User).filter(User.email == "admin@rainbow.com").first()
        if admin_user:
            admin_user.password_hash = get_password_hash("abcd123")
            admin_user.membership_type = "admin"
            admin_user.is_active = True
            print(f"✅ Updated admin@rainbow.com password and confirmed admin membership")
        else:
            admin_user = User(
                email="admin@rainbow.com",
                password_hash=get_password_hash("abcd123"),
                display_name="Admin User",
                membership_type="admin",
                is_active=True
            )
            db.add(admin_user)
            print(f"✅ Created admin@rainbow.com with admin membership")
        
        db.commit()
        print(f"✅ Successfully updated test accounts in database")
        
        print("\n📋 Verification:")
        ted_verify = db.query(User).filter(User.email == "tedyueda@gmail.com").first()
        admin_verify = db.query(User).filter(User.email == "admin@rainbow.com").first()
        
        if ted_verify:
            print(f"   tedyueda@gmail.com: ID={ted_verify.id}, Membership={ted_verify.membership_type}, Active={ted_verify.is_active}")
        if admin_verify:
            print(f"   admin@rainbow.com: ID={admin_verify.id}, Membership={admin_verify.membership_type}, Active={admin_verify.is_active}")
            
    except Exception as e:
        print(f"❌ Error updating test accounts: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    update_test_accounts()
