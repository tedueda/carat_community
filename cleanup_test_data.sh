#!/bin/bash

# APIのベースURL
API_URL="https://ddxdewgmen.ap-northeast-1.awsapprunner.com"

echo "=== テストデータのクリーンアップ ==="
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

echo "2. データベースクリーンアップAPIを実行..."
echo ""
echo "⚠️  以下のデータを削除します:"
echo "   - ID=28, 49以外のユーザー"
echo "   - 関連するプロフィール"
echo "   - 関連するマッチングプロフィール"
echo "   - 関連する画像"
echo "   - 関連する投稿"
echo ""

read -p "本当に削除しますか？ (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "キャンセルしました"
    exit 0
fi

# クリーンアップAPIを呼び出し
CLEANUP_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL/api/ops/cleanup-test-data" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"keep_user_ids": [28, 49]}')

HTTP_STATUS=$(echo "$CLEANUP_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
BODY=$(echo "$CLEANUP_RESPONSE" | sed '/HTTP_STATUS:/d')

echo ""
echo "HTTPステータス: $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ クリーンアップ成功！"
    echo ""
    echo "$BODY" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print('削除されたデータ:')
    print(f'  ユーザー: {data.get(\"deleted_users\", 0)}人')
    print(f'  プロフィール: {data.get(\"deleted_profiles\", 0)}件')
    print(f'  マッチングプロフィール: {data.get(\"deleted_matching_profiles\", 0)}件')
    print(f'  画像: {data.get(\"deleted_images\", 0)}件')
    print(f'  投稿: {data.get(\"deleted_posts\", 0)}件')
    print('')
    print('残っているユーザー:')
    for user in data.get('remaining_users', []):
        print(f'  ID={user.get(\"id\")}: {user.get(\"email\")}')
except:
    print(sys.stdin.read())
"
else
    echo "❌ クリーンアップ失敗"
    echo ""
    echo "エラー詳細:"
    echo "$BODY"
fi
