#!/bin/bash

# APIのベースURL
API_URL="https://ddxdewgmen.ap-northeast-1.awsapprunner.com"

echo "=== けんたさんのアカウント確認と作成 ==="
echo ""

# 管理者アカウントでログイン
ADMIN_EMAIL="tedyueda@gmail.com"
ADMIN_PASSWORD="tedyueda2024!"

echo "1. 管理者アカウントでログイン中..."
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
    echo "❌ 管理者ログイン失敗"
    exit 1
fi

echo "✅ 管理者ログイン成功"
echo ""

# けんたさんのアカウントが存在するか確認
echo "2. けんたさんのアカウントを確認中..."
KENTA_EMAIL="kenta.g@example.com"

# ユーザー登録を試みる
echo ""
echo "3. けんたさんのアカウントを作成中..."
echo "   Email: $KENTA_EMAIL"
echo "   Password: Kg2025aa"
echo "   表示名: けんた"
echo "   電話番号: 08012345678"
echo ""

REGISTER_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "kenta.g@example.com",
    "password": "Kg2025aa",
    "display_name": "けんた",
    "phone": "08012345678",
    "is_premium": true
  }')

HTTP_STATUS=$(echo "$REGISTER_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
BODY=$(echo "$REGISTER_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "HTTPステータス: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
    echo "✅ アカウント作成成功！"
    echo ""
    echo "レスポンス:"
    echo "$BODY" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f\"  ID: {data.get('id', 'N/A')}\")
    print(f\"  Email: {data.get('email', 'N/A')}\")
    print(f\"  表示名: {data.get('display_name', 'N/A')}\")
    print(f\"  プレミアム会員: {data.get('is_premium', 'N/A')}\")
except Exception as e:
    print(f'  エラー: {e}')
    print(sys.stdin.read())
"
elif [ "$HTTP_STATUS" = "400" ]; then
    echo "⚠️ アカウントは既に存在します"
    echo ""
    echo "詳細:"
    echo "$BODY" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f\"  {data.get('detail', 'N/A')}\")
except:
    print(sys.stdin.read())
"
else
    echo "❌ アカウント作成失敗"
    echo ""
    echo "エラー詳細:"
    echo "$BODY"
fi

echo ""
echo "4. ログインテスト..."
LOGIN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$KENTA_EMAIL&password=Kg2025aa")

HTTP_STATUS=$(echo "$LOGIN_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
BODY=$(echo "$LOGIN_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "HTTPステータス: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ ログイン成功！"
    echo ""
    echo "トークン情報:"
    echo "$BODY" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f\"  アクセストークン: {data.get('access_token', 'N/A')[:50]}...\")
    print(f\"  トークンタイプ: {data.get('token_type', 'N/A')}\")
except:
    print(sys.stdin.read())
"
else
    echo "❌ ログイン失敗"
    echo ""
    echo "エラー詳細:"
    echo "$BODY" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f\"  {data.get('detail', 'N/A')}\")
except:
    print(sys.stdin.read())
"
fi
