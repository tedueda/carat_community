#!/usr/bin/env python3
"""
Create 2 dummy comments per post (36 total comments) for Carat
"""

import psycopg2
from datetime import datetime, timedelta
import random

DB_CONFIG = {
    'host': 'rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com',
    'port': 5432,
    'database': 'lgbtq_community',
    'user': 'dbadmin',
    'password': 'NewPassword123!',
    'sslmode': 'require'
}

COMMENT_TEMPLATES = [
    "素晴らしい投稿ですね！とても参考になりました。",
    "私も同じような経験があります。共感できる内容でした。",
    "とても勇気をもらえる投稿でした。ありがとうございます。",
    "詳しい情報をありがとうございます。とても助かりました。",
    "素敵な作品ですね！才能を感じます。",
    "このような場所があることを知れて良かったです。",
    "心に響く内容でした。シェアしてくださってありがとうございます。",
    "とても興味深い話ですね。もっと詳しく聞きたいです。",
    "同じ気持ちです。一人じゃないと思えて嬉しいです。",
    "貴重な体験談をありがとうございます。勉強になりました。"
]

def create_dummy_comments():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        print("Connected to PostgreSQL database")
        
        cur.execute("SELECT COUNT(*) FROM comments")
        initial_count = cur.fetchone()[0]
        print(f"Initial comment count: {initial_count}")
        
        cur.execute("SELECT id FROM posts ORDER BY id")
        post_ids = [row[0] for row in cur.fetchall()]
        print(f"Found {len(post_ids)} posts")
        
        user_ids = [1, 6, 8]
        
        comments_created = 0
        for post_id in post_ids:
            for i in range(2):
                user_id = user_ids[comments_created % len(user_ids)]
                comment_body = COMMENT_TEMPLATES[comments_created % len(COMMENT_TEMPLATES)]
                
                created_at = datetime.now() - timedelta(
                    hours=random.randint(1, 48),
                    minutes=random.randint(0, 59)
                )
                
                cur.execute("""
                    INSERT INTO comments (post_id, user_id, body, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id
                """, (post_id, user_id, comment_body, created_at, created_at))
                
                comment_id = cur.fetchone()[0]
                comments_created += 1
                
                print(f"  Created comment {comments_created}: Post {post_id}, User {user_id}, Comment ID {comment_id}")
        
        conn.commit()
        
        cur.execute("SELECT COUNT(*) FROM comments")
        final_count = cur.fetchone()[0]
        print(f"\nFinal comment count: {final_count}")
        print(f"Comments created: {comments_created}")
        
        cur.close()
        conn.close()
        
        print(f"\nSuccessfully created {comments_created} dummy comments!")
        return True
        
    except Exception as e:
        print(f"Error creating dummy comments: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    create_dummy_comments()
