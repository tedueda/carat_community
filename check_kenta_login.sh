#!/bin/bash

# APIのベースURL
API_URL="https://ddxdewgmen.ap-northeast-1.awsapprunner.com"

# ログイン情報
EMAIL="kenta.g@example.com"
PASSWORD="Kg2025aa"

echo "=== けんたさんのログインテスト ==="
echo "Email: $EMAIL"
echo "Password: $PASSWORD"
echo ""

# ログインを試行
echo "ログイン試行中..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$EMAIL&password=$PASSWORD")

# HTTPステータスコードを抽出
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

echo "HTTPステータス: $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ ログイン成功！"
    echo ""
    echo "レスポンス:"
    echo "$BODY" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f\"  アクセストークン: {data.get('access_token', 'N/A')[:50]}...\")
    print(f\"  トークンタイプ: {data.get('token_type', 'N/A')}\")
except Exception as e:
    print(f'  エラー: {e}')
    print(f'  Raw: {sys.stdin.read()}')
"
else
    echo "❌ ログイン失敗"
    echo ""
    echo "エラー詳細:"
    echo "$BODY" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f\"  エラー: {data.get('detail', 'N/A')}\")
except:
    print('  Raw response:')
    print(sys.stdin.read())
"
fi

echo ""
echo "=== データベースでユーザーを確認 ==="

# 管理者アカウントでログイン
ADMIN_EMAIL="tedyueda@gmail.com"
ADMIN_PASSWORD="tedyueda2024!"

echo "管理者アカウントでログイン中..."
ADMIN_TOKEN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$ADMIN_EMAIL&password=$ADMIN_PASSWORD" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('access_token', ''))
except:
    pass
")

if [ -n "$ADMIN_TOKEN" ]; then
    echo "✅ 管理者ログイン成功"
    echo ""
    
    # ユーザー一覧を取得してけんたさんを探す
    echo "ユーザー一覧を取得中..."
    curl -s "$API_URL/api/users/" \
      -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -c "
import sys, json
try:
    users = json.load(sys.stdin)
    kenta_users = [u for u in users if 'kenta' in u.get('email', '').lower()]
    
    if kenta_users:
        print('  けんたさんのアカウント情報:')
        for user in kenta_users:
            print(f\"    ID: {user.get('id')}\")
            print(f\"    Email: {user.get('email')}\")
            print(f\"    表示名: {user.get('display_name')}\")
            print(f\"    電話番号: {user.get('phone')}\")
            print(f\"    プレミアム会員: {user.get('is_premium')}\")
            print(f\"    アクティブ: {user.get('is_active')}\")
            print('')
    else:
        print('  ❌ けんたさんのアカウントが見つかりません')
        print('')
        print('  登録されているユーザー（最初の5件）:')
        for user in users[:5]:
            print(f\"    - {user.get('email')} ({user.get('display_name')})\")
except Exception as e:
    print(f'  エラー: {e}')
"
else
    echo "❌ 管理者ログイン失敗"
fi
