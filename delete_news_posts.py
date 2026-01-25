#!/usr/bin/env python3
"""
ニュース投稿を削除するスクリプト
"""
import os
import sys

# 環境変数からDATABASE_URLを取得
DATABASE_URL = "postgresql+psycopg2://dbadmin:0034caretLgbtQ@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require"

try:
    from sqlalchemy import create_engine, text
    
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # newsカテゴリの投稿を削除
        result = conn.execute(text("""
            DELETE FROM posts 
            WHERE category = 'news'
            RETURNING id, title
        """))
        
        deleted_posts = result.fetchall()
        conn.commit()
        
        print(f"\n削除された投稿数: {len(deleted_posts)}")
        for post in deleted_posts:
            print(f"  ID: {post[0]}, タイトル: {post[1]}")
        
        print("\n削除完了しました。")
        
except Exception as e:
    print(f"エラー: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
