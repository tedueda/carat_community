#!/usr/bin/env python3
"""
「りょう」というニックネームのユーザーを確認
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
    print("=== 「りょう」ユーザーの確認 ===\n")
    
    try:
        # データベース接続
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        print("✅ データベース接続成功\n")
        
        # 全ユーザーを確認
        print("📊 現在登録されているユーザー:")
        cur.execute("""
            SELECT 
                id,
                email,
                display_name,
                phone_number,
                real_name,
                membership_type,
                is_active,
                created_at
            FROM users
            ORDER BY id DESC
        """)
        
        all_users = cur.fetchall()
        print(f"総ユーザー数: {len(all_users)}人\n")
        
        for user in all_users:
            print(f"ID={user['id']}: {user['email']}")
            print(f"  表示名: {user['display_name']}")
            print(f"  携帯番号: {user['phone_number'] or '未設定'}")
            print(f"  本名: {user['real_name'] or '未設定'}")
            print(f"  会員タイプ: {user['membership_type']}")
            print(f"  アクティブ: {user['is_active']}")
            print(f"  登録日時: {user['created_at']}")
            print()
        
        # 「りょう」を含むユーザーを検索
        print("\n" + "=" * 80)
        print("「りょう」を含むユーザーの検索")
        print("=" * 80 + "\n")
        
        cur.execute("""
            SELECT 
                u.id,
                u.email,
                u.display_name,
                u.phone_number,
                u.real_name,
                u.membership_type,
                u.created_at,
                mp.nickname,
                mp.birth_year,
                mp.gender,
                mp.identity,
                mp.location
            FROM users u
            LEFT JOIN matching_profiles mp ON u.id = mp.user_id
            WHERE u.display_name LIKE '%りょう%'
               OR mp.nickname LIKE '%りょう%'
            ORDER BY u.created_at DESC
        """)
        
        ryo_users = cur.fetchall()
        
        if ryo_users:
            print(f"「りょう」を含むユーザー: {len(ryo_users)}人\n")
            for user in ryo_users:
                print(f"【ユーザーID: {user['id']}】")
                print(f"メールアドレス: {user['email']}")
                print(f"表示名: {user['display_name']}")
                print(f"携帯番号: {user['phone_number'] or '未設定'}")
                print(f"本名: {user['real_name'] or '未設定'}")
                print(f"会員タイプ: {user['membership_type']}")
                print(f"登録日時: {user['created_at']}")
                print(f"\nマッチングプロフィール:")
                print(f"  ニックネーム: {user['nickname'] or '未設定'}")
                print(f"  生まれ年: {user['birth_year'] or '未設定'}")
                print(f"  性別: {user['gender'] or '未設定'}")
                print(f"  性志向: {user['identity'] or '未設定'}")
                print(f"  居住地: {user['location'] or '未設定'}")
                print()
        else:
            print("「りょう」を含むユーザーは見つかりませんでした")
        
        # 最新のユーザー（直近5人）
        print("\n" + "=" * 80)
        print("最新登録ユーザー（直近5人）")
        print("=" * 80 + "\n")
        
        cur.execute("""
            SELECT 
                u.id,
                u.email,
                u.display_name,
                u.created_at,
                mp.nickname
            FROM users u
            LEFT JOIN matching_profiles mp ON u.id = mp.user_id
            ORDER BY u.created_at DESC
            LIMIT 5
        """)
        
        recent_users = cur.fetchall()
        for user in recent_users:
            print(f"ID={user['id']}: {user['email']} ({user['display_name']})")
            print(f"  ニックネーム: {user['nickname'] or '未設定'}")
            print(f"  登録日時: {user['created_at']}")
            print()
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")
        raise

if __name__ == "__main__":
    main()
