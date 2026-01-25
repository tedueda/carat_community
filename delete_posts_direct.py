#!/usr/bin/env python3
"""
特定の投稿を削除するスクリプト（直接実行用）
"""
import sys
import os

# 削除する投稿ID
POST_IDS_TO_DELETE = [54, 56, 77]

# データベース接続情報
DB_CONFIG = {
    'host': 'rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com',
    'database': 'lgbtq_community',
    'user': 'dbadmin',
    'password': '0034caretLgbtQ',
    'port': 5432
}

try:
    # psycopg2をインポート
    try:
        import psycopg2
    except ImportError:
        print("psycopg2がインストールされていません。")
        print("以下のコマンドでインストールしてください：")
        print("pip3 install psycopg2-binary --break-system-packages")
        sys.exit(1)
    
    # データベースに接続
    conn = psycopg2.connect(**DB_CONFIG, sslmode='require')
    cursor = conn.cursor()
    
    print("データベースに接続しました。")
    print(f"削除対象: {POST_IDS_TO_DELETE}")
    print("-" * 80)
    
    # 投稿を削除
    for post_id in POST_IDS_TO_DELETE:
        cursor.execute(
            "DELETE FROM posts WHERE id = %s RETURNING id, title",
            (post_id,)
        )
        result = cursor.fetchone()
        if result:
            print(f"✓ 削除: ID {result[0]} - {result[1]}")
        else:
            print(f"✗ 投稿ID {post_id} は見つかりませんでした")
    
    # コミット
    conn.commit()
    cursor.close()
    conn.close()
    
    print("-" * 80)
    print("削除完了しました。")
    
except Exception as e:
    print(f"エラー: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
