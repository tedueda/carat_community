#!/usr/bin/env python3
"""
ローカルSQLiteデータベースから投稿を確認するスクリプト
"""
import sqlite3
import json

db_path = "backend/lgbtq_community_dev.db"

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # postsテーブルの全投稿を取得
    cursor.execute("""
        SELECT id, title, body, category, subcategory, user_id, created_at, visibility
        FROM posts
        ORDER BY created_at DESC
    """)
    
    posts = cursor.fetchall()
    
    print(f"\n=== ローカルデータベース内の投稿数: {len(posts)} ===\n")
    
    # カテゴリ別に集計
    categories = {}
    for post in posts:
        cat = post[3] or 'なし'
        if cat not in categories:
            categories[cat] = 0
        categories[cat] += 1
    
    print("カテゴリ別投稿数:")
    for cat, count in sorted(categories.items()):
        print(f"  {cat}: {count}件")
    
    print("\n=== 投稿一覧 ===\n")
    for post in posts:
        post_id, title, body, category, subcategory, user_id, created_at, visibility = post
        print(f"ID: {post_id}")
        print(f"タイトル: {title or '(なし)'}")
        print(f"カテゴリ: {category or '(なし)'}")
        print(f"サブカテゴリ: {subcategory or '(なし)'}")
        print(f"本文: {body[:100]}..." if len(body) > 100 else f"本文: {body}")
        print(f"作成日: {created_at}")
        print(f"公開設定: {visibility}")
        print("-" * 80)
    
    conn.close()
    
except Exception as e:
    print(f"エラー: {e}")
