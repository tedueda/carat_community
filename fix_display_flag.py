#!/usr/bin/env python3
"""
けんたとりょうのプロフィールを公開する
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
    print("=== プロフィール公開設定の更新 ===\n")
    
    try:
        # データベース接続
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        print("✅ データベース接続成功\n")
        
        # 更新前の状態を確認
        print("📊 更新前の状態:")
        cur.execute("""
            SELECT 
                u.id,
                u.display_name,
                mp.nickname,
                mp.display_flag
            FROM users u
            INNER JOIN matching_profiles mp ON u.id = mp.user_id
            WHERE u.id IN (49, 50)
            ORDER BY u.id
        """)
        
        before = cur.fetchall()
        for profile in before:
            status = '✅ 公開' if profile['display_flag'] else '❌ 非公開'
            print(f"  • ID={profile['id']}: {profile['nickname']} ({profile['display_name']}) - {status}")
        
        # display_flagを更新
        print("\n🔄 プロフィールを公開中...")
        cur.execute("""
            UPDATE matching_profiles 
            SET display_flag = TRUE 
            WHERE user_id IN (49, 50)
        """)
        
        affected_rows = cur.rowcount
        conn.commit()
        
        print(f"✅ {affected_rows}件のプロフィールを更新しました\n")
        
        # 更新後の状態を確認
        print("📊 更新後の状態:")
        cur.execute("""
            SELECT 
                u.id,
                u.display_name,
                mp.nickname,
                mp.display_flag
            FROM users u
            INNER JOIN matching_profiles mp ON u.id = mp.user_id
            WHERE u.id IN (49, 50)
            ORDER BY u.id
        """)
        
        after = cur.fetchall()
        for profile in after:
            status = '✅ 公開' if profile['display_flag'] else '❌ 非公開'
            print(f"  • ID={profile['id']}: {profile['nickname']} ({profile['display_name']}) - {status}")
        
        # 全体の公開状況を確認
        print("\n" + "=" * 80)
        print("📊 全ユーザーの公開状況")
        print("=" * 80 + "\n")
        
        cur.execute("""
            SELECT 
                u.id,
                u.display_name,
                mp.nickname,
                mp.display_flag,
                mp.identity,
                mp.prefecture
            FROM users u
            INNER JOIN matching_profiles mp ON u.id = mp.user_id
            ORDER BY u.id
        """)
        
        all_users = cur.fetchall()
        
        public_count = 0
        for profile in all_users:
            status = '✅ 公開' if profile['display_flag'] else '❌ 非公開'
            if profile['display_flag']:
                public_count += 1
            print(f"  • ID={profile['id']}: {profile['nickname']} ({profile['display_name']}) - {status}")
            print(f"    性志向: {profile['identity']}, 居住地: {profile['prefecture']}")
            print()
        
        print(f"📊 公開ユーザー数: {public_count}/{len(all_users)}人")
        print()
        print("✅ マッチング検索画面に3人全員が表示されるようになりました！")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    main()
