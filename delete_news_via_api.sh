#!/bin/bash

# ニュース投稿のIDを取得
NEWS_IDS=$(curl -s "https://ddxdewgmen.ap-northeast-1.awsapprunner.com/api/posts/?limit=50" | python3 -c "
import sys, json
data = json.load(sys.stdin)
news_posts = [p for p in data if p.get('category') == 'news']
for post in news_posts:
    print(post['id'])
")

echo "削除対象のニュース投稿ID:"
echo "$NEWS_IDS"

# 各投稿を削除（要認証トークン）
for id in $NEWS_IDS; do
    echo "投稿ID $id を削除中..."
    # 注意: APIで削除するには認証トークンが必要です
    # curl -X DELETE "https://ddxdewgmen.ap-northeast-1.awsapprunner.com/api/posts/$id" \
    #   -H "Authorization: Bearer YOUR_TOKEN"
done

echo "注意: API経由での削除には認証トークンが必要です。"
echo "手動でWebインターフェースから削除するか、データベースから直接削除してください。"
