"""
ジュエリー商品テーブルに新しいカラムを追加するスクリプト
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.database import SQLALCHEMY_DATABASE_URL

def add_columns():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    columns_to_add = [
        ("product_code", "VARCHAR(50)"),
        ("shipping_fee", "INTEGER DEFAULT 0"),
        ("has_certificate", "BOOLEAN DEFAULT FALSE"),
        ("has_gem_id", "BOOLEAN DEFAULT FALSE"),
        ("is_sold_out", "BOOLEAN DEFAULT FALSE"),
    ]
    
    with engine.connect() as conn:
        for column_name, column_type in columns_to_add:
            try:
                # PostgreSQL用
                conn.execute(text(f"ALTER TABLE jewelry_products ADD COLUMN IF NOT EXISTS {column_name} {column_type}"))
                print(f"Added column: {column_name}")
            except Exception as e:
                if "already exists" in str(e).lower() or "duplicate column" in str(e).lower():
                    print(f"Column {column_name} already exists, skipping...")
                else:
                    print(f"Error adding column {column_name}: {e}")
                    # SQLite用のフォールバック
                    try:
                        conn.execute(text(f"ALTER TABLE jewelry_products ADD COLUMN {column_name} {column_type}"))
                        print(f"Added column (SQLite): {column_name}")
                    except Exception as e2:
                        if "duplicate column" in str(e2).lower():
                            print(f"Column {column_name} already exists (SQLite), skipping...")
                        else:
                            print(f"SQLite error: {e2}")
        
        conn.commit()
        print("Done!")

if __name__ == "__main__":
    add_columns()
