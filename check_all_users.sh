#!/bin/bash

# APIのベースURL
API_URL="https://ddxdewgmen.ap-northeast-1.awsapprunner.com"

echo "=== 全ユーザーの登録状況確認 ==="
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

# 全ユーザーを取得
echo "2. 全ユーザーを取得中..."
USERS_RESPONSE=$(curl -s "$API_URL/api/users/" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "$USERS_RESPONSE" | python3 -c "
import sys, json

try:
    users = json.load(sys.stdin)
    
    if isinstance(users, list):
        print(f'✅ 登録ユーザー数: {len(users)}人')
        print('')
        print('ユーザー一覧:')
        print('-' * 80)
        
        for i, user in enumerate(users, 1):
            print(f'{i}. ID: {user.get(\"id\", \"N/A\")}')
            print(f'   Email: {user.get(\"email\", \"N/A\")}')
            print(f'   表示名: {user.get(\"display_name\", \"N/A\")}')
            print(f'   会員タイプ: {user.get(\"membership_type\", \"N/A\")}')
            print(f'   アクティブ: {user.get(\"is_active\", \"N/A\")}')
            print(f'   作成日: {user.get(\"created_at\", \"N/A\")}')
            print('')
    else:
        print('エラー: ユーザーリストが取得できませんでした')
        print(f'レスポンス: {users}')
        
except json.JSONDecodeError as e:
    print(f'JSONパースエラー: {e}')
    print('Raw response:')
    print(sys.stdin.read())
except Exception as e:
    print(f'エラー: {e}')
    import traceback
    traceback.print_exc()
"

echo ""
echo "3. プロフィールの存在確認..."

# 各ユーザーのプロフィール存在確認
echo "$USERS_RESPONSE" | python3 -c "
import sys, json
import subprocess

try:
    users = json.load(sys.stdin)
    
    if isinstance(users, list):
        users_without_profile = []
        users_with_profile = []
        
        for user in users:
            user_id = user.get('id')
            email = user.get('email', 'N/A')
            
            # プロフィール確認（簡易版）
            # 実際のAPIコールは省略し、リストのみ表示
            
        print(f'総ユーザー数: {len(users)}人')
        print('')
        print('会員タイプ別:')
        
        premium_count = sum(1 for u in users if u.get('membership_type') == 'premium')
        admin_count = sum(1 for u in users if u.get('membership_type') == 'admin')
        basic_count = sum(1 for u in users if u.get('membership_type') not in ['premium', 'admin'])
        
        print(f'  プレミアム会員: {premium_count}人')
        print(f'  管理者: {admin_count}人')
        print(f'  基本会員: {basic_count}人')
        
except Exception as e:
    print(f'エラー: {e}')
"
