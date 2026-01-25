#!/usr/bin/env python3
"""
APIから投稿データを取得して分析
"""
import json
import subprocess

# APIから投稿を取得
result = subprocess.run(
    ['curl', '-s', 'https://ddxdewgmen.ap-northeast-1.awsapprunner.com/api/posts/?limit=200'],
    capture_output=True,
    text=True
)

posts = json.loads(result.stdout)

print(f"\n=== 総投稿数: {len(posts)} ===\n")

# カテゴリ別に集計
categories = {}
for post in posts:
    cat = post.get('category') or 'なし'
    if cat not in categories:
        categories[cat] = []
    categories[cat].append(post)

print("カテゴリ別投稿数:")
for cat, posts_list in sorted(categories.items()):
    print(f"  {cat}: {len(posts_list)}件")

# 掲示板、お店、ツーリズムの投稿を詳しく表示
target_categories = ['board', 'shops', 'tourism']

print("\n=== 対象カテゴリの投稿詳細 ===\n")

for cat in target_categories:
    if cat in categories:
        print(f"\n--- {cat} ({len(categories[cat])}件) ---")
        for post in categories[cat]:
            print(f"ID: {post['id']}")
            print(f"タイトル: {post.get('title', '(なし)')}")
            print(f"サブカテゴリ: {post.get('subcategory', '(なし)')}")
            body = post.get('body', '')
            body_preview = body[:100] + "..." if len(body) > 100 else body
            print(f"本文: {body_preview}")
            print(f"作成日: {post.get('created_at', '')}")
            print(f"公開設定: {post.get('visibility', '')}")
            print("-" * 60)
    else:
        print(f"\n--- {cat}: 投稿なし ---")
