#!/bin/bash

# APIのベースURL
API_URL="https://ddxdewgmen.ap-northeast-1.awsapprunner.com"

# ログイン情報
EMAIL="tedyueda@gmail.com"
PASSWORD="tedyueda2024!"

echo "ログイン中..."
# ログインしてトークンを取得
TOKEN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$EMAIL&password=$PASSWORD")

echo "Token Response: $TOKEN_RESPONSE"

# トークンを抽出
TOKEN=$(echo $TOKEN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))")

if [ -z "$TOKEN" ]; then
    echo "エラー: ログインに失敗しました"
    exit 1
fi

echo "ログイン成功"
echo "トークン: ${TOKEN:0:20}..."

# ニュース投稿のIDを取得
echo -e "\nニュース投稿を取得中..."
NEWS_POSTS=$(curl -s "$API_URL/api/posts/?limit=100" \
  -H "Authorization: Bearer $TOKEN")

echo "取得した投稿データ:"
echo "$NEWS_POSTS" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    news_posts = [p for p in data if p.get('category') == 'news']
    print(f'ニュース投稿数: {len(news_posts)}')
    for post in news_posts:
        print(f\"  ID: {post['id']}, タイトル: {post.get('title', 'タイトルなし')}\")
        print(f\"    作成日: {post.get('created_at', 'N/A')}\")
except Exception as e:
    print(f'エラー: {e}')
    print('Raw data:', sys.stdin.read())
"

# ニュース投稿のIDを配列に格納
NEWS_IDS=$(echo "$NEWS_POSTS" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    news_posts = [p for p in data if p.get('category') == 'news']
    for post in news_posts:
        print(post['id'])
except:
    pass
")

if [ -z "$NEWS_IDS" ]; then
    echo "削除対象のニュース投稿はありません"
    exit 0
fi

echo -e "\n削除対象のニュース投稿ID:"
echo "$NEWS_IDS"

# 確認
read -p "これらの投稿を削除しますか？ (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "削除をキャンセルしました"
    exit 0
fi

# 各投稿を削除
for id in $NEWS_IDS; do
    echo "投稿ID $id を削除中..."
    RESPONSE=$(curl -s -X DELETE "$API_URL/api/posts/$id" \
      -H "Authorization: Bearer $TOKEN")
    echo "  レスポンス: $RESPONSE"
done

echo -e "\n削除完了しました"
