#!/usr/bin/env python3
"""
データベースのテーブル一覧を確認
"""
import sqlite3

db_path = "backend/lgbtq_community_dev.db"

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # テーブル一覧を取得
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print(f"\n=== データベース内のテーブル一覧 ===\n")
    for table in tables:
        print(f"  - {table[0]}")
        
        # 各テーブルのレコード数を取得
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
            count = cursor.fetchone()[0]
            print(f"    レコード数: {count}")
        except Exception as e:
            print(f"    エラー: {e}")
    
    conn.close()
    
except Exception as e:
    print(f"エラー: {e}")
