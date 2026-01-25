#!/bin/bash

# APIのベースURL
API_URL="https://ddxdewgmen.ap-northeast-1.awsapprunner.com"

echo "=== けんたさんのプロフィール作成 ==="
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

# プロフィールを作成
echo "2. プロフィールを作成中..."
PROFILE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL/api/profiles/" \
  -H "Authorization: Bearer $KENTA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "こんにちは、けんたです。よろしくお願いします！",
    "age": 28,
    "gender": "男性",
    "sexual_orientation": "ゲイ",
    "location": "東京都",
    "occupation": "エンジニア",
    "hobbies": "旅行、映画鑑賞、カフェ巡り"
  }')

HTTP_STATUS=$(echo "$PROFILE_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
BODY=$(echo "$PROFILE_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "  HTTPステータス: $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
    echo "✅ プロフィール作成成功！"
    echo ""
    echo "プロフィール情報:"
    echo "$BODY" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f\"  ユーザーID: {data.get('user_id', 'N/A')}\")
    print(f\"  自己紹介: {data.get('bio', 'N/A')}\")
    print(f\"  年齢: {data.get('age', 'N/A')}\")
    print(f\"  性別: {data.get('gender', 'N/A')}\")
    print(f\"  性的指向: {data.get('sexual_orientation', 'N/A')}\")
    print(f\"  居住地: {data.get('location', 'N/A')}\")
    print(f\"  職業: {data.get('occupation', 'N/A')}\")
    print(f\"  趣味: {data.get('hobbies', 'N/A')}\")
except Exception as e:
    print(f'  エラー: {e}')
    print(sys.stdin.read())
"
else
    echo "❌ プロフィール作成失敗"
    echo ""
    echo "エラー詳細:"
    echo "$BODY"
fi

echo ""
echo "3. マッチングプロフィールを作成中..."
MATCHING_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL/api/matching/profile" \
  -H "Authorization: Bearer $KENTA_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "age_range_min": 25,
    "age_range_max": 35,
    "preferred_gender": "男性",
    "preferred_orientation": "ゲイ",
    "preferred_location": "東京都,神奈川県,千葉県,埼玉県",
    "is_active": true
  }')

HTTP_STATUS=$(echo "$MATCHING_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
BODY=$(echo "$MATCHING_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "  HTTPステータス: $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
    echo "✅ マッチングプロフィール作成成功！"
    echo ""
    echo "マッチングプロフィール情報:"
    echo "$BODY" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f\"  ユーザーID: {data.get('user_id', 'N/A')}\")
    print(f\"  年齢範囲: {data.get('age_range_min', 'N/A')} - {data.get('age_range_max', 'N/A')}\")
    print(f\"  希望する性別: {data.get('preferred_gender', 'N/A')}\")
    print(f\"  希望する性的指向: {data.get('preferred_orientation', 'N/A')}\")
    print(f\"  希望する居住地: {data.get('preferred_location', 'N/A')}\")
    print(f\"  マッチング有効: {data.get('is_active', 'N/A')}\")
except Exception as e:
    print(f'  エラー: {e}')
    print(sys.stdin.read())
"
else
    echo "❌ マッチングプロフィール作成失敗"
    echo ""
    echo "エラー詳細:"
    echo "$BODY"
fi

echo ""
echo "=== 完了 ==="
echo "けんたさんのプロフィールとマッチングプロフィールが作成されました。"
