#!/usr/bin/env python3
"""
特定の投稿を削除するスクリプト
"""
import os
import sys

# 環境変数からDATABASE_URLを取得
DATABASE_URL = "postgresql+psycopg2://dbadmin:0034caretLgbtQ@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require"

# 削除する投稿ID
POST_IDS_TO_DELETE = [56, 54, 77]  # Rainbow Festa 2024, 同性パートナーシップ制度, 職場でのLGBTQ+理解促進セミナー

try:
    from sqlalchemy import create_engine, text
    
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # 投稿を削除
        for post_id in POST_IDS_TO_DELETE:
            result = conn.execute(text("""
                DELETE FROM posts 
                WHERE id = :post_id
                RETURNING id, title
            """), {"post_id": post_id})
            
            deleted_post = result.fetchone()
            if deleted_post:
                print(f"削除: ID {deleted_post[0]} - {deleted_post[1]}")
            else:
                print(f"投稿ID {post_id} は見つかりませんでした")
        
        conn.commit()
        
        print("\n削除完了しました。")
        
except Exception as e:
    print(f"エラー: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
