#!/bin/bash

# 開発環境用バックエンド起動スクリプト
# 正しいRDS情報を確実に使用

set -e

echo "🚀 Starting Rainbow Community Backend (Development Mode)"
echo ""

# 正しいRDS接続情報を環境変数に設定（dbadmin使用）
export DATABASE_URL="postgresql+psycopg2://dbadmin:NewPassword123!@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require"
export SECRET_KEY="rc_admin_2d7a7f0b1b1e4a20b7d239d0c2f1b5f5"
export ALGORITHM="HS256"
export ACCESS_TOKEN_EXPIRE_MINUTES="10080"
export ALLOW_ORIGINS="https://rainbow-community-app-8osff5fg.devinapps.com,http://localhost:5173,http://127.0.0.1:5173"

echo "✅ Environment variables set"
echo "📍 Region: ap-northeast-1 (Tokyo)"
echo "🗄️  Database: rainbow-community-db-tokyo"
echo ""

# 仮想環境のPythonを使用してuvicornを起動
./venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
