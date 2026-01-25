#!/bin/bash

# APIのベースURL
API_URL="https://ddxdewgmen.ap-northeast-1.awsapprunner.com"

echo "=== けんたさんのプロフィールデータ確認 ==="
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

# ユーザー情報を取得
echo "2. ユーザー情報を取得中..."
USER_INFO=$(curl -s "$API_URL/api/auth/me" \
  -H "Authorization: Bearer $KENTA_TOKEN")

USER_ID=$(echo "$USER_INFO" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('id', ''))
except:
    pass
")

echo "  ユーザーID: $USER_ID"
echo ""

# プロフィール情報を取得
echo "3. プロフィール情報を取得中..."
PROFILE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$API_URL/api/profiles/$USER_ID" \
  -H "Authorization: Bearer $KENTA_TOKEN")

HTTP_STATUS=$(echo "$PROFILE_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
BODY=$(echo "$PROFILE_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "  HTTPステータス: $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ プロフィールが存在します"
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
    print(f\"  プロフィール画像: {data.get('profile_image_url', 'N/A')}\")
    print(f\"  作成日: {data.get('created_at', 'N/A')}\")
    print(f\"  更新日: {data.get('updated_at', 'N/A')}\")
except Exception as e:
    print(f'  エラー: {e}')
    print(sys.stdin.read())
"
elif [ "$HTTP_STATUS" = "404" ]; then
    echo "❌ プロフィールが存在しません"
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
    echo "⚠️ エラーが発生しました"
    echo ""
    echo "詳細:"
    echo "$BODY"
fi

echo ""
echo "4. マッチングプロフィールを確認中..."
MATCHING_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$API_URL/api/matching/profile" \
  -H "Authorization: Bearer $KENTA_TOKEN")

HTTP_STATUS=$(echo "$MATCHING_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
BODY=$(echo "$MATCHING_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "  HTTPステータス: $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ マッチングプロフィールが存在します"
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
elif [ "$HTTP_STATUS" = "404" ]; then
    echo "❌ マッチングプロフィールが存在しません"
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
    echo "⚠️ エラーが発生しました"
    echo ""
    echo "詳細:"
    echo "$BODY"
fi
