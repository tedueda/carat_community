from __future__ import annotations
import os
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

config = context.config

# ログ設定
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# === DATABASE_URL 読み込み ===
db_url = os.getenv("DATABASE_URL") or os.getenv("DB_MIGRATE_URL")

# 開発環境では SQLite フォールバック
if not db_url:
    db_url = "sqlite:///./lgbtq_community_dev.db"
    print("⚠️  DATABASE_URL が未設定のため、開発用 SQLite を使用します", flush=True)
else:
    print(f"🔗 Using DATABASE_URL: {db_url}", flush=True)

config.set_main_option("sqlalchemy.url", db_url)

# === モデルのメタデータをインポート ===
from app.database import Base  # type: ignore
from app import models  # ensure models are imported for metadata population

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

