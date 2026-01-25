"""
趣味マスターデータの初期投入スクリプト
"""
from app.database import SessionLocal
from app.models import Hobby

HOBBIES = [
    '料理', 'グルメ', 'カフェ巡り', 'お酒・バー', 'お菓子作り',
    '旅行', '温泉', 'ドライブ', 'バイク', 'キャンプ', '登山', '釣り', '海・ビーチ',
    'スポーツ観戦', 'ランニング', '筋トレ', 'ヨガ', 'ダンス', 'サイクリング',
    '音楽鑑賞', '楽器', 'カラオケ', 'DJ',
    '映画', '海外ドラマ', 'アニメ', 'マンガ', 'コスプレ', 'ゲーム', 'ボードゲーム',
    'アート', '写真', 'デザイン', 'ファッション', '手芸・DIY',
    '読書', '語学', 'プログラミング', 'テクノロジー',
    'ペット', 'ガーデニング', 'ボランティア',
    'その他'
]

def seed_hobbies():
    db = SessionLocal()
    try:
        existing_names = {h.name for h in db.query(Hobby).all()}
        added = 0
        for name in HOBBIES:
            if name not in existing_names:
                db.add(Hobby(name=name))
                added += 1
        db.commit()
        print(f"✅ 趣味マスター投入完了: {added}件追加、{len(existing_names)}件既存")
    except Exception as e:
        db.rollback()
        print(f"❌ エラー: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_hobbies()
