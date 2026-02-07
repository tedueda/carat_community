#!/usr/bin/env python3
"""
Migration script to add Stripe and KYC fields to users table.
Also sets is_legacy_paid=True for existing users (created before Phase2).
"""

import os
import sys
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.database import engine

PHASE2_CUTOFF_DATE = datetime(2026, 2, 7)  # Phase2 deployment date

def run_migration():
    """Add Stripe/KYC columns and set legacy flag for existing users."""
    
    columns_to_add = [
        ("stripe_customer_id", "VARCHAR(255)"),
        ("stripe_subscription_id", "VARCHAR(255)"),
        ("subscription_status", "VARCHAR(50)"),
        ("kyc_status", "VARCHAR(50) DEFAULT 'UNVERIFIED'"),
        ("stripe_identity_verification_session_id", "VARCHAR(255)"),
        ("is_legacy_paid", "BOOLEAN DEFAULT FALSE"),
        ("preferred_lang", "VARCHAR(10) DEFAULT 'ja'"),
        ("residence_country", "VARCHAR(10)"),
        ("terms_accepted_at", "TIMESTAMP WITH TIME ZONE"),
        ("terms_version", "VARCHAR(50)"),
    ]
    
    with engine.connect() as conn:
        # Check and add each column
        for col_name, col_type in columns_to_add:
            try:
                # Check if column exists
                result = conn.execute(text(f"""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='users' AND column_name='{col_name}'
                """))
                
                if not result.fetchone():
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                    print(f"Added column: {col_name}")
                else:
                    print(f"Column already exists: {col_name}")
            except Exception as e:
                print(f"Error adding column {col_name}: {e}")
        
        # Create index on stripe_customer_id if not exists
        try:
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id 
                ON users(stripe_customer_id)
            """))
            print("Created index on stripe_customer_id")
        except Exception as e:
            print(f"Error creating index: {e}")
        
        # Set is_legacy_paid=True for existing users (created before Phase2)
        try:
            result = conn.execute(text("""
                UPDATE users 
                SET is_legacy_paid = TRUE 
                WHERE created_at < :cutoff_date 
                AND (is_legacy_paid IS NULL OR is_legacy_paid = FALSE)
            """), {"cutoff_date": PHASE2_CUTOFF_DATE})
            
            print(f"Set is_legacy_paid=True for {result.rowcount} existing users")
        except Exception as e:
            print(f"Error setting legacy flag: {e}")
        
        conn.commit()
        print("Migration completed successfully!")

if __name__ == "__main__":
    run_migration()
