"""
マイグレーションSQL実行スクリプト（psycopg2のみ使用）
"""
import os

try:
    import psycopg2
except ImportError:
    print("❌ psycopg2がインストールされていません")
    print("実行: pip3 install psycopg2-binary")
    exit(1)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL環境変数が設定されていません")
    print("実行: export DATABASE_URL='postgresql://...'")
    exit(1)

def run_migration():
    conn = None
    try:
        print("データベースに接続中...")
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        print("\n=== マイグレーション実行 ===\n")
        
        # 1. カラム追加
        print("1. matching_profiles にカラム追加...")
        cur.execute("ALTER TABLE matching_profiles ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500)")
        cur.execute("ALTER TABLE matching_profiles ADD COLUMN IF NOT EXISTS meeting_style VARCHAR(50)")
        conn.commit()
        print("   ✅ avatar_url, meeting_style 追加完了")
        
        # 2. データコピー
        print("\n2. meet_pref を meeting_style にコピー...")
        cur.execute("""
            UPDATE matching_profiles 
            SET meeting_style = meet_pref 
            WHERE meet_pref IS NOT NULL AND meeting_style IS NULL
        """)
        conn.commit()
        print(f"   ✅ {cur.rowcount}件更新")
        
        # 3. テーブル作成
        print("\n3. matching_profile_images テーブル作成...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS matching_profile_images (
                id SERIAL PRIMARY KEY,
                profile_id INTEGER NOT NULL REFERENCES matching_profiles(user_id) ON DELETE CASCADE,
                image_url VARCHAR(500) NOT NULL,
                display_order INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                CONSTRAINT unique_profile_order UNIQUE (profile_id, display_order),
                CONSTRAINT check_order_range CHECK (display_order >= 0 AND display_order < 5)
            )
        """)
        cur.execute("CREATE INDEX IF NOT EXISTS idx_profile_images_profile_id ON matching_profile_images(profile_id)")
        conn.commit()
        print("   ✅ テーブル作成完了")
        
        # 4. 趣味マスター投入
        print("\n4. 趣味マスターデータ投入...")
        hobbies = [
            '料理', 'グルメ', 'カフェ巡り', 'お酒・バー', 'お菓子作り',
            '旅行', '温泉', 'ドライブ', 'バイク', 'キャンプ', '登山', '釣り', '海・ビーチ',
            'スポーツ観戦', 'ランニング', '筋トレ', 'ヨガ', 'ダンス', 'サイクリング',
            '音楽鑑賞', '楽器', 'カラオケ', 'DJ',
            '映画', '海外ドラマ', 'アニメ', 'マンガ', 'コスプレ', 'ゲーム', 'ボードゲーム',
            'アート', '写真', 'デザイン', 'ファッション', '手芸・DIY',
            '読書', '語学', 'プログラミング', 'テクノロジー',
            'ペット', 'ガーデニング', 'ボランティア', 'その他'
        ]
        
        added = 0
        for hobby in hobbies:
            try:
                cur.execute("INSERT INTO hobbies (name) VALUES (%s) ON CONFLICT (name) DO NOTHING", (hobby,))
                if cur.rowcount > 0:
                    added += 1
            except Exception as e:
                print(f"   ⚠️  {hobby}: {e}")
        
        conn.commit()
        print(f"   ✅ {added}件追加")
        
        # 確認
        print("\n=== 確認 ===")
        cur.execute("SELECT COUNT(*) FROM hobbies")
        print(f"趣味マスター総件数: {cur.fetchone()[0]}件")
        
        cur.execute("SELECT COUNT(*) FROM matching_profile_images")
        print(f"プロフィール画像件数: {cur.fetchone()[0]}件")
        
        print("\n✅ マイグレーション完了！")
        
    except psycopg2.OperationalError as e:
        print(f"\n❌ 接続エラー: {e}")
        print("\n原因:")
        print("- RDSのセキュリティグループでローカルIPが許可されていない")
        print("- VPN経由でのアクセスが必要")
        print("\n代替案:")
        print("1. AWS RDS Query Editor を使用")
        print("2. EC2インスタンス経由で実行")
        print("3. App Runnerコンテナ内で実行")
    except Exception as e:
        print(f"\n❌ エラー: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    run_migration()
