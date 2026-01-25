#!/bin/bash

# PostgreSQLに接続して古いニュース投稿を削除
PGPASSWORD='0034caretLgbtQ' psql -h rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com -U dbadmin -d lgbtq_community -c "DELETE FROM posts WHERE id IN (54, 56, 77);"

echo "削除完了"
