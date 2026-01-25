#!/bin/bash

# 管理者トークンを取得（実際の管理者アカウントでログインが必要）
# この方法では、有効な認証トークンが必要です

API_URL="https://ddxdewgmen.ap-northeast-1.awsapprunner.com"

# 削除する投稿ID
POST_IDS=(54 56 77)

echo "注意: この操作には有効な認証トークンが必要です"
echo "ブラウザで以下を実行してトークンを取得してください："
echo "  localStorage.getItem('token')"
echo ""
read -p "トークンを入力してください: " TOKEN

if [ -z "$TOKEN" ]; then
    echo "トークンが入力されていません。終了します。"
    exit 1
fi

echo ""
echo "投稿を削除しています..."
echo "================================"

for POST_ID in "${POST_IDS[@]}"; do
    echo "投稿ID $POST_ID を削除中..."
    RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE \
        "${API_URL}/api/posts/${POST_ID}" \
        -H "Authorization: Bearer ${TOKEN}")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
        echo "✓ 削除成功: ID $POST_ID"
    else
        echo "✗ 削除失敗: ID $POST_ID (HTTP $HTTP_CODE)"
        echo "  レスポンス: $BODY"
    fi
    echo ""
done

echo "================================"
echo "完了"
