# カラット (Karat) - LGBTQ+ プレミアムコミュニティプラットフォーム

> ダイヤモンドの輝き × レインボープライド  
> 高級ジュエリーブランドのような洗練されたUIで、LGBTQ+コミュニティの交流・発信・支援を実現

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.116-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

---

## 🔄 Handoff 2026-01-17

### 最新の変更内容（2026年1月リニューアル）

このブランチ (`20260117`) には、以下のPRで実装された大規模リニューアルが含まれています：

---

#### 2026-01-17: バナー画像とUI改善

**ホームページバナーの変更:**
- Live Weddingバナーとジュエリーバナーに新しいAI生成画像を適用
- 画像をsrc/assets/imagesフォルダに配置し、importで読み込む方式に変更
- 両バナーにテキストオーバーレイを追加:
  - Live Wedding: 見出し「Live Wedding」、説明文「オンラインで叶える、あなただけの特別な結婚式」、「詳細はこちら」ボタン
  - ジュエリー販売: 見出し「ジュエリー販売」、説明文「会員限定で特別な価格にてご提供」、「詳細はこちら」ボタン
- カラットカラー（白・黒・グレー系）で統一されたエレガントなデザイン
- 中央揃えのレイアウトで視認性向上

**ジュエリー商品一覧ページの改善:**
- ヘッダー画像を新しいジュエリーバナーに変更
- 商品カードに カテゴリーバッジを追加（画像左上に表示）
- バッジスタイル: 黒背景に白文字、カテゴリー名を表示

**画像最適化:**
- Live Weddingバナー: 1920x670px (120KB)
- ジュエリーバナー: 1920x670px (183KB)
- 両画像とも500KB以下に最適化し、高速読み込みを実現

**実装ファイル:**
- `frontend/src/components/HomePage.tsx` - バナーテキストオーバーレイ追加
- `frontend/src/components/jewelry/JewelryProductList.tsx` - ヘッダー画像変更、カテゴリーバッジ追加
- `frontend/src/assets/images/live-wedding-banner.jpg` - 新規追加
- `frontend/src/assets/images/jewelry-banner.jpg` - 新規追加

---

#### PR #66, #67: サイトリニューアル - 特別メニューUI、ビジネスページ、フリマ機能

**トップページの変更:**
- カテゴリ一覧の直下に「特別メニュー」セクションを新設
- 特別メニューには以下のカードを表示:
  - 会員マッチング（有料会員限定）
  - 会員サロン（有料会員限定）
  - ビジネス（フリマ・作品販売・講座・Live配信）
- 特別メニューの下にバナーUIを追加:
  - ライブウェディング（フルサイズ画像バナー）
  - ジュエリー販売（フルサイズ画像バナー）

**ビジネスページ（/business）:**
- タブUIで4つの機能を切り替え可能:
  - フリマ
  - 作品販売
  - 講座
  - Live配信

**フリマ機能（ジモティー風）:**
- 一覧ページ: キーワード検索、カテゴリフィルタ、地域フィルタ、ソート機能
- 投稿フォーム: タイトル、商品画像（最大5枚）、説明文、希望価格、カテゴリ、地域、取引方法
- 詳細ページ: 画像スライダー、商品情報、「連絡する」ボタン（サイト内チャット）
- 権限制御: 無料会員は閲覧のみ、有料会員のみ投稿・連絡可能

**データベーステーブル:**
- `flea_market_items` - フリマ出品情報
- `flea_market_item_images` - 商品画像
- `flea_market_chats` - 購入者・出品者間のチャット
- `flea_market_messages` - チャットメッセージ

**実装ファイル:**
- `frontend/src/components/HomePage.tsx` - 特別メニュー・バナー追加
- `frontend/src/pages/members/BusinessPage.tsx` - ビジネスページ
- `frontend/src/components/flea-market/FleaMarketList.tsx` - フリマ一覧
- `frontend/src/components/flea-market/FleaMarketPostForm.tsx` - フリマ投稿フォーム
- `frontend/src/components/flea-market/FleaMarketDetail.tsx` - フリマ詳細
- `backend/app/routers/flea_market.py` - フリマAPI
- `backend/alembic/versions/20260116_add_flea_market_tables.py` - マイグレーション

---

#### PR #68: ジュエリーショッピング機能（EC機能）

**概要:**
- フリマとは完全に分離したジュエリー専用EC機能
- ブランド／公式販売を想定したEC構成
- Stripe決済統合（テスト環境対応）

**商品モデル:**
- 商品画像（最大5点）
- 商品名、金額（税込/税別設定可能）
- 商品説明（素材、サイズ、補足情報）
- 在庫数、カテゴリ（固定値: ジュエリー）

