#!/bin/bash

# マイグレーション実行スクリプト

set -e

echo "🔄 Running database migrations..."
echo ""

# 正しいRDS接続情報を環境変数に設定（dbadmin使用）
export DATABASE_URL='postgresql+psycopg2://dbadmin:NewPassword123!@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require'
export PYTHONPATH=$(pwd):$PYTHONPATH

echo "✅ Environment variables set"
echo "📍 Region: ap-northeast-1 (Tokyo)"
echo "🗄️  Database: rainbow-community-db-tokyo"
echo ""

# Alembicマイグレーションを実行
if [ -f "alembic.ini" ] && [ -d "alembic" ]; then
    echo "▶ Running Alembic migrations..."
    ./venv/bin/python -m alembic upgrade head
    echo "✅ Migrations completed successfully"
else
    echo "❌ Alembic configuration not found"
    exit 1
fi
