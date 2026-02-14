from fastapi import FastAPI, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from sqlalchemy import text
from .database import get_db
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.routers import auth, users, profiles, posts, comments, reactions, follows, notifications, media, billing, matching, categories, ops, account, donation, salon, flea_market, jewelry, live_wedding, art_sales, courses, translations, stripe_billing
from app.database import Base, engine, get_db
import os
from pathlib import Path
import os
from sqlalchemy import text

PORT = int(os.getenv("PORT", 8000))

app = FastAPI(title="LGBTQ Community API", version="1.0.1")

@app.on_event("startup")
def run_migrations():
    """Run database migrations on startup"""
    try:
        db = next(get_db())
        # Migration 1: Add phone_number column to users table
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='phone_number'
        """))
        if not result.fetchone():
            db.execute(text("ALTER TABLE users ADD COLUMN phone_number VARCHAR(20)"))
            db.commit()
            print("✅ Successfully added phone_number column to users table")
        else:
            print("✅ phone_number column already exists")
        
        # Migration 2: Add nationality column to matching_profiles table
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='matching_profiles' AND column_name='nationality'
        """))
        if not result.fetchone():
            db.execute(text("ALTER TABLE matching_profiles ADD COLUMN nationality VARCHAR(100)"))
            db.commit()
            print("✅ Successfully added nationality column to matching_profiles table")
        else:
            print("✅ nationality column already exists")
    except Exception as e:
        print(f"⚠️ Migration error (may be safe to ignore if column exists): {e}")
    finally:
        db.close()

# S3設定 - 開発環境ではローカルストレージを使用
S3_BUCKET = os.getenv("AWS_S3_BUCKET", "rainbow-community-media-prod")
S3_REGION = os.getenv("AWS_REGION", "ap-northeast-1")
USE_S3 = os.getenv("USE_S3", "false").lower() == "true"  # デフォルトfalseに変更

# ローカルメディアディレクトリ（フォールバック）
media_base = os.getenv("MEDIA_DIR")
if not media_base:
    media_base = "/data/media" if os.path.exists("/data") else "media"
MEDIA_DIR = Path(media_base)
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

# S3使用時は/media/をS3にリダイレクト、それ以外はローカルファイル
if not USE_S3:
    app.mount("/media", StaticFiles(directory=str(MEDIA_DIR)), name="media")

matching_media_base = os.getenv("MATCHING_MEDIA_DIR")
if not matching_media_base:
    matching_media_base = "/data/matching_media" if os.path.exists("/data") else "matching_media"
MATCHING_MEDIA_DIR = Path(matching_media_base)
MATCHING_MEDIA_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/matching-media", StaticFiles(directory=str(MATCHING_MEDIA_DIR)), name="matching_media")

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins_env = os.getenv("ALLOW_ORIGINS", "")
if origins_env:
    ALLOWED_ORIGINS = [o.strip() for o in origins_env.split(",") if o.strip()]
else:
    ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://carat-community.com",
        "https://www.carat-community.com",
        "https://tedueda.github.io",
        "https://carat-rainbow-community.netlify.app",
        "https://rainbow-community-app-wg5nxt2r.devinapps.com",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure 307 redirect between with/without trailing slash
app.router.redirect_slashes = True

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(profiles.router)
app.include_router(posts.router)
app.include_router(comments.router)
app.include_router(reactions.router)
app.include_router(follows.router)
app.include_router(notifications.router)
app.include_router(media.router)
app.include_router(billing.router)
app.include_router(matching.router)
app.include_router(categories.router)
app.include_router(ops.router)
app.include_router(account.router)
app.include_router(donation.router)
app.include_router(salon.router)
app.include_router(flea_market.router)
app.include_router(jewelry.router)
app.include_router(live_wedding.router)
app.include_router(art_sales.router)
app.include_router(courses.router)
app.include_router(translations.router)
app.include_router(stripe_billing.router)

@app.on_event("startup")
def on_startup():
    try:
        db_url = os.getenv("DATABASE_URL", "")
        if "sqlite" in db_url.lower() or not db_url:
            Base.metadata.create_all(bind=engine)
        print("✅ Database initialization completed")
    except Exception as e:
        print(f"⚠️ Database initialization failed: {e}")
        print("⚠️ Application will continue without database initialization")

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.head("/healthz")
async def healthz_head():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"message": "LGBTQ Community API", "version": "1.0.0"}


@app.get("/api/health")
def health(db=Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "db": "ok"}


@app.get("/api/debug/env")
def debug_env():
    """環境変数の確認用（デバッグ）"""
    return {
        "USE_S3": USE_S3,
        "S3_BUCKET": S3_BUCKET,
        "S3_REGION": S3_REGION,
        "USE_S3_env": os.getenv("USE_S3"),
        "AWS_S3_BUCKET_env": os.getenv("AWS_S3_BUCKET"),
        "AWS_REGION_env": os.getenv("AWS_REGION")
    }


@app.get("/media/{filename:path}")
async def serve_media(filename: str):
    """S3から画像を取得するためのリダイレクト"""
    if USE_S3:
        s3_url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/media/{filename}"
        return RedirectResponse(url=s3_url, status_code=307)
    else:
        # ローカルファイルシステムにフォールバック（StaticFilesでマウント済み）
        raise HTTPException(status_code=404, detail="Media not found")


@app.get("/api/_routes")
def list_routes():
    try:
        return {
            "routes": [
                {
                    "path": getattr(r, "path", None),
                    "name": getattr(r, "name", None),
                    "methods": list(getattr(r, "methods", []) or []),
                }
                for r in app.routes
            ]
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/categories/{name}/posts")
def posts_by_category(name: str, limit: int = 20, offset: int = 0, db=Depends(get_db)):
    sql = text("""
        SELECT id, title, body, created_at
        FROM public.v_posts_by_tag
        WHERE tag = :name
        ORDER BY created_at DESC
        LIMIT :limit OFFSET :offset
    """)
    rows = db.execute(sql, {"name": name, "limit": limit, "offset": offset}).mappings().all()
    return {"items": rows, "count": len(rows)}
