#!/usr/bin/env python3
"""
マッチング検索画面の表示問題を確認
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
    print("=== マッチング検索画面の表示確認 ===\n")
    
    try:
        # データベース接続
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        print("✅ データベース接続成功\n")
        
        # 全ユーザーのマッチングプロフィールを確認
        print("=" * 80)
        print("📊 全ユーザーのマッチングプロフィール状態")
        print("=" * 80 + "\n")
        
        cur.execute("""
            SELECT 
                u.id,
                u.email,
                u.display_name,
                mp.nickname,
                mp.display_flag,
                mp.identity,
                mp.prefecture,
                mp.age_band,
                mp.created_at,
                mp.updated_at
            FROM users u
            LEFT JOIN matching_profiles mp ON u.id = mp.user_id
            ORDER BY u.id
        """)
        
        all_profiles = cur.fetchall()
        
        print(f"総ユーザー数: {len(all_profiles)}人\n")
        
        for profile in all_profiles:
            print(f"【ユーザーID: {profile['id']}】")
            print(f"メールアドレス: {profile['email']}")
            print(f"表示名: {profile['display_name']}")
            print(f"ニックネーム: {profile['nickname'] or '未設定'}")
            print(f"性志向: {profile['identity'] or '未設定'}")
            print(f"居住地: {profile['prefecture'] or '未設定'}")
            print(f"年齢帯: {profile['age_band'] or '未設定'}")
            print(f"プロフィール公開: {'✅ 公開' if profile['display_flag'] else '❌ 非公開'}")
            print(f"作成日時: {profile['created_at']}")
            print(f"更新日時: {profile['updated_at']}")
            print()
        
        # マッチング検索に表示されるユーザーを確認
        print("=" * 80)
        print("🔍 マッチング検索に表示されるユーザー（display_flag = True）")
        print("=" * 80 + "\n")
        
        cur.execute("""
            SELECT 
                u.id,
                u.display_name,
                mp.nickname,
                mp.identity,
                mp.prefecture,
                mp.age_band
            FROM users u
            INNER JOIN matching_profiles mp ON u.id = mp.user_id
            WHERE mp.display_flag = TRUE
            ORDER BY mp.updated_at DESC
        """)
        
        visible_profiles = cur.fetchall()
        
        if visible_profiles:
            print(f"✅ 表示されるユーザー: {len(visible_profiles)}人\n")
            for profile in visible_profiles:
                print(f"  • ID={profile['id']}: {profile['nickname']} ({profile['display_name']})")
                print(f"    性志向: {profile['identity']}, 居住地: {profile['prefecture']}, 年齢: {profile['age_band']}")
                print()
        else:
            print("❌ 表示されるユーザーがいません（全員 display_flag = False）")
        
        # 非公開のユーザーを確認
        print("\n" + "=" * 80)
        print("🔒 非公開のユーザー（display_flag = False）")
        print("=" * 80 + "\n")
        
        cur.execute("""
            SELECT 
                u.id,
                u.display_name,
                mp.nickname,
                mp.identity,
                mp.prefecture
            FROM users u
            INNER JOIN matching_profiles mp ON u.id = mp.user_id
            WHERE mp.display_flag = FALSE OR mp.display_flag IS NULL
            ORDER BY u.id
        """)
        
        hidden_profiles = cur.fetchall()
        
        if hidden_profiles:
            print(f"⚠️  非公開のユーザー: {len(hidden_profiles)}人\n")
            for profile in hidden_profiles:
                print(f"  • ID={profile['id']}: {profile['nickname'] or '未設定'} ({profile['display_name']})")
                print(f"    性志向: {profile['identity'] or '未設定'}, 居住地: {profile['prefecture'] or '未設定'}")
                print()
        else:
            print("✅ 非公開のユーザーはいません")
        
        # 問題の診断
        print("\n" + "=" * 80)
        print("🔧 問題の診断")
        print("=" * 80 + "\n")
        
        print("【現在の状況】")
        print(f"  • 総ユーザー数: {len(all_profiles)}人")
        print(f"  • 公開ユーザー: {len(visible_profiles)}人")
        print(f"  • 非公開ユーザー: {len(hidden_profiles)}人")
        print()
        
        if len(visible_profiles) == 1:
            print("⚠️  問題が確認されました:")
            print("  Ted Ueda（ID=28）のみが公開されています。")
            print()
            print("【原因】")
            print("  「けんた」（ID=49）と「りょう」（ID=50）の display_flag が False になっています。")
            print()
            print("【解決方法】")
            print("  1. マッチングプロフィール編集画面で「プロフィールを公開する」をONにする")
            print("  2. または、以下のSQLで一括更新:")
            print()
            print("  UPDATE matching_profiles SET display_flag = TRUE WHERE user_id IN (49, 50);")
            print()
        
        # display_flagを更新するか確認
        print("=" * 80)
        print("💡 自動修正オプション")
        print("=" * 80 + "\n")
        
        print("「けんた」と「りょう」のプロフィールを公開しますか？")
        print("  • ID=49: けんた")
        print("  • ID=50: りょう")
        print()
        
        response = input("公開する場合は 'yes' と入力してください: ")
        
        if response.lower() == 'yes':
            cur.execute("""
                UPDATE matching_profiles 
                SET display_flag = TRUE 
                WHERE user_id IN (49, 50)
            """)
            conn.commit()
            
            print("\n✅ プロフィールを公開しました！")
            print()
            
            # 更新後の状態を確認
            cur.execute("""
                SELECT 
                    u.id,
                    u.display_name,
                    mp.nickname,
                    mp.display_flag
                FROM users u
                INNER JOIN matching_profiles mp ON u.id = mp.user_id
                WHERE u.id IN (49, 50)
            """)
            
            updated = cur.fetchall()
            for profile in updated:
                print(f"  • ID={profile['id']}: {profile['nickname']} - {'✅ 公開' if profile['display_flag'] else '❌ 非公開'}")
        else:
            print("\nキャンセルしました。手動で公開設定を変更してください。")
        
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    main()