**画面構成:**
1. 商品一覧ページ（/jewelry）: 商品カード一覧、メイン画像・商品名・金額表示
2. 商品詳細ページ（/jewelry/:id）: 画像スライダー、商品情報、「カートに入れる」ボタン
3. カートページ（/jewelry/cart）: カート内商品一覧、数量、小計/合計金額
4. 購入情報入力フォーム（/jewelry/checkout）: 氏名、住所、連絡先
5. 決済処理: Stripe統合
6. 購入完了画面（/jewelry/order-complete）: 購入完了メッセージ、購入内容サマリー

**権限制御:**
- 無料会員: 商品閲覧のみ可能、カート追加・決済は不可
- 有料会員: 商品閲覧、カート追加、決済すべて可能
- 操作時に有料会員誘導モーダル表示

**データベーステーブル:**
- `jewelry_products` - ジュエリー商品情報
- `jewelry_product_images` - 商品画像
- `carts` - カート
- `cart_items` - カート内商品
- `orders` - 注文情報
- `order_items` - 注文商品

**実装ファイル:**
- `frontend/src/components/jewelry/JewelryProductList.tsx` - 商品一覧
- `frontend/src/components/jewelry/JewelryProductDetail.tsx` - 商品詳細
- `frontend/src/components/jewelry/JewelryCart.tsx` - カート
- `frontend/src/components/jewelry/JewelryCheckout.tsx` - チェックアウト
- `frontend/src/components/jewelry/JewelryOrderComplete.tsx` - 注文完了
- `backend/app/routers/jewelry.py` - ジュエリーAPI
- `backend/alembic/versions/20260116_add_jewelry_tables.py` - マイグレーション

---

#### PR #69: ジュエリー商品管理画面

**概要:**
- ジュエリー商品のCRUD操作を行う管理画面

**機能:**
- 商品一覧表示（テーブル形式）
- 新規商品登録（モーダルフォーム）
- 商品編集
- 商品削除

**アクセス方法:**
- `/jewelry/admin` にアクセス（管理者としてログイン後）

**入力項目:**
- 商品名、商品説明、素材、サイズ、補足情報
- 価格（税込/税別選択可）
- 在庫数（0=無制限）
- 商品画像URL（最大5枚）

**実装ファイル:**
- `frontend/src/components/jewelry/JewelryAdmin.tsx` - 管理画面コンポーネント
- `frontend/src/App.tsx` - ルート追加

---

### Stripe決済設定

ジュエリーEC機能でStripe決済を有効にするには、以下の環境変数を設定してください:

**バックエンド（App Runner環境変数）:**
- `STRIPE_SECRET_KEY` - Stripeのシークレットキー（sk_test_...）

**フロントエンド（ビルド時環境変数）:**
- `VITE_STRIPE_PUBLIC_KEY` - Stripeの公開キー（pk_test_...）

**テスト用カード番号:** `4242 4242 4242 4242`

---

### 会員権限ルール（全機能共通）

**無料会員（未ログイン含む）:**
- 全ページ閲覧可能
- 投稿、連絡、購入は不可
- 操作時に有料会員誘導モーダル表示

**有料会員:**
- 投稿可能
- チャット連絡可能
- 購入、配信登録可能

---

### 過去の変更内容

このブランチには、以下の過去のPRで実装された機能と修正も含まれています：

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
- **バックエンド**: ローカル開発サーバー（http://localhost:8000）を使用
- **データベース**: AWS RDS PostgreSQL 17.4 (ap-northeast-1)
  - ホスト: `rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com`
  - ユーザー: `dbadmin`
  - パスワード: `NewPassword123!`
  - データベース名: `lgbtq_community`

> **注意**: 古いApp Runner URL（`https://ddxdewgmen.ap-northeast-1.awsapprunner.com`）は廃止されました。バックエンドはローカルで起動してください。

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
- **バックエンド API**: ローカル開発サーバー（http://localhost:8000）を使用
- **データベース**: AWS RDS PostgreSQL 17.4 (ap-northeast-1)
  - ホスト: `rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com`
  - ユーザー: `dbadmin`
  - パスワード: `NewPassword123!`
  - データベース名: `lgbtq_community`
- **API ドキュメント**: http://localhost:8000/docs（ローカル起動時）

> **注意**: 古いApp Runner URL（`https://ddxdewgmen.ap-northeast-1.awsapprunner.com`）は廃止されました。

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

**API URL**: https://ddxdewgmen.ap-northeast-1.awsapprunner.com

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

**最終更新**: 2026-01-17  
**作成者**: Cascade AI + Devin AI + プロジェクトチーム  
**Handoff Branch**: 20260117

