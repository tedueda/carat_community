#!/bin/bash

# APIのベースURL
API_URL="https://ddxdewgmen.ap-northeast-1.awsapprunner.com"

echo "=== 全アクティブユーザーの確認 ==="
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

# マッチング検索で表示されるユーザーを確認
echo "2. マッチング検索に表示されるユーザーを確認..."
SEARCH_RESPONSE=$(curl -s "$API_URL/api/matching/search?page=1&size=100" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$SEARCH_RESPONSE" | python3 -c "
import sys, json

try:
    data = json.load(sys.stdin)
    
    if isinstance(data, list):
        items = data
    elif isinstance(data, dict) and 'items' in data:
        items = data['items']
    else:
        items = []
    
    print(f'マッチング検索に表示されるユーザー: {len(items)}人')
    print('')
    
    # user_idでグループ化
    user_ids = set()
    for item in items:
        user_id = item.get('user_id')
        if user_id:
            user_ids.add(user_id)
    
    print(f'ユニークなユーザーID: {sorted(user_ids)}')
    print('')
    
    # 詳細表示
    print('詳細:')
    for item in items:
        user_id = item.get('user_id')
        nickname = item.get('nickname', 'N/A')
        prefecture = item.get('prefecture', '未設定')
        identity = item.get('identity', '未設定')
        print(f'  ID={user_id}: {nickname} ({prefecture}, {identity})')
    
except Exception as e:
    print(f'エラー: {e}')
    import traceback
    traceback.print_exc()
"

echo ""
echo "3. 実際にログイン可能なアカウントを確認..."
echo ""

# 既知のアカウントでログイン試行
declare -a test_accounts=(
    "tedyueda@gmail.com:tedyueda2024!:管理者(Ted)"
    "kenta.g@example.com:Kg2025aa:けんた"
)

echo "既知のアカウント:"
for account in "${test_accounts[@]}"; do
    IFS=':' read -r email password name <<< "$account"
    
    LOGIN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL/api/auth/login" \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "username=$email&password=$password" 2>/dev/null)
    
    HTTP_STATUS=$(echo "$LOGIN_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
    
    if [ "$HTTP_STATUS" = "200" ]; then
        # ユーザー情報を取得
        TOKEN=$(echo "$LOGIN_RESPONSE" | sed '/HTTP_STATUS:/d' | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('access_token', ''))
except:
    pass
")
        
        if [ -n "$TOKEN" ]; then
            USER_INFO=$(curl -s "$API_URL/api/auth/me" \
              -H "Authorization: Bearer $TOKEN")
            
            echo "$USER_INFO" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'  ✅ {data.get(\"email\")}: ID={data.get(\"id\")}, 表示名=\"{data.get(\"display_name\")}\"')
except:
    pass
"
        fi
    else
        echo "  ❌ $email: ログイン失敗"
    fi
done

echo ""
echo "=== まとめ ==="
echo ""
echo "有効なアカウント（ログイン可能）:"
echo "  1. ID=28: tedyueda@gmail.com (管理者)"
echo "  2. ID=49: kenta.g@example.com (けんた)"
echo ""
echo "その他のユーザー（ID=17, 31-41など）:"
echo "  - マッチング検索には表示される"
echo "  - ログイン情報は不明（テストデータの可能性）"
echo "  - ニックネームが未設定（N/A）"
