# Carat Community - LGBTQ+ プレミアムコミュニティプラットフォーム

> ダイヤモンドの輝き × レインボープライド  
> 高級ジュエリーブランドのような洗練されたUIで、LGBTQ+コミュニティの交流・発信・支援を実現

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.116-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

---

## 概要

**Carat Community**は、LGBTQ+コミュニティのための次世代SNS/マーケットプレイスです。

### デザインコンセプト

「**ダイヤモンドの輝き × レインボープライド**」

- 白・シルバー・ゴールドを基調とした高級感あるデザイン
- 控えめで繊細なレインボーグラデーション
- Cartier のような贅沢な余白とエレガントなタイポグラフィ

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
- **AWS S3**: 画像ストレージ
- **AWS ECR**: Docker イメージレジストリ
- **CloudWatch**: ログ・モニタリング

---

## 主な機能

### コアコミュニティ機能

- **投稿・フィード**: 画像・テキスト投稿、タグ付け、カテゴリー機能
- **カテゴリー体系**: サブカルチャー、Queer アート、ライフスタイル、観光・トラベル等

### 会員限定機能（有料会員: isPaidUser）

- **マッチング**: スワイプ式カード、趣味・興味ベースのマッチング、リアルタイムチャット
- **会員サロン**: 有料会員専用コミュニティ
- **フリマ（C2C）**: 会員同士で商品の売買
- **作品販売**: アート作品の販売
- **ジュエリーEC**: オリジナルジュエリー販売、Stripe決済統合
- **クラウドファンディング**: プロジェクト作成・支援

### 特別機能

- **バーチャル・ウェディング**: オンライン結婚式申し込み・管理

---

## 会員権限ルール

| 会員種別 | 変数名 | 権限 |
|----------|--------|------|
| 無料会員 | `isFreeUser` | 閲覧のみ、投稿・連絡・購入は不可 |
| 有料会員 | `isPaidUser` | 全機能利用可能 |

### 用語統一（2026-01-24完了）

| 旧用語 | 新用語 |
|--------|--------|
| `isAnonymous` | `isFreeUser` |
| `isPremium` | `isPaidUser` |
| `PremiumGate` | `PaidMemberGate` |
| `usePremium` | `usePaidMember` |

※ 後方互換のため旧用語はエイリアスとして残存

---

## セットアップ

### 前提条件

- Python 3.12+
- Node.js 18+
- PostgreSQL 17+
- Docker（デプロイ時）

### バックエンド起動

```bash
cd backend
./start_dev.sh
```

または手動:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

export DATABASE_URL="postgresql+psycopg2://dbadmin:0034caretLgbtQ@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require"
export PYTHONPATH=$(pwd):$PYTHONPATH

alembic upgrade head
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### フロントエンド起動

```bash
cd frontend
npm install
npm run dev
```

---

## 本番環境

- **フロントエンド**: Netlify (https://carat-rainbow-community.netlify.app)
- **バックエンド**: AWS App Runner
- **データベース**: AWS RDS PostgreSQL (ap-northeast-1)
  - ホスト: `rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com`
  - データベース名: `lgbtq_community`

---

## API エンドポイント

### 主要エンドポイント

- `GET /api/posts/` - 投稿一覧
- `POST /api/posts/` - 投稿作成
- `GET /api/matching/search` - マッチング検索
- `POST /api/matching/likes/{user_id}` - お気に入り追加
- `GET /api/jewelry/products` - ジュエリー商品一覧
- `POST /api/flea-market/items` - フリマ出品

**API ドキュメント**: http://localhost:8000/docs

---

## プロジェクト構成

```
carat_community/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── database.py
│   │   └── routers/
│   ├── alembic/
│   └── start_dev.sh
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   └── App.tsx
│   └── package.json
└── README.md
```

---

## 環境変数

### バックエンド

- `DATABASE_URL` - PostgreSQL接続文字列
- `PORT` - サーバーポート（デフォルト: 8000）
- `STRIPE_SECRET_KEY` - Stripe決済用

### フロントエンド

- `VITE_API_BASE_URL` - バックエンドAPI URL
- `VITE_STRIPE_PUBLISHABLE_KEY` - Stripe公開キー

---

## テストアカウント

- **Email**: tedyueda@gmail.com
- **Password**: tedyueda2024!

---

## ライセンス

現在検討中

---

## 現在の課題（2026-01-26）

### 講座・レッスン機能のデプロイ問題

**問題の概要:**
- ローカル環境では講座機能が正常に動作
- データベースには講座データが存在（1件確認済み）
- App Runnerにデプロイすると `/api/courses` エンドポイントが404エラー
- coursesルーターがApp Runnerで登録されていない

**試した対策:**
1. ✅ `backend/app/main.py` でcoursesルーターのインポートと登録を確認
2. ✅ Dockerイメージに `courses.py` が含まれていることを確認
3. ✅ 新しいイメージタグ（v2.0, v2.1）でECRにプッシュ
4. ✅ App Runnerでイメージタグを変更して再デプロイ
5. ❌ すべて失敗 - App Runnerのキャッシュ問題が深刻

**データベース確認結果:**
```sql
-- 講座データ: 1件存在
SELECT COUNT(*) FROM courses; -- 1
SELECT COUNT(*) FROM course_images WHERE course_id = 1; -- 1
SELECT COUNT(*) FROM course_videos WHERE course_id = 1; -- 2
```

**次回の対策案:**

1. **App Runnerサービスの完全削除と再作成**
   - 現在のサービス `rainbow-community-api` を削除
   - 同じ設定で新規サービスを作成（キャッシュを完全にクリア）

2. **AWS ECS Fargateへの移行**
   - App Runnerのキャッシュ問題を回避
   - より細かい制御が可能

3. **ローカルでDockerイメージを実行してデバッグ**
   ```bash
   docker run --rm -p 8001:8000 \
     -e DATABASE_URL="postgresql+psycopg2://..." \
     192933325498.dkr.ecr.ap-northeast-1.amazonaws.com/rainbow-community-api:v2.1
   ```
   起動ログでcoursesルーターが正常に登録されるか確認

4. **GitHub Actionsでの自動デプロイを再設定**
   - `.github/workflows/ecr-push.yml` を確認
   - 手動トリガーでデプロイを実行

**関連ファイル:**
- `backend/app/routers/courses.py` - 講座APIエンドポイント
- `backend/app/main.py` - coursesルーター登録（10行目、114行目）
- `DEPLOYMENT_ISSUE.md` - 詳細なデプロイ問題の記録
- `APP_RUNNER_NEW_SERVICE_SETUP.md` - 新サービス作成手順

**ECRイメージ:**
- リポジトリ: `192933325498.dkr.ecr.ap-northeast-1.amazonaws.com/rainbow-community-api`
- 最新タグ: `v2.1` (coursesルーター含む)

---

**最終更新**: 2026-01-26  
**リポジトリ**: https://github.com/tedueda/carat_community
