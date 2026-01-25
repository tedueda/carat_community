# カラットシステム実装 - 残課題

## 完了した項目 ✅

1. **データベース設定**
   - `users`テーブルに`carats`カラムを追加
   - PostgreSQL本番環境で動作確認

2. **UI変更**
   - ハートアイコン(❤️) → ダイヤモンドアイコン(💎)に変更
   - 「いいね」→「カラット」に表示変更
   - ホームページ、カテゴリページ、モーダル全てで統一

3. **API実装**
   - `/api/posts` エンドポイントで`like_count`、`comment_count`、`user_display_name`を返すように修正
   - エラーハンドリング追加

4. **フロントエンド実装**
   - ダミーデータを削除し、APIから返された実際の値を使用
   - ポイント表示（107pt）を削除
   - 自分の投稿へのカラット制限を実装（警告メッセージ表示）

5. **カラットクリック機能** ✅
   - `/api/posts/{post_id}/like` エンドポイントで投稿者に1カラット付与
   - いいね取り消し時に1カラット減算
   - POST/PUT/DELETEの3つのメソッドに対応

6. **カラット付与ロジック** ✅
   - 新規投稿時に投稿者に5カラット付与（`posts.py:248`）
   - いいね（カラット）を受けた時に投稿者に1カラット付与（`posts.py:466, 508`）
   - いいね取り消し時に1カラット減算（`posts.py:447, 542`）

7. **アカウントページでの総カラット表示** ✅
   - `/api/users/me/stats` エンドポイントで実際のcarats値を返す
   - フロントエンドで総カラット数を表示（`AccountPage.tsx:232-254`）

## 未解決の課題 ❌

### 1. **追加のカラット付与機能（オプション）**

**未実装の機能:**
- [ ] チャットメッセージ送信時に1カラット付与
- [ ] お気に入りマッチング時に1カラット付与

**実装場所:**
- バックエンド: `app/routers/chat.py`, `app/routers/matching.py`
- データベース: `users.carats`カラムの更新

## 技術的メモ

### データベース構造
```
users テーブル:
  - carats: INTEGER DEFAULT 0

reactions テーブル:
  - target_type: 'post'
  - target_id: post.id
  - reaction_type: 'like'
  - user_id: ユーザーID
```

### API エンドポイント
- `GET /api/posts` - like_count, comment_count を含む
- `POST /api/posts/{post_id}/like` - いいね/取り消し
- `GET /api/users/{user_id}` - ユーザー情報（carats含む）

### 環境
- フロントエンド: Netlify (https://carat-rainbow-community.netlify.app)
- バックエンド: AWS App Runner (https://ddxdewgmen.ap-northeast-1.awsapprunner.com)
- データベース: PostgreSQL on AWS RDS

## 次のステップ

1. **カラットクリック機能の修正**（最優先）
   - APIレスポンスとデータベース連携の確認
   - 楽観的更新とサーバー同期の修正

2. **カラット付与ロジックの実装**
   - 各アクションでのカラット付与処理を追加

3. **アカウントページでの表示**
   - 総カラット数の表示UI実装

---
作成日: 2025-11-15
最終更新: 2026-01-26
