# カラット (Karat) - LGBTQ+ プレミアムコミュニティプラットフォーム

> ダイヤモンドの輝き × レインボープライド  
> 高級ジュエリーブランドのような洗練されたUIで、LGBTQ+コミュニティの交流・発信・支援を実現

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.116-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

---

## 🔄 Handoff 2025-11-09

### 最新の変更内容

このブランチ (`2025-11-09`) には、以下のPRで実装された機能と修正が含まれています：

#### PR #25: RDS スキーマミスマッチ修正
- MatchingProfile モデルから余分なフィールドを削除
- RDS データベースとモデル定義の整合性を確保

#### PR #26: Dockerfile パス修正
- バックエンド Dockerfile のビルドコンテキストパスを修正
- 相対パスを使用するように変更

#### PR #27: ペンディングチャットメッセージ表示修正
- `messages` テーブルからメッセージを取得・表示する機能を追加
- `initial_message` が空でもすべてのユーザーのメッセージが表示されるように修正
- 実装ファイル: `frontend/src/components/matching/MatchingPendingChatPage.tsx`

#### PR #28: マッチング UI 改善
1. **フィルター機能の追加と改善**
   - 条件検索フィルターをプロフィール編集ページの選択肢と統一
   - 動的抽出から静的配列に変更（常にすべての選択肢を表示）

2. **用語統一: "タイプ" → "お気に入り"**
   - ナビゲーションタブ、ページタイトル、ボタンラベルを統一
   - 変更ファイル:
     - `frontend/src/components/matching/MatchingLayout.tsx` (line 10)
     - `frontend/src/components/matching/MatchingLikesPage.tsx` (lines 87, 152, 197)
     - `frontend/src/components/matching/MatchCard.tsx` (lines 117, 127)

3. **アイコン変更: ♡ → 💎**
   - ハートアイコンをダイヤモンド絵文字に変更（モノクロ）
   - 変更ファイル: `frontend/src/components/matching/MatchCard.tsx` (line 127)

4. **スタイリング改善**
   - トップナビゲーションを暗いグレー背景に変更
   - サイドバー背景を黄色からグレーに変更

### 技術仕様の変更点

#### マッチング機能のフィルター選択肢

フィルター選択肢は、プロフィール編集ページと完全に一致するように静的配列で定義されています：

**居住地 (PREFECTURES)**: 47都道府県
```
北海道、青森県、岩手県、宮城県、秋田県、山形県、福島県、茨城県、栃木県、群馬県、
埼玉県、千葉県、東京都、神奈川県、新潟県、富山県、石川県、福井県、山梨県、長野県、
岐阜県、静岡県、愛知県、三重県、滋賀県、京都府、大阪府、兵庫県、奈良県、和歌山県、
鳥取県、島根県、岡山県、広島県、山口県、徳島県、香川県、愛媛県、高知県、福岡県、
佐賀県、長崎県、熊本県、大分県、宮崎県、鹿児島県、沖縄県
```

**年代 (AGE_BANDS)**:
```
10代、20代前半、20代後半、30代前半、30代後半、40代前半、40代後半、50代前半、50代後半、60代以上
```

**職種 (OCCUPATIONS)**:
```
会社員、自営業、フリーランス、学生、専門職、公務員、パート・アルバイト、その他
```

**マッチングの目的 (MEET_PREFS)**:
```
パートナー探し、友人探し、相談相手探し、メンバー募集、その他
```

#### 定義場所

- **プロフィール編集ページ**: `frontend/src/components/matching/MatchingProfilePage.tsx`
  - PREFECTURES: line 52-54
  - AGE_BANDS: line 65
  - OCCUPATIONS: line 66
  - MEET_PREFS: line 69

- **検索ページフィルター**: `frontend/src/components/matching/MatchingSearchPage.tsx`
  - 定義: lines 115-120
  - 使用: lines 160, 173, 186, 199

#### API エンドポイント

マッチング機能で使用されている主要なエンドポイント：

- `GET /api/matching/search` - ユーザー検索
- `GET /api/matching/likes` - お気に入り一覧取得
- `POST /api/matching/likes/{user_id}` - お気に入り追加
- `GET /api/matching/profiles/me` - 自分のプロフィール取得
- `PUT /api/matching/profiles/me` - プロフィール更新
- `POST /api/matching/chat_requests/{user_id}` - チャットリクエスト送信
- `GET /api/matching/chat_requests/{id}/messages` - チャットメッセージ取得

### デプロイ済み環境

- **フロントエンド**: https://rainbow-community-app-lr7ap1j0.devinapps.com
- **バックエンド**: https://ddxdewgmen.ap-northeast-1.awsapprunner.com
- **データベース**: AWS RDS PostgreSQL 17.4 (ap-northeast-1)

### テストアカウント

- **Email**: tedyueda@gmail.com
- **Password**: tedyueda2024!

### 今後の改善提案

1. **定数の一元管理**
   - 現在、フィルター選択肢がプロフィール編集ページと検索ページの2箇所に定義されています
   - 共通の定数モジュール（例: `frontend/src/constants/matchingOptions.ts`）を作成し、両方のページで同じ配列をインポートすることを推奨します
   - これにより、選択肢の追加・変更時の整合性が保たれます

