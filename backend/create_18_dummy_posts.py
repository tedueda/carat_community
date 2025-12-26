#!/usr/bin/env python3
"""
Create 18 Japanese dummy posts (3 per category) for Carat
Categories: 掲示板, アート, 音楽, お店, ツアー, コミック・映画
"""

import psycopg2
from datetime import datetime, timedelta
import random

DB_CONFIG = {
    'host': 'rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com',
    'port': 5432,
    'database': 'lgbtq_community',
    'user': 'dbadmin',
    'password': 'NewPassword123!',
    'sslmode': 'require'
}

USER_IDS = [1, 6, 8]

CATEGORIES = {
    'board': {
        'hashtag': '#board',
        'posts': [
            {
                'title': 'はじめまして、よろしくお願いします',
                'body': '初めて投稿します。LGBTQ+コミュニティの皆さんと交流できることを楽しみにしています。どうぞよろしくお願いします。 #board'
            },
            {
                'title': 'カミングアウトについて相談',
                'body': '家族にカミングアウトを考えているのですが、どのようにアプローチすれば良いでしょうか。経験のある方、アドバイスをお願いします。 #board'
            },
            {
                'title': 'プライドパレード参加レポート',
                'body': '先日のプライドパレードに参加してきました！とても感動的で、多くの仲間と出会えました。来年も絶対参加したいです。 #board'
            }
        ]
    },
    'art': {
        'hashtag': '#art',
        'posts': [
            {
                'title': 'レインボーアート作品展示',
                'body': 'LGBTQ+をテーマにした絵画作品を制作しました。多様性と愛をテーマに、カラフルな作品に仕上がりました。皆さんの感想をお聞かせください。 #art'
            },
            {
                'title': 'プライドフラッグのイラスト',
                'body': 'デジタルアートでプライドフラッグをモチーフにしたイラストを描きました。各色に込められた意味を表現できたと思います。 #art'
            },
            {
                'title': 'アート療法の体験談',
                'body': 'アート療法を通じて自分らしさを表現することができました。創作活動が心の支えになっています。同じような経験のある方いませんか？ #art'
            }
        ]
    },
    'music': {
        'hashtag': '#music',
        'posts': [
            {
                'title': 'LGBTQ+アーティストのおすすめ楽曲',
                'body': '最近聴いているLGBTQ+アーティストの楽曲をシェアします。力強いメッセージと美しいメロディーに心を打たれました。 #music'
            },
            {
                'title': 'プライドソング作詞作曲中',
                'body': 'コミュニティのためのオリジナルソングを制作しています。愛と受容をテーマにした楽曲です。完成したらぜひ聴いてください！ #music'
            },
            {
                'title': '音楽で繋がる仲間たち',
                'body': '音楽を通じて多くの仲間と出会えました。セッションやライブ活動を一緒にできる方を募集しています。 #music'
            }
        ]
    },
    'shops': {
        'hashtag': '#shops',
        'posts': [
            {
                'title': 'LGBTQ+フレンドリーなカフェ発見',
                'body': '渋谷にあるレインボーカフェに行ってきました！スタッフの方々がとても温かく、居心地の良い空間でした。おすすめです。 #shops'
            },
            {
                'title': 'プライドグッズショップ紹介',
                'body': 'オンラインでプライドグッズを購入できるショップを見つけました。品質も良く、売上の一部がLGBTQ+団体に寄付されるそうです。 #shops'
            },
            {
                'title': 'フレンドリーな美容院',
                'body': 'LGBTQ+に理解のある美容師さんのいるサロンを紹介します。安心して相談できる環境で、理想のヘアスタイルになれました。 #shops'
            }
        ]
    },
    'tourism': {
        'hashtag': '#tourism',
        'posts': [
            {
                'title': '東京レインボータウン散策',
                'body': '新宿二丁目を中心としたLGBTQ+スポット巡りツアーを企画しました。歴史ある場所から新しいスポットまで、充実したコースです。 #tourism'
            },
            {
                'title': 'プライド月間イベント巡り',
                'body': '6月のプライド月間に合わせて、都内のイベントを巡るツアーを開催します。一緒に参加してくれる方を募集中です！ #tourism'
            },
            {
                'title': '海外プライドパレード参加記',
                'body': 'サンフランシスコのプライドパレードに参加してきました。規模の大きさと参加者の熱気に圧倒されました。写真もたくさん撮りました。 #tourism'
            }
        ]
    },
    'comics': {
        'hashtag': '#comics',
        'posts': [
            {
                'title': 'LGBTQ+テーマの漫画レビュー',
                'body': '最近読んだBL漫画がとても感動的でした。リアルな恋愛描写と社会問題への言及が素晴らしく、多くの人に読んでもらいたい作品です。 #comics'
            },
            {
                'title': 'プライド映画祭レポート',
                'body': 'LGBTQ+映画祭に参加してきました。多様な作品に触れることができ、新しい視点を得られました。特に印象的だった作品を紹介します。 #comics'
            },
            {
                'title': 'おすすめLGBTQ+ドラマ',
                'body': '海外ドラマでLGBTQ+キャラクターが主人公の作品を見つけました。丁寧な描写と感動的なストーリーで、涙が止まりませんでした。 #comics'
            }
        ]
    }
}

def create_dummy_posts():
    """Create 18 dummy posts in the database"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        print("Connected to PostgreSQL database")
        
        cur.execute("SELECT COUNT(*) FROM posts")
        initial_count = cur.fetchone()[0]
        print(f"Initial post count: {initial_count}")
        
        posts_created = 0
        
        for category_key, category_data in CATEGORIES.items():
            print(f"\nCreating posts for category: {category_key}")
            
            for i, post_data in enumerate(category_data['posts']):
                user_id = USER_IDS[posts_created % len(USER_IDS)]
                
                created_at = datetime.now() - timedelta(
                    hours=random.randint(1, 72),
                    minutes=random.randint(0, 59)
                )
                
                cur.execute("""
                    INSERT INTO posts (user_id, title, body, visibility, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id
                """, (
                    user_id,
                    post_data['title'],
                    post_data['body'],
                    'public',
                    created_at,
                    created_at
                ))
                
                post_id = cur.fetchone()[0]
                posts_created += 1
                
                print(f"  Created post {posts_created}: '{post_data['title']}' (ID: {post_id}, User: {user_id})")
        
        conn.commit()
        
        cur.execute("SELECT COUNT(*) FROM posts")
        final_count = cur.fetchone()[0]
        print(f"\nFinal post count: {final_count}")
        print(f"Posts created: {posts_created}")
        
        print("\nPosts by category:")
        for category_key, category_data in CATEGORIES.items():
            hashtag = category_data['hashtag']
            cur.execute("SELECT COUNT(*) FROM posts WHERE body LIKE %s", (f'%{hashtag}%',))
            count = cur.fetchone()[0]
            print(f"  {category_key} ({hashtag}): {count} posts")
        
        cur.close()
        conn.close()
        
        print(f"\nSuccessfully created {posts_created} dummy posts!")
        return True
        
    except Exception as e:
        print(f"Error creating dummy posts: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    create_dummy_posts()
