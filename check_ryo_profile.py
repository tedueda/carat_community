#!/usr/bin/env python3
"""
りょうさんのマッチングプロフィールを確認
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import json

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
    print("=== りょうさんのマッチングプロフィール確認 ===\n")
    
    try:
        # データベース接続
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        print("✅ データベース接続成功\n")
        
        # ID=50のユーザー情報を取得
        cur.execute("""
            SELECT 
                id,
                email,
                display_name,
                phone_number,
                real_name,
                membership_type,
                is_verified,
                created_at
            FROM users
            WHERE id = 50
        """)
        
        user = cur.fetchone()
        
        if not user:
            print("❌ ユーザーID=50が見つかりません")
            return
        
        print("👤 ユーザー情報:")
        print(f"ID: {user['id']}")
        print(f"メールアドレス: {user['email']}")
        print(f"表示名: {user['display_name']}")
        print(f"携帯番号: {user['phone_number'] or '未設定'}")
        print(f"本名: {user['real_name'] or '未設定'}")
        print(f"会員タイプ: {user['membership_type']}")
        print(f"本人認証: {'✅ 済' if user['is_verified'] else '❌ 未'}")
        print(f"登録日時: {user['created_at']}")
        
        # マッチングプロフィールを取得
        print("\n" + "=" * 80)
        print("📋 マッチングプロフィール")
        print("=" * 80 + "\n")
        
        cur.execute("""
            SELECT *
            FROM matching_profiles
            WHERE user_id = 50
        """)
        
        profile = cur.fetchone()
        
        if not profile:
            print("❌ マッチングプロフィールが見つかりません")
        else:
            print("✅ マッチングプロフィールが存在します\n")
            
            # すべてのカラムを表示
            print("【全カラム情報】")
            for key, value in profile.items():
                if value is not None and value != '':
                    print(f"{key}: {value}")
        
        # マッチングプロフィール画像を取得
        print("\n" + "=" * 80)
        print("📷 プロフィール画像")
        print("=" * 80 + "\n")
        
        cur.execute("""
            SELECT 
                id,
                image_url,
                display_order
            FROM matching_profile_images
            WHERE profile_id = 50
            ORDER BY display_order
        """)
        
        images = cur.fetchall()
        
        if not images:
            print("❌ プロフィール画像が登録されていません")
        else:
            print(f"✅ プロフィール画像: {len(images)}枚\n")
            for img in images:
                print(f"  [{img['display_order'] + 1}] {img['image_url']}")
        
        # 趣味を取得
        print("\n" + "=" * 80)
        print("🎯 趣味")
        print("=" * 80 + "\n")
        
        cur.execute("""
            SELECT h.name
            FROM matching_profile_hobbies mph
            JOIN hobbies h ON mph.hobby_id = h.id
            WHERE mph.profile_id = 50
            ORDER BY h.name
        """)
        
        hobbies = cur.fetchall()
        
        if not hobbies:
            print("❌ 趣味が登録されていません")
        else:
            print(f"✅ 趣味: {len(hobbies)}個\n")
            for hobby in hobbies:
                print(f"  • {hobby['name']}")
        
        cur.close()
        conn.close()
        
        print("\n" + "=" * 80)
        print("✅ 確認完了")
        print("=" * 80)
        
    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == "__main__":
    main()
