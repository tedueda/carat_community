#!/bin/bash

# APIのベースURL
API_URL="https://ddxdewgmen.ap-northeast-1.awsapprunner.com"

echo "=== 登録ユーザー確認（簡易版） ==="
echo ""

# 管理者アカウントでログイン
ADMIN_EMAIL="tedyueda@gmail.com"
ADMIN_PASSWORD="tedyueda2024!"

echo "管理者アカウントでログイン中..."
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

echo "✅ ログイン成功"
echo ""

# 既知のテストユーザーでログインを試みる
echo "テストユーザーの確認:"
echo ""

# テストユーザーのリスト
declare -a test_users=(
    "tedyueda@gmail.com:tedyueda2024!"
    "kenta.g@example.com:Kg2025aa"
    "user1@example.com:password123"
    "user2@example.com:password123"
    "user3@example.com:password123"
    "user4@example.com:password123"
    "user5@example.com:password123"
    "user6@example.com:password123"
    "user7@example.com:password123"
    "user8@example.com:password123"
    "user9@example.com:password123"
    "user10@example.com:password123"
    "user11@example.com:password123"
    "user12@example.com:password123"
)

success_count=0
fail_count=0

for user_cred in "${test_users[@]}"; do
    IFS=':' read -r email password <<< "$user_cred"
    
    # ログイン試行
    LOGIN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL/api/auth/login" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "username=$email&password=$password" 2>/dev/null)
    
    HTTP_STATUS=$(echo "$LOGIN_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo "✅ $email - 存在"
        ((success_count++))
    else
        echo "❌ $email - 存在しない"
        ((fail_count++))
    fi
done

echo ""
echo "=== 結果 ==="
echo "登録済みユーザー: ${success_count}人"
echo "未登録ユーザー: ${fail_count}人"
echo "合計確認: $((success_count + fail_count))人"
