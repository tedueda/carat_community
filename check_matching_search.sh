#!/bin/bash

# APIのベースURL
API_URL="https://ddxdewgmen.ap-northeast-1.awsapprunner.com"

echo "=== マッチング検索結果の確認 ==="
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

# マッチング検索を実行
echo "2. マッチング検索を実行中..."
SEARCH_RESPONSE=$(curl -s "$API_URL/api/matching/search?page=1&size=50" \
  -H "Authorization: Bearer $KENTA_TOKEN")

echo "$SEARCH_RESPONSE" | python3 -c "
import sys, json

try:
    data = json.load(sys.stdin)
    
    # データが配列かオブジェクトか確認
    if isinstance(data, list):
        items = data
    elif isinstance(data, dict) and 'items' in data:
        items = data['items']
    else:
        print('エラー: 予期しないレスポンス形式')
        print(f'レスポンス: {data}')
        sys.exit(1)
    
    print(f'✅ 検索結果: {len(items)}人')
    print('')
    
    if len(items) == 0:
        print('マッチング可能なユーザーが見つかりませんでした。')
    else:
        print('ユーザー一覧:')
        print('-' * 80)
        
        for i, user in enumerate(items, 1):
            print(f'{i}. ニックネーム: {user.get(\"nickname\", \"N/A\")}')
            print(f'   ユーザーID: {user.get(\"user_id\", \"N/A\")}')
            print(f'   年齢: {user.get(\"age\", \"未設定\")}')
            print(f'   居住地: {user.get(\"prefecture\", \"未設定\")}')
            print(f'   職業: {user.get(\"occupation\", \"未設定\")}')
            print(f'   血液型: {user.get(\"blood_type\", \"未設定\")}')
            print(f'   星座: {user.get(\"zodiac\", \"未設定\")}')
            print(f'   アイデンティティ: {user.get(\"identity\", \"未設定\")}')
            print(f'   自己紹介: {user.get(\"bio\", \"未設定\")}')
            print(f'   プロフィール画像: {user.get(\"avatar_url\", \"なし\")}')
            print('')
            
except json.JSONDecodeError as e:
    print(f'JSONパースエラー: {e}')
    print('Raw response:')
    print(sys.stdin.read())
except Exception as e:
    print(f'エラー: {e}')
    import traceback
    traceback.print_exc()
"
