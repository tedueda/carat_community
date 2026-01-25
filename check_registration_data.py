#!/usr/bin/env python3
"""
新規登録時に作成されるデータを確認
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
    print("=== 新規登録時のデータ確認（ID=50: りょう） ===\n")
    
    try:
        # データベース接続
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        print("✅ データベース接続成功\n")
        
        # 1. usersテーブル（アカウント情報）
        print("=" * 80)
        print("1️⃣  usersテーブル（アカウント情報）")
        print("=" * 80 + "\n")
        
        cur.execute("""
            SELECT *
            FROM users
            WHERE id = 50
        """)
        
        user = cur.fetchone()
        
        if user:
            print("✅ usersテーブルにデータが存在します\n")
            for key, value in user.items():
                if key != 'password_hash':  # パスワードハッシュは表示しない
                    print(f"{key}: {value}")
        else:
            print("❌ usersテーブルにデータがありません")
        
        # 2. profilesテーブル（通常プロフィール）
        print("\n" + "=" * 80)
        print("2️⃣  profilesテーブル（通常プロフィール）")
        print("=" * 80 + "\n")
        
        cur.execute("""
            SELECT *
            FROM profiles
            WHERE user_id = 50
        """)
        
        profile = cur.fetchone()
        
        if profile:
            print("✅ profilesテーブルにデータが存在します\n")
            for key, value in profile.items():
                if value is not None and value != '':
                    print(f"{key}: {value}")
        else:
            print("❌ profilesテーブルにデータがありません")
            print("（新規登録時に自動作成されていない可能性があります）")
        
        # 3. matching_profilesテーブル（マッチングプロフィール）
        print("\n" + "=" * 80)
        print("3️⃣  matching_profilesテーブル（マッチングプロフィール）")
        print("=" * 80 + "\n")
        
        cur.execute("""
            SELECT *
            FROM matching_profiles
            WHERE user_id = 50
        """)
        
        matching_profile = cur.fetchone()
        
        if matching_profile:
            print("✅ matching_profilesテーブルにデータが存在します\n")
            for key, value in matching_profile.items():
                if value is not None and value != '':
                    print(f"{key}: {value}")
        else:
            print("❌ matching_profilesテーブルにデータがありません")
        
        # 4. 全ユーザーのprofilesテーブル確認
        print("\n" + "=" * 80)
        print("4️⃣  全ユーザーのprofilesテーブル確認")
        print("=" * 80 + "\n")
        
        cur.execute("""
            SELECT 
                u.id,
                u.email,
                u.display_name,
                CASE WHEN p.user_id IS NOT NULL THEN '✅ あり' ELSE '❌ なし' END as profile_exists,
                CASE WHEN mp.user_id IS NOT NULL THEN '✅ あり' ELSE '❌ なし' END as matching_profile_exists
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            LEFT JOIN matching_profiles mp ON u.id = mp.user_id
            ORDER BY u.id
        """)
        
        all_users = cur.fetchall()
        
        print("ユーザーID | メールアドレス | 通常プロフィール | マッチングプロフィール")
        print("-" * 80)
        for user in all_users:
            print(f"{user['id']:^10} | {user['email']:^30} | {user['profile_exists']:^16} | {user['matching_profile_exists']:^20}")
        
        # 5. 新規登録フローの確認
        print("\n" + "=" * 80)
        print("5️⃣  新規登録フローの分析")
        print("=" * 80 + "\n")
        
        print("【結論】")
        print(f"ユーザーID=50（りょう）の場合:")
        print(f"  • usersテーブル: {'✅ 存在' if user else '❌ なし'}")
        print(f"  • profilesテーブル: {'✅ 存在' if profile else '❌ なし'}")
        print(f"  • matching_profilesテーブル: {'✅ 存在' if matching_profile else '❌ なし'}")
        print()
        
        if not profile and matching_profile:
            print("⚠️  注意:")
            print("  通常プロフィール（profiles）は作成されていません。")
            print("  マッチングプロフィール（matching_profiles）のみ作成されています。")
            print()
            print("  これは以下のいずれかを意味します:")
            print("  1. 新規登録時にprofilesテーブルへの自動作成が行われていない")
            print("  2. ユーザーがマッチングプロフィール編集画面で手動で作成した")
        elif profile and matching_profile:
            print("✅ 両方のプロフィールが存在します")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    main()
