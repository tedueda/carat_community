#!/bin/bash

# APIのベースURL
API_URL="https://ddxdewgmen.ap-northeast-1.awsapprunner.com"

echo "=== 既存ユーザーのデータ構造確認 ==="
echo ""

# 管理者アカウントでログイン
ADMIN_EMAIL="tedyueda@gmail.com"
ADMIN_PASSWORD="tedyueda2024!"

echo "1. 管理者アカウントでログイン..."
ADMIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$ADMIN_EMAIL&password=$ADMIN_PASSWORD")

ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('access_token', ''))
except:
    pass
")

if [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ ログイン失敗"
    exit 1
fi

echo "✅ ログイン成功"
echo ""

# 管理者の情報を取得
echo "2. 管理者ユーザー情報を取得..."
USER_INFO=$(curl -s "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$USER_INFO" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('ユーザー情報 (users テーブル):')
    print(f'  ID: {data.get(\"id\", \"N/A\")}')
    print(f'  Email: {data.get(\"email\", \"N/A\")}')
    print(f'  表示名: {data.get(\"display_name\", \"N/A\")}')
    print(f'  会員タイプ: {data.get(\"membership_type\", \"N/A\")}')
    print(f'  アクティブ: {data.get(\"is_active\", \"N/A\")}')
    print(f'  作成日: {data.get(\"created_at\", \"N/A\")}')
    
    user_id = data.get('id')
    print(f'\n  → users.id = {user_id}')
    print(f'  → users.email = {data.get(\"email\", \"N/A\")}')
    print(f'  → users.password_hash = (暗号化済み)')
except Exception as e:
    print(f'エラー: {e}')
"

echo ""

# プロフィール情報を取得
echo "3. プロフィール情報を確認..."
PROFILE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$API_URL/api/profiles/me" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

HTTP_STATUS=$(echo "$PROFILE_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
BODY=$(echo "$PROFILE_RESPONSE" | sed '/HTTP_STATUS:/d')

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ profiles テーブルにデータあり"
    echo "$BODY" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'  user_id: {data.get(\"user_id\", \"N/A\")}')
    print(f'  handle: {data.get(\"handle\", \"N/A\")}')
    print(f'  bio: {data.get(\"bio\", \"N/A\")}')
    print(f'  avatar_url: {data.get(\"avatar_url\", \"N/A\")}')
except:
    print(sys.stdin.read())
"
else
    echo "❌ profiles テーブルにデータなし"
fi

echo ""

# マッチングプロフィール情報を取得
echo "4. マッチングプロフィール情報を確認..."
MATCHING_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$API_URL/api/matching/profiles/me" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

HTTP_STATUS=$(echo "$MATCHING_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
BODY=$(echo "$MATCHING_RESPONSE" | sed '/HTTP_STATUS:/d')

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ matching_profiles テーブルにデータあり"
    echo "$BODY" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'  user_id: {data.get(\"user_id\", \"N/A\")}')
    print(f'  nickname: {data.get(\"nickname\", \"N/A\")}')
    print(f'  prefecture: {data.get(\"prefecture\", \"N/A\")}')
    print(f'  identity: {data.get(\"identity\", \"N/A\")}')
    print(f'  display_flag: {data.get(\"display_flag\", \"N/A\")}')
except:
    print(sys.stdin.read())
"
else
    echo "❌ matching_profiles テーブルにデータなし"
fi

echo ""
echo "=== けんたさんの情報も確認 ==="
echo ""

# けんたさんでログイン
KENTA_EMAIL="kenta.g@example.com"
KENTA_PASSWORD="Kg2025aa"

echo "5. けんたさんでログイン..."
KENTA_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$KENTA_EMAIL&password=$KENTA_PASSWORD")

KENTA_TOKEN=$(echo "$KENTA_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('access_token', ''))
except:
    pass
")

if [ -z "$KENTA_TOKEN" ]; then
    echo "❌ ログイン失敗"
else
    echo "✅ ログイン成功"
    
    # けんたさんの情報を取得
    KENTA_INFO=$(curl -s "$API_URL/api/auth/me" \
      -H "Authorization: Bearer $KENTA_TOKEN")
    
    echo "$KENTA_INFO" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('\nけんたさんのユーザー情報:')
    print(f'  ID: {data.get(\"id\", \"N/A\")}')
    print(f'  Email: {data.get(\"email\", \"N/A\")}')
    print(f'  表示名: {data.get(\"display_name\", \"N/A\")}')
    print(f'  会員タイプ: {data.get(\"membership_type\", \"N/A\")}')
except:
    pass
"
fi

echo ""
echo "=== まとめ ==="
echo "既存ユーザーは users テーブルに以下の情報が保存されています:"
echo "  - users.id (内部ID)"
echo "  - users.email (ログインID)"
echo "  - users.password_hash (暗号化されたパスワード)"
echo "  - users.display_name (表示名)"
echo ""
echo "これらの情報は新しい設計でも引き続き使用できます。"
