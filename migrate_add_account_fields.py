#!/usr/bin/env python3
"""
データベースマイグレーション: アカウント管理用カラム追加
- users.phone_number (携帯番号)
- users.real_name (本名)
- users.is_verified (本人認証済みフラグ)
- users.two_factor_enabled (2段階認証フラグ)
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
    print("=== データベースマイグレーション: アカウント管理用カラム追加 ===\n")
    
    try:
        # データベース接続
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        print("✅ データベース接続成功\n")
        
        # 現在のusersテーブルの構造を確認
        print("📊 現在のusersテーブルの構造:")
        cur.execute("""
            SELECT column_name, data_type, character_maximum_length, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        """)
        columns = cur.fetchall()
        for col in columns:
            nullable = "NULL" if col['is_nullable'] == 'YES' else "NOT NULL"
            length = f"({col['character_maximum_length']})" if col['character_maximum_length'] else ""
            print(f"  {col['column_name']}: {col['data_type']}{length} {nullable}")
        
        print("\n🔄 マイグレーションを開始します...\n")
        
        # 1. phone_number カラムを追加
        print("1. phone_number カラムを追加...")
        cur.execute("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20)
        """)
        print("   ✅ 完了")
        
        # 2. real_name カラムを追加
        print("2. real_name カラムを追加...")
        cur.execute("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS real_name VARCHAR(100)
        """)
        print("   ✅ 完了")
        
        # 3. is_verified カラムを追加
        print("3. is_verified カラムを追加...")
        cur.execute("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE
        """)
        print("   ✅ 完了")
        
        # 4. two_factor_enabled カラムを追加
        print("4. two_factor_enabled カラムを追加...")
        cur.execute("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE
        """)
        print("   ✅ 完了")
        
        # 5. two_factor_secret カラムを追加（将来の2段階認証用）
        print("5. two_factor_secret カラムを追加...")
        cur.execute("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255)
        """)
        print("   ✅ 完了")
        
        # 6. phone_number にユニーク制約を追加（NULLは許可）
        print("6. phone_number にユニーク制約を追加...")
        cur.execute("""
            CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_number 
            ON users(phone_number) 
            WHERE phone_number IS NOT NULL
        """)
        print("   ✅ 完了")
        
        # コミット
        conn.commit()
        
        print("\n✅ マイグレーション完了\n")
        
        # 更新後のusersテーブルの構造を確認
        print("📊 更新後のusersテーブルの構造:")
        cur.execute("""
            SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        """)
        columns = cur.fetchall()
        for col in columns:
            nullable = "NULL" if col['is_nullable'] == 'YES' else "NOT NULL"
            length = f"({col['character_maximum_length']})" if col['character_maximum_length'] else ""
            default = f" DEFAULT {col['column_default']}" if col['column_default'] else ""
            print(f"  {col['column_name']}: {col['data_type']}{length} {nullable}{default}")
        
        print("\n✅ すべてのマイグレーションが正常に完了しました！")
        
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
