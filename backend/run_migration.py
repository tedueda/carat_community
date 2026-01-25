"""
マイグレーションSQL実行スクリプト
"""
import os
from app.database import SessionLocal

def run_migration():
    db = SessionLocal()
    try:
        # SQLファイルを読み込み
        with open('migrations_manual.sql', 'r', encoding='utf-8') as f:
            sql = f.read()
        
        # セミコロンで分割して個別に実行
        statements = [s.strip() for s in sql.split(';') if s.strip() and not s.strip().startswith('--')]
        
        for stmt in statements:
            if stmt and not stmt.startswith('SELECT'):
                print(f"実行中: {stmt[:80]}...")
                db.execute(stmt)
                db.commit()
        
        # 確認クエリ
        print("\n=== 確認 ===")
        result = db.execute("SELECT column_name FROM information_schema.columns WHERE table_name='matching_profiles' AND column_name IN ('avatar_url', 'meeting_style')").fetchall()
        print(f"matching_profiles カラム追加: {[r[0] for r in result]}")
        
        result = db.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_name='matching_profile_images'").scalar()
        print(f"matching_profile_images テーブル: {'存在' if result > 0 else '存在しない'}")
        
        result = db.execute("SELECT COUNT(*) FROM hobbies").scalar()
        print(f"趣味マスター件数: {result}件")
        
        print("\n✅ マイグレーション完了！")
        
    except Exception as e:
        db.rollback()
        print(f"❌ エラー: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
