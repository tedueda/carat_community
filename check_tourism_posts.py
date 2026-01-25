#!/usr/bin/env python3
"""
ツーリズムカテゴリの投稿を確認
"""

import psycopg2
from psycopg2.extras import RealDictCursor

# データベース接続情報
DB_CONFIG = {
    'host': 'rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com',
    'port': 5432,
    'database': 'lgbtq_community',
    'user': 'dbadmin',
    'password': 'NewPassword123!',
    'sslmode': 'require'
}

def main():
    print("=== ツーリズムカテゴリの投稿確認 ===\n")
    
    try:
        # データベース接続
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        print("✅ データベース接続成功\n")
        
        # ツーリズムカテゴリの投稿を取得
        cur.execute("""
            SELECT 
                p.id,
                p.title,
                p.body,
                p.category,
                p.user_id,
                p.created_at,
                u.display_name,
                u.email
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.category = 'tourism'
            ORDER BY p.created_at DESC
        """)
        
        posts = cur.fetchall()
        
        if not posts:
            print("ツーリズムカテゴリの投稿は見つかりませんでした")
        else:
            print(f"ツーリズムカテゴリの投稿: {len(posts)}件\n")
            print("=" * 80)
            
            for i, post in enumerate(posts, 1):
                print(f"\n【投稿 {i}】")
                print(f"ID: {post['id']}")
                print(f"タイトル: {post['title']}")
                print(f"投稿者: {post['display_name']} ({post['email']})")
                print(f"投稿日時: {post['created_at']}")
                print(f"\n内容:")
                print("-" * 80)
                print(post['body'])
                print("-" * 80)
                print()
        
        # 観光情報テーブルも確認
        print("\n" + "=" * 80)
        print("観光情報テーブルの確認")
        print("=" * 80 + "\n")
        
        cur.execute("""
            SELECT 
                pt.post_id,
                pt.location,
                pt.address,
                pt.opening_hours,
                pt.price_range,
                pt.contact,
                pt.website,
                p.title
            FROM posts_tourism pt
            LEFT JOIN posts p ON pt.post_id = p.id
            ORDER BY pt.post_id DESC
        """)
        
        tourism_data = cur.fetchall()
        
        if tourism_data:
            print(f"観光情報: {len(tourism_data)}件\n")
            for data in tourism_data:
                print(f"投稿ID: {data['post_id']} - {data['title']}")
                print(f"  場所: {data['location']}")
                print(f"  住所: {data['address']}")
                print(f"  営業時間: {data['opening_hours']}")
                print(f"  価格帯: {data['price_range']}")
                print(f"  連絡先: {data['contact']}")
                print(f"  ウェブサイト: {data['website']}")
                print()
        else:
            print("観光情報データはありません")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")
        raise

if __name__ == "__main__":
    main()
