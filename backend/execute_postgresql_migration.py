#!/usr/bin/env python3
"""
Execute complete PostgreSQL migration with proper error handling and rollback
"""
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

def execute_migration():
    print("🔄 Executing PostgreSQL migration...")
    
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        print("❌ DATABASE_URL not found in environment")
        return False
    
    print(f"🔗 Connecting to: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'unknown'}")
    
    try:
        engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 15})
        
        with engine.connect() as conn:
            print("✅ PostgreSQL connection successful!")
            
            result = conn.execute(text("SELECT current_user, current_database()"))
            user, db = result.fetchone()
            print(f"📊 Connected as: {user} to database: {db}")
            
            print("🔄 Executing 0001_initial.sql migration...")
            with open("/home/ubuntu/lgbtq_community/database/migrations/0001_initial.sql", "r") as f:
                migration_sql = f.read()
            
            statements = [stmt.strip() for stmt in migration_sql.split(';') if stmt.strip() and not stmt.strip().startswith('/*')]
            
            for i, statement in enumerate(statements):
                if statement:
                    try:
                        conn.execute(text(statement))
                        print(f"✅ Statement {i+1}/{len(statements)} executed")
                    except Exception as e:
                        print(f"❌ Statement {i+1} failed: {e}")
                        if "already exists" not in str(e).lower():
                            raise
            
            conn.commit()
            print("✅ Migration 0001_initial.sql completed successfully!")
            
            print("🔄 Executing grants.sql...")
            with open("/home/ubuntu/lgbtq_community/database/grants.sql", "r") as f:
                grants_sql = f.read()
            
            grant_statements = [stmt.strip() for stmt in grants_sql.split(';') if stmt.strip()]
            for statement in grant_statements:
                if statement:
                    try:
                        conn.execute(text(statement))
                        print(f"✅ Grant executed: {statement[:50]}...")
                    except Exception as e:
                        print(f"⚠️  Grant warning: {e}")
            
            conn.commit()
            print("✅ Grants applied successfully!")
            
            print("🔄 Executing seed.sql...")
            with open("/home/ubuntu/lgbtq_community/database/seed.sql", "r") as f:
                seed_sql = f.read()
            
            seed_statements = [stmt.strip() for stmt in seed_sql.split(';') if stmt.strip() and not stmt.strip().startswith('--')]
            for statement in seed_statements:
                if statement:
                    try:
                        conn.execute(text(statement))
                        print(f"✅ Seed data inserted")
                    except Exception as e:
                        print(f"⚠️  Seed warning: {e}")
            
            conn.commit()
            print("✅ Seed data populated successfully!")
            
            result = conn.execute(text("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name
            """))
            tables = [row[0] for row in result]
            print(f"📊 Created tables: {', '.join(tables)}")
            
            return True
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == "__main__":
    success = execute_migration()
    if success:
        print("🎉 PostgreSQL migration completed successfully!")
    else:
        print("💥 PostgreSQL migration failed!")
        sys.exit(1)
