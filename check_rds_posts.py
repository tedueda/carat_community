#!/usr/bin/env python3
"""
RDSデータベースから投稿を確認するスクリプト
"""
import os
from sqlalchemy import create_engine, text

# RDS接続情報
DATABASE_URL = "postgresql+psycopg2://dbadmin:0034caretLgbtQ@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require"

try:
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # postsテーブルの全投稿を取得
        result = conn.execute(text("""
            SELECT id, title, body, category, subcategory, user_id, created_at, visibility
            FROM posts
            ORDER BY created_at DESC
        """))
        
        posts = result.fetchall()
        
        print(f"\n=== RDSデータベース内の投稿数: {len(posts)} ===\n")
        
        # カテゴリ別に集計
        categories = {}
        for post in posts:
            cat = post[3] or 'なし'
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(post)
        
        print("カテゴリ別投稿数:")
        for cat, posts_list in sorted(categories.items()):
            print(f"  {cat}: {len(posts_list)}件")
        
        print("\n=== カテゴリ別投稿詳細 ===\n")
        
        # 掲示板、お店、ツーリズムの投稿を表示
        target_categories = ['board', 'shops', 'tourism']
        
        for cat in target_categories:
            if cat in categories:
                print(f"\n--- {cat} の投稿 ---")
                for post in categories[cat]:
                    post_id, title, body, category, subcategory, user_id, created_at, visibility = post
                    print(f"ID: {post_id}")
                    print(f"タイトル: {title or '(なし)'}")
                    print(f"サブカテゴリ: {subcategory or '(なし)'}")
                    body_preview = body[:100] + "..." if len(body) > 100 else body
                    print(f"本文: {body_preview}")
                    print(f"作成日: {created_at}")
                    print(f"公開設定: {visibility}")
                    print("-" * 60)
            else:
                print(f"\n--- {cat} の投稿: 0件 ---")
        
        # すべてのカテゴリの投稿を表示
        print("\n=== すべての投稿 ===\n")
        for post in posts:
            post_id, title, body, category, subcategory, user_id, created_at, visibility = post
            print(f"ID: {post_id} | カテゴリ: {category or '(なし)'} | タイトル: {title or '(なし)'}")
    
except Exception as e:
    print(f"エラー: {e}")
    import traceback
    traceback.print_exc()
