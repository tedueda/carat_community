import sqlite3
import sys
import os
from datetime import datetime, timedelta
import random
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def create_dummy_posts():
    conn = sqlite3.connect('lgbtq_community.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM users WHERE email = ?", ("tedyueda@gmail.com",))
    ted_user = cursor.fetchone()
    if not ted_user:
        print("Ted user not found. Please create user first.")
        return
    ted_user_id = ted_user[0]
    
    cursor.execute("SELECT id FROM users WHERE email = ?", ("sarah.johnson@example.com",))
    sarah_user = cursor.fetchone()
    sarah_user_id = sarah_user[0] if sarah_user else ted_user_id
    
    dummy_posts = [
        {
            "title": "虹色の抽象画を描きました",
            "body": "プライドフラッグからインスピレーションを得て、抽象画を描いてみました。色彩の調和を大切にしながら、多様性を表現しています。 #art #アート #LGBTQ #プライド",
            "user_id": ted_user_id,
            "visibility": "public"
        },
        {
            "title": "デジタルアートでポートレート制作",
            "body": "iPadを使ってLGBTQ+コミュニティの友人のポートレートを制作しました。その人らしさを大切に描けたと思います。 #art #デジタルアート #ポートレート #多様性",
            "user_id": sarah_user_id,
            "visibility": "public"
        },
        {
            "title": "心に響くLGBTQ+アーティストの楽曲",
            "body": "最近発見したクィアアーティストの楽曲が本当に素晴らしいです。歌詞に込められたメッセージに涙が出ました。音楽の力を改めて感じています。 #music #音楽 #LGBTQ #クィアアーティスト",
            "user_id": ted_user_id,
            "visibility": "public"
        },
        {
            "title": "プライドパレードで流れていた曲",
            "body": "先日のプライドパレードで流れていた楽曲のプレイリストを作りました。みんなで歌って踊って、最高の時間でした！ #music #プライドパレード #プレイリスト #楽しい時間",
            "user_id": sarah_user_id,
            "visibility": "public"
        },
        {
            "title": "カミングアウトについて相談です",
            "body": "家族にカミングアウトを考えているのですが、どのタイミングが良いか悩んでいます。経験のある方、アドバイスをいただけませんか？ #board #掲示板 #カミングアウト #相談",
            "user_id": ted_user_id,
            "visibility": "public"
        },
        {
            "title": "職場での理解を得るには",
            "body": "職場でLGBTQ+について理解を深めてもらうために、どんなアプローチが効果的でしょうか？皆さんの体験談を聞かせてください。 #board #職場 #理解 #体験談",
            "user_id": sarah_user_id,
            "visibility": "public"
        },
        {
            "title": "渋谷のLGBTQフレンドリーカフェ",
            "body": "渋谷にあるレインボーカフェに行ってきました！スタッフの方々がとても温かく、居心地の良い空間でした。プライドフラッグも飾られていて素敵です。 #shops #お店 #渋谷 #カフェ #フレンドリー",
            "user_id": ted_user_id,
            "visibility": "public"
        },
        {
            "title": "新宿二丁目のおすすめバー",
            "body": "新宿二丁目で見つけた素敵なバーをご紹介。マスターがとても親切で、初めてでも安心して楽しめました。カクテルも美味しかったです！ #shops #新宿二丁目 #バー #おすすめ",
            "user_id": sarah_user_id,
            "visibility": "public"
        },
        {
            "title": "東京プライドウォーク企画中",
            "body": "来月、東京のLGBTQ+ゆかりの地を巡るプライドウォークを企画しています。歴史的な場所や現在のコミュニティスポットを訪れる予定です。参加者募集中！ #tours #ツアー #東京 #プライドウォーク #参加者募集",
            "user_id": ted_user_id,
            "visibility": "public"
        },
        {
            "title": "大阪のLGBTQ+スポット巡り",
            "body": "大阪でLGBTQ+フレンドリーなスポットを巡るツアーに参加してきました。地元の方々との交流も楽しく、新しい発見がたくさんありました。 #tours #大阪 #スポット巡り #交流 #発見",
            "user_id": sarah_user_id,
            "visibility": "public"
        },
        {
            "title": "LGBTQ+テーマの映画レビュー",
            "body": "最近観た「ムーンライト」について語りたいです。繊細で美しい映像と、主人公の成長物語に深く感動しました。LGBTQ+映画の傑作だと思います。 #comics #コミック・映画 #ムーンライト #映画レビュー #感動",
            "user_id": ted_user_id,
            "visibility": "public"
        },
        {
            "title": "おすすめのBLコミック紹介",
            "body": "心温まるBLコミックを見つけました。恋愛だけでなく、お互いを理解し支え合う関係性が丁寧に描かれていて、読後感がとても良かったです。 #comics #BL #コミック #おすすめ #恋愛",
            "user_id": sarah_user_id,
            "visibility": "public"
        }
    ]
    
    base_time = datetime.now() - timedelta(days=7)
    for i, post in enumerate(dummy_posts):
        created_at = base_time + timedelta(hours=i*2 + random.randint(0, 3))
        
        cursor.execute("""
            INSERT INTO posts (user_id, title, body, visibility, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (post["user_id"], post["title"], post["body"], post["visibility"], created_at))
    
    conn.commit()
    conn.close()
    print(f"Created {len(dummy_posts)} dummy posts successfully!")

if __name__ == "__main__":
    create_dummy_posts()
