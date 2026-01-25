#!/bin/bash

# APIのベースURL
API_URL="https://ddxdewgmen.ap-northeast-1.awsapprunner.com"

echo "=== けんたさんをプレミアム会員に設定 ==="
echo ""

# けんたさんでログイン
KENTA_EMAIL="kenta.g@example.com"
KENTA_PASSWORD="Kg2025aa"

echo "1. けんたさんでログイン中..."
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
    exit 1
fi

echo "✅ ログイン成功"
echo ""

# 現在のユーザー情報を取得
echo "2. 現在のユーザー情報を取得中..."
USER_INFO=$(curl -s "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $KENTA_TOKEN")

echo "$USER_INFO" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f\"  ID: {data.get('id', 'N/A')}\")
    print(f\"  Email: {data.get('email', 'N/A')}\")
    print(f\"  表示名: {data.get('display_name', 'N/A')}\")
    print(f\"  電話番号: {data.get('phone', 'N/A')}\")
    print(f\"  プレミアム会員: {data.get('is_premium', 'N/A')}\")
    print(f\"  会員タイプ: {data.get('membership_type', 'N/A')}\")
    print(f\"  アクティブ: {data.get('is_active', 'N/A')}\")
except Exception as e:
    print(f'  エラー: {e}')
    print(sys.stdin.read())
"

echo ""
echo "3. プレミアム会員ステータスを更新中..."

# プロフィールを更新してプレミアム会員に設定
UPDATE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "$API_URL/api/users/me" \
  -H "Authorization: Bearer $KENTA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "is_premium": true,
    "membership_type": "premium"
  }')

HTTP_STATUS=$(echo "$UPDATE_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
BODY=$(echo "$UPDATE_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "HTTPステータス: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ プレミアム会員に設定成功！"
    echo ""
    echo "更新後の情報:"
    echo "$BODY" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f\"  プレミアム会員: {data.get('is_premium', 'N/A')}\")
    print(f\"  会員タイプ: {data.get('membership_type', 'N/A')}\")
except:
    print(sys.stdin.read())
"
else
    echo "⚠️ 更新に失敗しました"
    echo ""
    echo "詳細:"
    echo "$BODY"
fi

echo ""
echo "4. 最終確認..."
FINAL_INFO=$(curl -s "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $KENTA_TOKEN")

echo "$FINAL_INFO" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f\"  ID: {data.get('id', 'N/A')}\")
    print(f\"  Email: {data.get('email', 'N/A')}\")
    print(f\"  表示名: {data.get('display_name', 'N/A')}\")
    print(f\"  プレミアム会員: {data.get('is_premium', 'N/A')}\")
    print(f\"  会員タイプ: {data.get('membership_type', 'N/A')}\")
except:
    print(sys.stdin.read())
"
