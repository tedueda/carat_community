#!/usr/bin/env python3
"""
けんたさんのプロフィールをデータベースに直接作成するスクリプト
"""
import sys
from sqlalchemy import create_engine, text

# データベースURL
DATABASE_URL = "postgresql+psycopg2://dbadmin:0034caretLgbtQ@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require"

try:
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # けんたさんのユーザーIDを取得
        result = conn.execute(text("""
            SELECT id FROM users WHERE email = :email
        """), {"email": "kenta.g@example.com"})
        
        user = result.fetchone()
        
        if not user:
            print("❌ けんたさんのユーザーが見つかりません")
            sys.exit(1)
        
        user_id = user[0]
        print(f"✅ ユーザーID: {user_id}")
        print("")
        
        # プロフィールが既に存在するか確認
        result = conn.execute(text("""
            SELECT id FROM profiles WHERE user_id = :user_id
        """), {"user_id": user_id})
        
        existing_profile = result.fetchone()
        
        if existing_profile:
            print("⚠️ プロフィールは既に存在します")
            print(f"  プロフィールID: {existing_profile[0]}")
        else:
            # プロフィールを作成
            conn.execute(text("""
                INSERT INTO profiles (user_id, handle, bio, created_at, updated_at)
                VALUES (:user_id, :handle, :bio, NOW(), NOW())
            """), {
                "user_id": user_id,
                "handle": f"user_{user_id}",
                "bio": "こんにちは、けんたです。よろしくお願いします！"
            })
            print("✅ プロフィールを作成しました")
        
        print("")
        
        # マッチングプロフィールが既に存在するか確認
        result = conn.execute(text("""
            SELECT id FROM matching_profiles WHERE user_id = :user_id
        """), {"user_id": user_id})
        
        existing_matching = result.fetchone()
        
        if existing_matching:
            print("⚠️ マッチングプロフィールは既に存在します")
            print(f"  マッチングプロフィールID: {existing_matching[0]}")
        else:
            # マッチングプロフィールを作成
            conn.execute(text("""
                INSERT INTO matching_profiles (
                    user_id, nickname, display_flag, prefecture, 
                    created_at, updated_at
                )
                VALUES (
                    :user_id, :nickname, :display_flag, :prefecture,
                    NOW(), NOW()
                )
            """), {
                "user_id": user_id,
                "nickname": "けんた",
                "display_flag": True,
                "prefecture": "東京都"
            })
            print("✅ マッチングプロフィールを作成しました")
        
        conn.commit()
        
        print("")
        print("=== 完了 ===")
        print("プロフィールデータの作成が完了しました。")
        
except Exception as e:
    print(f"エラー: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
