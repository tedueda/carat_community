# Failure Report / 引き継ぎメモ（2026-02-15）

## 目的
- 失われた投稿データを **2026-02-15 07:00 JST** 時点相当まで復旧し、
  - `carat-community.com`（Netlify）
  - App Runner バックエンド
  - 復元した RDS（PostgreSQL）
  を連携させて、投稿一覧・カテゴリ別セクション・画像表示を正常化する。

## 事象（ユーザー視点）
- `/feed` のカテゴリ別セクション（ミュージック、アート・動画、サブカルチャー、食レポ・お店・ライブハウス、ツーリズム等）が「投稿がありません」のまま。
- Network 上では `GET /api/posts?category=...` は **200**。
- ただし UI に投稿が出ない。

## 重要な事実（確認済み）
- バックエンド API は復元DBを参照し、以下が **200** で返る。
  - `https://ddxdewgmen.ap-northeast-1.awsapprunner.com/api/posts`
  - `https://carat-community.com/api/posts`（Netlify `_redirects` 経由）
- 復元DBでは古い投稿に `posts.category IS NULL` のデータが多い。
- そのため、フロントがカテゴリ別取得（`/api/posts?category=art` 等）を行っても、
  - バックエンドが `posts.category` だけで絞ると 0 件になり得る
  - さらに「本文に `#art` がある」等で取得しても、レスポンスの `category` が `null` のままだと、
    **フロント側で再フィルタ/整形されて落ちる可能性**がある

## 実施した対処（コード変更）
### 1) 互換用スタートアップ・マイグレーション（backend/app/main.py）
復元スナップショットのスキーマ不足に合わせるため、起動時に以下を自動補完。
- `post_media` テーブル作成（不足による `UndefinedTable` 回避）
- `posts.post_type` / `posts.status` が `NULL` の場合に backfill（FastAPI response validation 回避）
- 不足カラムの `ADD COLUMN IF NOT EXISTS` 系（堅牢化）

### 2) カテゴリ取得が 0 件になる問題（backend/app/routers/posts.py）
#### 2-1. category フィルタのフォールバック
`/api/posts?category=<cat>` 時に以下の OR 条件に変更。
- `Post.category == <cat>`
- `Post.body ILIKE '%#<cat>%'`

コミット: `cafa761`（branch: `fix/posts-columns-migration-v2`）

#### 2-2. レスポンス上で category を補完（フロント表示落ち対策）
`category` 指定で取得した投稿について、本文に `#<cat>` が含まれ、DB上 `post.category is NULL` の場合、
**返却直前に `post.category = <cat>` を埋めて返す**（DB更新ではなく、返却オブジェクトの整形）。

コミット: `4c96d7c`（branch: `fix/posts-columns-migration-v2`）

### 3) デプロイ後の API 確認（反映確認）
デプロイ完了後、以下で `category` が `'art'` で返ることを確認。
- `https://ddxdewgmen.ap-northeast-1.awsapprunner.com/api/posts?category=art&limit=5`
- `https://carat-community.com/api/posts?category=art&limit=5`

結果:
- 配列5件
- `category` が `['art', 'art', 'art', 'art', 'art']`

## 未解決（現時点でのボトルネック）
- APIは返るが、`/feed` のカテゴリ別セクションが空のままという報告がある。
- 想定される根本原因:
  1. **フロントがリクエストしている `category` 値と、本文ハッシュタグが一致していない**
     - 例: `art` ではなく `artvideo` / `board` / `tourism` / 日本語slug 等
  2. `category` 以外のパラメータ（`category_id` / `tag` / `subcategory` 等）で取得しており、バックエンド側の互換処理が当たっていない
  3. フロント側の表示ロジック（HomePage側）で
     - `post.category` 以外の条件で更にフィルタ
     - もしくは response schema の想定違い（`media_urls` 等）で drop

## Devin への引き継ぎ（次にやること）
### A. まず「フロントが何を投げているか」確定する
- `https://carat-community.com/feed` を開き、DevTools > Network で `posts?` を確認
- 以下を控える
  - リクエストURL（クエリ全文）
  - レスポンス件数
  - レスポンス内の `category` 値

### B. フロント側コードの当たり場所
- Home/Feed がカテゴリ別に叩いている箇所
  - `frontend/src/**` 内で `posts?category=` や `category_id` を検索
- 受け取った posts を UI セクションへ割り当てるロジック
  - `post.category` / `post.body` / `tags` の扱い

### C. バックエンド側で必要になり得る対応
- `category` 値の正規化/マッピング（例: 日本語->英語slug）
- `category_id` と `category` の扱いの整理
- より厳密な hashtag パーサ（`#art` の部分一致問題回避など）

## リスク/注意
- 本件の互換処理は「復元スナップショットDB」に対する暫定措置。
- 恒久対応は Alembic 等の正式マイグレーションへ移行するのが望ましい。

## 参照
- Backend: `backend/app/main.py`, `backend/app/routers/posts.py`
- Netlify proxy: `frontend/public/_redirects`
- App Runner: `https://ddxdewgmen.ap-northeast-1.awsapprunner.com`
- Site: `https://carat-community.com`
