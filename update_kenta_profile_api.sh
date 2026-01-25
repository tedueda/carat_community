#!/bin/bash

# APIのベースURL
API_URL="https://ddxdewgmen.ap-northeast-1.awsapprunner.com"

echo "=== けんたさんのプロフィールをAPIで更新 ==="
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

# プロフィールを更新（存在しない場合はエラーになる）
echo "2. プロフィールを更新中..."
UPDATE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "$API_URL/api/profiles/me" \
  -H "Authorization: Bearer $KENTA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "こんにちは、けんたです。よろしくお願いします！",
    "location": "東京都",
    "hobbies": "旅行、映画鑑賞、カフェ巡り"
  }')

HTTP_STATUS=$(echo "$UPDATE_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
BODY=$(echo "$UPDATE_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "  HTTPステータス: $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ プロフィール更新成功！"
    echo ""
    echo "$BODY" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f\"  ユーザーID: {data.get('user_id', 'N/A')}\")
    print(f\"  自己紹介: {data.get('bio', 'N/A')}\")
    print(f\"  居住地: {data.get('location', 'N/A')}\")
    print(f\"  趣味: {data.get('hobbies', 'N/A')}\")
except:
    print(sys.stdin.read())
"
elif [ "$HTTP_STATUS" = "404" ]; then
    echo "❌ プロフィールが存在しないため更新できません"
    echo ""
    echo "詳細:"
    echo "$BODY"
else
    echo "⚠️ エラーが発生しました"
    echo ""
    echo "詳細:"
    echo "$BODY"
fi
