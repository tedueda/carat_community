#!/usr/bin/env python3
"""
ニュース投稿を削除するスクリプト
"""
import sys
from sqlalchemy import create_engine, text

# 環境変数からDATABASE_URLを取得
DATABASE_URL = "postgresql+psycopg2://dbadmin:0034caretLgbtQ@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require"

try:
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # まず、現在のnewsカテゴリの投稿を確認
        result = conn.execute(text("""
            SELECT id, title, created_at 
            FROM posts 
            WHERE category = 'news'
            ORDER BY created_at DESC
        """))
        
        news_posts = result.fetchall()
        
        print(f"\n現在のニュース投稿数: {len(news_posts)}")
        for post in news_posts:
            print(f"  ID: {post[0]}, タイトル: {post[1]}, 作成日: {post[2]}")
        
        if len(news_posts) > 0:
            confirm = input("\nこれらの投稿を削除しますか？ (yes/no): ")
            if confirm.lower() == 'yes':
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
            else:
                print("削除をキャンセルしました。")
        else:
            print("\n削除対象のニュース投稿はありません。")
        
except Exception as e:
    print(f"エラー: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
