#!/usr/bin/env python3
"""
ジュエリー商品テーブルに新しいカラムを追加するマイグレーションスクリプト
"""
import sys
import os

# プロジェクトのルートディレクトリをPythonパスに追加
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.database import engine

def migrate():
    """新しいカラムを追加"""
    with engine.connect() as conn:
        try:
            # product_code カラムを追加
            conn.execute(text("""
                ALTER TABLE jewelry_products 
                ADD COLUMN IF NOT EXISTS product_code VARCHAR(50)
            """))
            print("✅ product_code カラムを追加しました")
        except Exception as e:
            print(f"⚠️ product_code: {e}")

        try:
            # shipping_fee カラムを追加
            conn.execute(text("""
                ALTER TABLE jewelry_products 
                ADD COLUMN IF NOT EXISTS shipping_fee INTEGER DEFAULT 0
            """))
            print("✅ shipping_fee カラムを追加しました")
        except Exception as e:
            print(f"⚠️ shipping_fee: {e}")

        try:
            # has_certificate カラムを追加
            conn.execute(text("""
                ALTER TABLE jewelry_products 
                ADD COLUMN IF NOT EXISTS has_certificate BOOLEAN DEFAULT FALSE
            """))
            print("✅ has_certificate カラムを追加しました")
        except Exception as e:
            print(f"⚠️ has_certificate: {e}")

        try:
            # has_gem_id カラムを追加
            conn.execute(text("""
                ALTER TABLE jewelry_products 
                ADD COLUMN IF NOT EXISTS has_gem_id BOOLEAN DEFAULT FALSE
            """))
            print("✅ has_gem_id カラムを追加しました")
        except Exception as e:
            print(f"⚠️ has_gem_id: {e}")

        try:
            # is_sold_out カラムを追加
            conn.execute(text("""
                ALTER TABLE jewelry_products 
                ADD COLUMN IF NOT EXISTS is_sold_out BOOLEAN DEFAULT FALSE
            """))
            print("✅ is_sold_out カラムを追加しました")
        except Exception as e:
            print(f"⚠️ is_sold_out: {e}")

        conn.commit()
        print("\n✅ マイグレーション完了")

if __name__ == "__main__":
    migrate()