2. **PR のマージ**
   - PR #27 は main ブランチにマージされていません
   - このブランチには cherry-pick で含まれていますが、Git 履歴の整合性のため、PR #27 を main にマージすることを推奨します

---

## 📖 目次

- [概要](#概要)
- [主な機能](#主な機能)
- [技術スタック](#技術スタック)
- [セットアップ](#セットアップ)
- [クイックスタート](#クイックスタート)
- [マイグレーション運用](#マイグレーション運用)
- [デプロイ](#デプロイ)
- [プロジェクト構成](#プロジェクト構成)
- [ロードマップ](#ロードマップ)
- [環境変数](#環境変数)
- [コントリビュート](#コントリビュート)

---

## 概要

**カラット**は、LGBTQ+コミュニティのための次世代SNS/マーケットプレイスです。

### デザインコンセプト

「**ダイヤモンドの輝き × レインボープライド**」

- 白・シルバー・ゴールドを基調とした高級感あるデザイン
- 控えめで繊細なレインボーグラデーション
- Cartier のような贅沢な余白とエレガントなタイポグラフィ

### 参考サイト

- **UI**: [Cartier 公式サイト](https://www.cartier.jp/)
- **機能**: [Queer Art](https://www.queer-art.org/)

### デプロイ済み環境

- **フロントエンド**: https://rainbow-community-app-lr7ap1j0.devinapps.com
- **バックエンド API**: https://ddxdewgmen.ap-northeast-1.awsapprunner.com
- **データベース**: AWS RDS PostgreSQL 17.4 (ap-northeast-1)
- **API ドキュメント**: https://ddxdewgmen.ap-northeast-1.awsapprunner.com/docs

---

## 主な機能

### 🌈 コアコミュニティ機能

- **投稿・フィード**
  - 画像・テキスト投稿、タグ付け
  - カテゴリー/サブカテゴリー機能（正規化済み）
  - いいね、コメント、シェア
  - 公開範囲設定（public/members/followers/private）
  
- **新カテゴリー体系**
  - **サブカルチャー**: コミック、映画、ドラマ、アニメ、ゲーム
  - **Queer アート**: 絵画、写真、デジタルアート、パフォーマンス、インスタレーション
  - その他: ライフスタイル、観光・トラベル、ショップ・ビジネス、掲示板

### 👥 会員限定機能

- **マッチング**
  - スワイプ式カード
  - 趣味・興味・距離ベースのマッチングアルゴリズム
  - リアルタイムチャット（WebSocket）
  - 通知システム

- **マーケット（C2C）**
  - 会員同士で商品の売買
  - 出品・購入フロー
  - 取引管理、トラッキング

- **EC サイト（ジュエリー販売）**
  - オリジナルジュエリーの販売
  - カート・チェックアウト
  - Stripe 決済統合

- **クラウドファンディング**
  - プロジェクト作成・管理
  - リワード設定
  - 支援・進捗管理

### 🎊 特別機能

- **バーチャル・ウェディング**
  - 申し込みフォーム
  - 管理者承認フロー
  - Zoom リンク設定

---

## 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| React | 18.3 | UI フレームワーク |
| TypeScript | 5.6 | 型安全 |
| Vite | 6.0 | ビルドツール |
| Tailwind CSS | 3.4 | スタイリング |
| shadcn/ui | - | UI コンポーネント（Radix UI ベース） |
| React Router | 7.9 | ルーティング |
| Framer Motion | - | アニメーション |

### バックエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| FastAPI | 0.116 | Web フレームワーク |
| SQLAlchemy | 2.0 | ORM |
| Alembic | 1.12 | マイグレーション |
| PostgreSQL | 17.4 | データベース |
| Psycopg2 | 2.9 | PostgreSQL ドライバ |
| WebSocket | - | リアルタイム通信 |
| Stripe | - | 決済処理 |

### インフラ

- **AWS App Runner**: API コンテナホスティング
- **AWS RDS (PostgreSQL)**: データベース
- **AWS S3**: 画像ストレージ（予定）
- **AWS ECR**: Docker イメージレジストリ
- **CloudWatch**: ログ・モニタリング

---

## セットアップ

### 前提条件

- Python 3.12+
- Node.js 18+
- PostgreSQL 17+（ローカル開発時）
- Docker（デプロイ時）

### 1. バックエンド

**推奨: 起動スクリプトを使用（正しいRDS情報が自動設定されます）**

```bash
cd backend
./start_dev.sh
```

**または手動で起動:**

```bash
cd backend

# 仮想環境作成・有効化
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係インストール
pip install -r requirements.txt
# または
poetry install

# ⚠️ 重要: 正しいRDS情報（ap-northeast-1 東京リージョン）
export DATABASE_URL="postgresql+psycopg2://dbadmin:0034caretLgbtQ@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require"
export PYTHONPATH=$(pwd):$PYTHONPATH
export PORT=8000

# マイグレーション適用
alembic upgrade head

# 開発サーバー起動
./venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**API ドキュメント**: http://127.0.0.1:8000/docs

### 2. フロントエンド

```bash
cd frontend

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

**アプリケーション**: http://localhost:5173

---

## クイックスタート

- ローカル開発ガイド: [docs/LOCAL_DEV.md](./docs/LOCAL_DEV.md)
- **バックエンド起動スクリプト**: `backend/start_dev.sh` ⭐️ 推奨
- フロントエンド起動スクリプト: `./scripts/dev_frontend.sh`

最短手順:

```bash
# バックエンド（別ターミナル）
cd backend && ./start_dev.sh

# フロントエンド（別ターミナル）
cd frontend && npm run dev
```

**重要**: `start_dev.sh` は正しいRDS情報（ap-northeast-1 東京リージョン）を自動設定します。


## マイグレーション運用

### ⚠️ 重要: スキーマ変更は必ず Alembic を使用

SQLAlchemy の `Base.metadata.create_all()` は**既存テーブルの更新をしません**。  
カラム追加・変更は必ず Alembic マイグレーションで行います。

### マイグレーション手順

#### 1. models.py を変更

```python
# backend/app/models.py
class Post(Base):
    # ... 既存カラム ...
    new_column = Column(String(100))  # 新しいカラム追加
```

#### 2. マイグレーションファイル自動生成

```bash
cd backend
source venv/bin/activate

# ⚠️ 重要: 正しいRDS情報（ap-northeast-1 東京リージョン）
export DATABASE_URL="postgresql+psycopg2://dbadmin:0034caretLgbtQ@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require"
export PYTHONPATH=$(pwd):$PYTHONPATH

# 差分から自動生成
alembic revision --autogenerate -m "add new_column to posts"
```

#### 3. 生成されたファイルを確認

```bash
# alembic/versions/<HASH>_add_new_column_to_posts.py を確認
```

#### 4. ローカルで適用

```bash
alembic upgrade head
```

#### 5. コミット・プッシュ

```bash
git add alembic/versions/*.py
git commit -m "migration: add new_column to posts"
git push origin <branch>
```

#### 6. デプロイ

App Runner にデプロイすると、`start.sh` が自動的に `alembic upgrade head` を実行します。

### マイグレーションの確認

```bash
# 現在のバージョン
alembic current

# 最新バージョン
alembic heads

# 履歴
alembic history
```

---

## デプロイ

### バックエンド（App Runner）

#### 1. Docker イメージビルド

```bash
cd backend
docker build -t 192933325498.dkr.ecr.ap-northeast-1.amazonaws.com/rainbow-community-api:latest .
```

#### 2. ECR にプッシュ

```bash
# ECR ログイン
aws ecr get-login-password --region ap-northeast-1 \
  | docker login --username AWS --password-stdin 192933325498.dkr.ecr.ap-northeast-1.amazonaws.com

# プッシュ
docker push 192933325498.dkr.ecr.ap-northeast-1.amazonaws.com/rainbow-community-api:latest
```

#### 3. App Runner で手動デプロイ

AWS コンソール → App Runner → `rainbow-community-api` → **Deploy**

**API URL**: https://7cjpf7nunm.ap-northeast-1.awsapprunner.com

### フロントエンド（予定）

- Netlify / Vercel / Cloudflare Pages

## 🛠 技術スタック

### バックエンド
- **フレームワーク**: FastAPI
- **データベース**: PostgreSQL 17
- **認証**: JWT + OAuth2
- **デプロイ**: Fly.io
- **ORM**: SQLAlchemy

### フロントエンド
- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **状態管理**: React Context API
- **デプロイ**: Devin Apps

### データベース
- **本番**: PostgreSQL 17 (AWS RDS)
- **ローカル**: SQLite (開発用フォールバック)
- **接続情報**: `backend/.env` 参照

## 🔧 ローカル開発環境

### 前提条件
- Node.js 18+
- Python 3.12+
- PostgreSQL 17 (または SQLite)

### セットアップ手順

#### 1. バックエンド起動
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. フロントエンド起動
```bash
cd frontend
npm install
npm run dev
```

#### 3. アクセス
- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:8000
- API仕様書: http://localhost:8000/docs

---

## ロードマップ

[ROADMAP.md](./ROADMAP.md) を参照

---

## 環境変数

**バック**: `DATABASE_URL`, `PORT`, `STRIPE_SECRET_KEY`  
**フロント**: `VITE_API_BASE_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`

---

## データポリシー

- デモデータ削除済み
- 新規登録ユーザーの投稿のみ表示
- 会員限定機能は認証必須

---

## コントリビュート

- `main`: 本番 / 日付ブランチ: 作業用
- PR に目的・変更・マイグレーション情報を記載
- 秘密鍵は `.env` のみ、コミット禁止

---

## トラブルシューティング

- DB接続: `DATABASE_URL` 確認
- マイグレーション: `PYTHONPATH` 設定確認
- デプロイ後 500: CloudWatch Logs 確認

---

## ライセンス

現在検討中

---

**最終更新**: 2025-11-09  
**作成者**: Cascade AI + Devin AI + プロジェクトチーム  
**Handoff Branch**: 2025-11-09

