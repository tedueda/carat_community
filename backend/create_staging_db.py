from sqlalchemy import create_engine, text

admin_url = "postgresql+psycopg2://dbadmin:NewPassword123!@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/postgres?sslmode=require"

engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")
with engine.connect() as conn:
    result = conn.execute(text("SELECT 1 FROM pg_database WHERE datname='lgbtq_staging'"))
    exists = result.fetchone()
    
    if not exists:
        conn.execute(text("CREATE DATABASE lgbtq_staging"))
        print("✅ Created lgbtq_staging database")
    else:
        print("ℹ️  lgbtq_staging database already exists")
