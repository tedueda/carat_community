#!/usr/bin/env python3
"""
ユーザー「けんた」の情報を確認するスクリプト
"""
import sys
from sqlalchemy import create_engine, text

# データベースURL
DATABASE_URL = "postgresql+psycopg2://dbadmin:0034caretLgbtQ@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require"

try:
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # メールアドレスでユーザーを検索
        result = conn.execute(text("""
            SELECT id, email, display_name, phone, is_premium, is_active, created_at, hashed_password
            FROM users 
            WHERE email = :email
        """), {"email": "kenta.g@example.com"})
        
        user = result.fetchone()
        
        if user:
            print("\n✅ ユーザーが見つかりました:")
            print(f"  ID: {user[0]}")
            print(f"  Email: {user[1]}")
            print(f"  表示名: {user[2]}")
            print(f"  電話番号: {user[3]}")
            print(f"  プレミアム会員: {user[4]}")
            print(f"  アクティブ: {user[5]}")
            print(f"  作成日: {user[6]}")
            print(f"  ハッシュ化されたパスワード: {user[7][:50]}...")
            
            # パスワードの検証
            print("\n🔐 パスワード検証:")
            print("  入力されたパスワード: Kg2025aa")
            
            # bcryptでパスワードを検証
            try:
                import bcrypt
                password_bytes = "Kg2025aa".encode('utf-8')
                hashed_bytes = user[7].encode('utf-8')
                
                if bcrypt.checkpw(password_bytes, hashed_bytes):
                    print("  ✅ パスワードが一致します")
                else:
                    print("  ❌ パスワードが一致しません")
            except Exception as e:
                print(f"  ⚠️ パスワード検証エラー: {e}")
                
        else:
            print("\n❌ ユーザーが見つかりません")
            print("  メールアドレス: kenta.g@example.com")
            
            # 類似のメールアドレスを検索
            result = conn.execute(text("""
                SELECT email, display_name 
                FROM users 
                WHERE email LIKE :pattern
                LIMIT 5
            """), {"pattern": "%kenta%"})
            
            similar_users = result.fetchall()
            if similar_users:
                print("\n  類似のユーザー:")
                for u in similar_users:
                    print(f"    - {u[0]} ({u[1]})")
        
except Exception as e:
    print(f"エラー: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
