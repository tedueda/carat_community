from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# ローカル開発では .env を読み込むが、本番環境の環境変数を上書きしない
# override=False により、既存の環境変数（App Runner等で設定）が優先される
load_dotenv(override=False)

DATABASE_URL = os.getenv("DATABASE_URL")
FLY_APP = os.getenv("FLY_APP_NAME")

# 本番(Fly)では必ず PostgreSQL を要求し、未設定なら起動失敗
if FLY_APP and not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required in production (Fly)")

# ローカルや非本番では SQLite フォールバック（/data があれば永続化）
if not DATABASE_URL:
    sqlite_path = "/data/lgbtq_community.db" if os.path.exists("/data") else "./lgbtq_community.db"
    DATABASE_URL = f"sqlite:///{sqlite_path}"

# ✅ ログ出力は純粋なURLを変数から参照して表示だけ
print("🔄 Using database URL:")
print(DATABASE_URL, flush=True)

# ✅ SQLAlchemyにはURL文字列そのものを渡す（装飾文字列を含めない）
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

