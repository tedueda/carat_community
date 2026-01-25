#!/usr/bin/env python3
"""
マッチング関連データをリセットするスクリプト
- チャットリクエスト
- チャット
- メッセージ
- いいね（お気に入り）
- マッチ
"""

import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# .envファイルを読み込み
load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("❌ DATABASE_URL が設定されていません")
    sys.exit(1)

print(f"📊 データベース接続: {DATABASE_URL.split('@')[1].split('/')[0]}")

engine = create_engine(DATABASE_URL)

def reset_matching_data():
    """マッチング関連のデータを削除"""
    
    with engine.connect() as conn:
        # トランザクション開始
        trans = conn.begin()
        
        try:
            # 1. メッセージを削除
            result = conn.execute(text("DELETE FROM messages"))
            print(f"✅ メッセージを削除: {result.rowcount}件")
            
            # 2. チャットリクエストを削除
            result = conn.execute(text("DELETE FROM chat_requests"))
            print(f"✅ チャットリクエストを削除: {result.rowcount}件")
            
            # 3. チャットを削除
            result = conn.execute(text("DELETE FROM chats"))
            print(f"✅ チャットを削除: {result.rowcount}件")
            
            # 4. いいね（お気に入り）を削除
            result = conn.execute(text("DELETE FROM likes"))
            print(f"✅ いいね（お気に入り）を削除: {result.rowcount}件")
            
            # 5. マッチを削除
            result = conn.execute(text("DELETE FROM matches"))
            print(f"✅ マッチを削除: {result.rowcount}件")
            
            # コミット
            trans.commit()
            print("\n🎉 マッチング関連データのリセットが完了しました")
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ エラーが発生しました: {e}")
            sys.exit(1)

def show_current_data():
    """現在のデータ件数を表示"""
    
    with engine.connect() as conn:
        tables = ['messages', 'chat_requests', 'chats', 'likes', 'matches']
        
        print("\n📊 現在のデータ件数:")
        for table in tables:
            result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
            count = result.scalar()
            print(f"  - {table}: {count}件")

if __name__ == '__main__':
    print("=" * 60)
    print("マッチング関連データリセットスクリプト")
    print("=" * 60)
    
    # リセット前のデータ件数を表示
    show_current_data()
    
    # 確認
    print("\n⚠️  以下のデータを削除します:")
    print("  - メッセージ")
    print("  - チャットリクエスト")
    print("  - チャット")
    print("  - いいね（お気に入り）")
    print("  - マッチ")
    
    confirm = input("\n本当に削除しますか？ (yes/no): ")
    
    if confirm.lower() == 'yes':
        reset_matching_data()
        
        # リセット後のデータ件数を表示
        show_current_data()
    else:
        print("\n❌ キャンセルしました")
