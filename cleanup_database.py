#!/usr/bin/env python3
"""
テストデータのクリーンアップスクリプト
ID=28とID=49以外のユーザーとその関連データを削除
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

KEEP_USER_IDS = [28, 49]

def main():
    print("=== テストデータのクリーンアップ ===\n")
    
    try:
        # データベース接続
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        print("✅ データベース接続成功\n")
        
        # 削除前の状態を確認
        print("📊 削除前の状態:")
        cur.execute("SELECT COUNT(*) as count FROM users")
        total_users = cur.fetchone()['count']
        print(f"  総ユーザー数: {total_users}人")
        
        cur.execute("SELECT COUNT(*) as count FROM matching_profiles")
        total_profiles = cur.fetchone()['count']
        print(f"  マッチングプロフィール数: {total_profiles}件")
        
        cur.execute("SELECT COUNT(*) as count FROM posts")
        total_posts = cur.fetchone()['count']
        print(f"  投稿数: {total_posts}件\n")
        
        # 削除対象のユーザーを表示
        print("🗑️  削除対象のユーザー:")
        cur.execute(
            "SELECT id, email, display_name FROM users WHERE id NOT IN %s ORDER BY id",
            (tuple(KEEP_USER_IDS),)
        )
        users_to_delete = cur.fetchall()
        
        if not users_to_delete:
            print("  削除対象のユーザーはいません\n")
            conn.close()
            return
        
        for user in users_to_delete:
            print(f"  ID={user['id']}: {user['email']} ({user['display_name']})")
        
        print(f"\n  合計: {len(users_to_delete)}人\n")
        
        print("⚠️  3秒後に削除を開始します...")
        import time
        time.sleep(3)
        
        print("\n🔄 削除を開始します...\n")
        
        user_ids_to_delete = tuple([u['id'] for u in users_to_delete])
        
        # トランザクション開始
        deleted_counts = {}
        
        # 1. マッチングプロフィール画像を削除
        cur.execute(
            "DELETE FROM matching_profile_images WHERE profile_id NOT IN %s",
            (tuple(KEEP_USER_IDS),)
        )
        deleted_counts['matching_profile_images'] = cur.rowcount
        
        # 2. マッチングプロフィール趣味を削除
        cur.execute(
            "DELETE FROM matching_profile_hobbies WHERE profile_id NOT IN %s",
            (tuple(KEEP_USER_IDS),)
        )
        deleted_counts['matching_profile_hobbies'] = cur.rowcount
        
        # 3. マッチングプロフィールを削除
        cur.execute(
            "DELETE FROM matching_profiles WHERE user_id NOT IN %s",
            (tuple(KEEP_USER_IDS),)
        )
        deleted_counts['matching_profiles'] = cur.rowcount
        
        # 4. プロフィールを削除
        cur.execute(
            "DELETE FROM profiles WHERE user_id NOT IN %s",
            (tuple(KEEP_USER_IDS),)
        )
        deleted_counts['profiles'] = cur.rowcount
        
        # 5. コメントを削除
        cur.execute(
            "DELETE FROM comments WHERE user_id NOT IN %s",
            (tuple(KEEP_USER_IDS),)
        )
        deleted_counts['comments'] = cur.rowcount
        
        # 6. リアクションを削除
        cur.execute(
            "DELETE FROM reactions WHERE user_id NOT IN %s",
            (tuple(KEEP_USER_IDS),)
        )
        deleted_counts['reactions'] = cur.rowcount
        
        # 7. いいねを削除
        cur.execute(
            "DELETE FROM likes WHERE from_user_id NOT IN %s OR to_user_id NOT IN %s",
            (tuple(KEEP_USER_IDS), tuple(KEEP_USER_IDS))
        )
        deleted_counts['likes'] = cur.rowcount
        
        # 8. マッチを削除
        cur.execute(
            "DELETE FROM matches WHERE user_a_id NOT IN %s OR user_b_id NOT IN %s",
            (tuple(KEEP_USER_IDS), tuple(KEEP_USER_IDS))
        )
        deleted_counts['matches'] = cur.rowcount
        
        # 9. チャットリクエストメッセージを削除（先に削除）
        cur.execute(
            "DELETE FROM chat_request_messages WHERE chat_request_id IN (SELECT id FROM chat_requests WHERE from_user_id NOT IN %s OR to_user_id NOT IN %s)",
            (tuple(KEEP_USER_IDS), tuple(KEEP_USER_IDS))
        )
        deleted_counts['chat_request_messages'] = cur.rowcount
        
        # 10. チャットリクエストを削除
        cur.execute(
            "DELETE FROM chat_requests WHERE from_user_id NOT IN %s OR to_user_id NOT IN %s",
            (tuple(KEEP_USER_IDS), tuple(KEEP_USER_IDS))
        )
        deleted_counts['chat_requests'] = cur.rowcount
        
        # 11. 投稿タグを削除（投稿に関連）
        cur.execute(
            "DELETE FROM post_tags WHERE post_id IN (SELECT id FROM posts WHERE user_id NOT IN %s)",
            (tuple(KEEP_USER_IDS),)
        )
        deleted_counts['post_tags'] = cur.rowcount
        
        # 12. 投稿メディアを削除
        cur.execute(
            "DELETE FROM post_media WHERE post_id IN (SELECT id FROM posts WHERE user_id NOT IN %s)",
            (tuple(KEEP_USER_IDS),)
        )
        deleted_counts['post_media'] = cur.rowcount
        
        # 13. 投稿観光情報を削除
        cur.execute(
            "DELETE FROM posts_tourism WHERE post_id IN (SELECT id FROM posts WHERE user_id NOT IN %s)",
            (tuple(KEEP_USER_IDS),)
        )
        deleted_counts['posts_tourism'] = cur.rowcount
        
        # 14. 投稿を削除
        cur.execute(
            "DELETE FROM posts WHERE user_id NOT IN %s",
            (tuple(KEEP_USER_IDS),)
        )
        deleted_counts['posts'] = cur.rowcount
        
        # 15. メディアアセットを削除
        cur.execute(
            "DELETE FROM media_assets WHERE user_id NOT IN %s",
            (tuple(KEEP_USER_IDS),)
        )
        deleted_counts['media_assets'] = cur.rowcount
        
        # 16. 通知を削除
        cur.execute(
            "DELETE FROM notifications WHERE user_id NOT IN %s",
            (tuple(KEEP_USER_IDS),)
        )
        deleted_counts['notifications'] = cur.rowcount
        
        # 17. ポイントイベントを削除
        cur.execute(
            "DELETE FROM point_events WHERE user_id NOT IN %s",
            (tuple(KEEP_USER_IDS),)
        )
        deleted_counts['point_events'] = cur.rowcount
        
        # 18. ユーザーアワードを削除
        cur.execute(
            "DELETE FROM user_awards WHERE user_id NOT IN %s",
            (tuple(KEEP_USER_IDS),)
        )
        deleted_counts['user_awards'] = cur.rowcount
        
        # 19. レビューを削除
        cur.execute(
            "DELETE FROM reviews WHERE user_id NOT IN %s",
            (tuple(KEEP_USER_IDS),)
        )
        deleted_counts['reviews'] = cur.rowcount
        
        # 20. フォローを削除
        cur.execute(
            "DELETE FROM follows WHERE follower_user_id NOT IN %s OR followee_user_id NOT IN %s",
            (tuple(KEEP_USER_IDS), tuple(KEEP_USER_IDS))
        )
        deleted_counts['follows'] = cur.rowcount
        
        # 21. ブロックを削除
        cur.execute(
            "DELETE FROM blocks WHERE blocker_user_id NOT IN %s OR blocked_user_id NOT IN %s",
            (tuple(KEEP_USER_IDS), tuple(KEEP_USER_IDS))
        )
        deleted_counts['blocks'] = cur.rowcount
        
        # 22. レポートを削除
        cur.execute(
            "DELETE FROM reports WHERE reporter_user_id NOT IN %s",
            (tuple(KEEP_USER_IDS),)
        )
        deleted_counts['reports'] = cur.rowcount
        
        # 23. 最後にユーザーを削除
        cur.execute(
            "DELETE FROM users WHERE id NOT IN %s",
            (tuple(KEEP_USER_IDS),)
        )
        deleted_counts['users'] = cur.rowcount
        
        # コミット
        conn.commit()
        
        print("✅ 削除完了\n")
        print("📊 削除されたデータ:")
        for table, count in deleted_counts.items():
            if count > 0:
                print(f"  {table}: {count}件")
        
        # 削除後の状態を確認
        print("\n📊 削除後の状態:")
        cur.execute("SELECT COUNT(*) as count FROM users")
        remaining_users = cur.fetchone()['count']
        print(f"  総ユーザー数: {remaining_users}人")
        
        cur.execute("SELECT COUNT(*) as count FROM matching_profiles")
        remaining_profiles = cur.fetchone()['count']
        print(f"  マッチングプロフィール数: {remaining_profiles}件")
        
        cur.execute("SELECT COUNT(*) as count FROM posts")
        remaining_posts = cur.fetchone()['count']
        print(f"  投稿数: {remaining_posts}件\n")
        
        # 残っているユーザーを表示
        print("👥 残っているユーザー:")
        cur.execute(
            "SELECT id, email, display_name, membership_type FROM users ORDER BY id"
        )
        remaining = cur.fetchall()
        for user in remaining:
            print(f"  ID={user['id']}: {user['email']} ({user['display_name']}) - {user['membership_type']}")
        
        print("\n✅ クリーンアップが正常に完了しました！")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        raise

if __name__ == "__main__":
    main()
