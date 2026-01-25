"""
Phase 1 カテゴリーデータのシードスクリプト

ROADMAPに基づいて新しいカテゴリー体系をデータベースに投入します：
- サブカルチャー → コミック、映画、ドラマ、アニメ、ゲーム
- Queer アート → 絵画、写真、デジタルアート、パフォーマンス、インスタレーション
- その他: ライフスタイル、観光・トラベル、ショップ・ビジネス、掲示板
"""

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.models import Category, Subcategory
from app.database import get_db_url

DATABASE_URL = get_db_url()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

CATEGORIES_DATA = [
    {
        "name": "サブカルチャー",
        "slug": "subculture",
        "description": "コミック、映画、ドラマ、アニメ、ゲームなどのサブカルチャーコンテンツ",
        "icon": "Sparkles",
        "order_index": 1,
        "subcategories": [
            {"name": "コミック", "slug": "comics", "order_index": 1},
            {"name": "映画", "slug": "movies", "order_index": 2},
            {"name": "ドラマ", "slug": "drama", "order_index": 3},
            {"name": "アニメ", "slug": "anime", "order_index": 4},
            {"name": "ゲーム", "slug": "games", "order_index": 5},
        ]
    },
    {
        "name": "Queer アート",
        "slug": "queer-art",
        "description": "LGBTQ+コミュニティのアート作品と表現",
        "icon": "Palette",
        "order_index": 2,
        "subcategories": [
            {"name": "絵画", "slug": "painting", "order_index": 1},
            {"name": "写真", "slug": "photography", "order_index": 2},
            {"name": "デジタルアート", "slug": "digital-art", "order_index": 3},
            {"name": "パフォーマンス", "slug": "performance", "order_index": 4},
            {"name": "インスタレーション", "slug": "installation", "order_index": 5},
        ]
    },
    {
        "name": "ライフスタイル",
        "slug": "lifestyle",
        "description": "日常生活、ファッション、美容、健康など",
        "icon": "Heart",
        "order_index": 3,
        "subcategories": [
            {"name": "ファッション", "slug": "fashion", "order_index": 1},
            {"name": "美容", "slug": "beauty", "order_index": 2},
            {"name": "健康", "slug": "health", "order_index": 3},
            {"name": "料理", "slug": "cooking", "order_index": 4},
        ]
    },
    {
        "name": "観光・トラベル",
        "slug": "travel",
        "description": "旅行、観光スポット、イベント情報",
        "icon": "MapPin",
        "order_index": 4,
        "subcategories": [
            {"name": "国内旅行", "slug": "domestic", "order_index": 1},
            {"name": "海外旅行", "slug": "international", "order_index": 2},
            {"name": "イベント", "slug": "events", "order_index": 3},
            {"name": "プライドパレード", "slug": "pride", "order_index": 4},
        ]
    },
    {
        "name": "ショップ・ビジネス",
        "slug": "shops",
        "description": "LGBTQ+フレンドリーなお店やビジネス情報",
        "icon": "Store",
        "order_index": 5,
        "subcategories": [
            {"name": "カフェ・レストラン", "slug": "cafe-restaurant", "order_index": 1},
            {"name": "バー・クラブ", "slug": "bar-club", "order_index": 2},
            {"name": "ショップ", "slug": "shop", "order_index": 3},
            {"name": "サービス", "slug": "service", "order_index": 4},
        ]
    },
    {
        "name": "掲示板",
        "slug": "board",
        "description": "コミュニティの交流・相談・情報交換",
        "icon": "MessageSquare",
        "order_index": 6,
        "subcategories": [
            {"name": "雑談", "slug": "chat", "order_index": 1},
            {"name": "相談", "slug": "consultation", "order_index": 2},
            {"name": "質問", "slug": "questions", "order_index": 3},
            {"name": "告知", "slug": "announcements", "order_index": 4},
        ]
    },
]


def seed_categories():
    """カテゴリーとサブカテゴリーをデータベースに投入"""
    db = SessionLocal()
    
    try:
        print("🌱 Phase 1 カテゴリーデータのシード開始...")
        
        for cat_data in CATEGORIES_DATA:
            existing_cat = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
            
            if existing_cat:
                print(f"✓ カテゴリー '{cat_data['name']}' は既に存在します（スキップ）")
                category = existing_cat
            else:
                category = Category(
                    name=cat_data["name"],
                    slug=cat_data["slug"],
                    description=cat_data["description"],
                    icon=cat_data["icon"],
                    order_index=cat_data["order_index"]
                )
                db.add(category)
                db.flush()  # IDを取得するためにflush
                print(f"✓ カテゴリー '{cat_data['name']}' を作成しました")
            
            for sub_data in cat_data["subcategories"]:
                existing_sub = db.query(Subcategory).filter(
                    Subcategory.category_id == category.id,
                    Subcategory.slug == sub_data["slug"]
                ).first()
                
                if existing_sub:
                    print(f"  ✓ サブカテゴリー '{sub_data['name']}' は既に存在します（スキップ）")
                else:
                    subcategory = Subcategory(
                        category_id=category.id,
                        name=sub_data["name"],
                        slug=sub_data["slug"],
                        order_index=sub_data["order_index"]
                    )
                    db.add(subcategory)
                    print(f"  ✓ サブカテゴリー '{sub_data['name']}' を作成しました")
        
        db.commit()
        print("\n✅ Phase 1 カテゴリーデータのシード完了！")
        
        total_categories = db.query(Category).count()
        total_subcategories = db.query(Subcategory).count()
        print(f"\n📊 データベース統計:")
        print(f"   - カテゴリー数: {total_categories}")
        print(f"   - サブカテゴリー数: {total_subcategories}")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ エラーが発生しました: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_categories()
