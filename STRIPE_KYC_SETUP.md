# Stripe KYC & Subscription Setup Guide (TEST Mode)

このドキュメントでは、Stripe Identity（KYC）とサブスクリプション決済機能のテストモードでの動作確認手順を説明します。

## 概要

本実装では、以下の2段階フローを実装しています：

1. **Phase 1: KYC（本人確認）** - Stripe Identityを使用した本人確認
2. **Phase 2: サブスクリプション** - KYC完了後のみ可能な月額課金

**重要**: KYCが`verified`状態にならない限り、サブスクリプションのチェックアウトには進めません。

## アーキテクチャ

### Backend (FastAPI)

- **POST /api/kyc/start** - Stripe Identity VerificationSessionを作成
- **POST /api/billing/checkout** - KYC検証後、Stripe Checkoutセッションを作成（KYC未完了時は403エラー）
- **POST /api/stripe/webhook** - Webhookイベントを受信し、署名検証とイベント冪等性を保証

### Frontend (React)

- **/subscribe** - KYCとサブスクリプションの統合ページ
- **/kyc/return** - Stripe Identityから戻った後のポーリングページ（最大30秒間、2秒間隔でステータス確認）
- **/billing/success** - サブスクリプション完了ページ
- **/billing/cancel** - キャンセル時の戻り先

### Database

- **users.kyc_status** - `unverified`, `pending`, `verified`, `failed`
- **users.kyc_verified_at** - 本人確認完了日時
- **users.membership_status** - `free`, `paid`
- **stripe_events** - Webhook冪等性管理テーブル（event_id unique制約）

## 環境変数設定

### Backend (.env)

```bash
# Stripe TEST Mode Keys
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_1Sy0PVAIFOpz52fjAk2kajfq

# Frontend URL
FRONTEND_ORIGIN=http://localhost:5173
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:8000
```

## データベースマイグレーション

```bash
cd backend
alembic upgrade head
```

マイグレーション内容：
- `users.kyc_verified_at` カラム追加
- `users.membership_status` カラム追加（enum: 'free', 'paid'）
- `stripe_events` テーブル作成（Webhook冪等性管理）

## Stripe Dashboard設定

### 1. Stripe Identity有効化

1. Stripe Dashboard → Settings → Identity
2. Test modeで有効化
3. Verification typesで "Document" を有効化

### 2. Subscription Product作成

1. Products → Create product
2. Name: "Carat Premium Membership"
3. Pricing: ¥1,000/month (recurring)
4. Price IDをコピー → `STRIPE_PRICE_ID_MONTHLY`に設定

### 3. Webhook設定

1. Developers → Webhooks → Add endpoint
2. Endpoint URL: `https://your-api-domain.com/api/stripe/webhook`
3. Listen to events:
   - `identity.verification_session.verified`
   - `identity.verification_session.canceled`
   - `identity.verification_session.requires_input`
   - `checkout.session.completed`
   - `customer.subscription.deleted`
4. Webhook signing secretをコピー → `STRIPE_WEBHOOK_SECRET`に設定

## テストモードでの動作確認手順

### Step 1: サーバー起動

```bash
# Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm run dev
```

### Step 2: ユーザー登録・ログイン

1. `/login` でログインまたは新規登録
2. ログイン後、`/subscribe` にアクセス

### Step 3: KYC（本人確認）開始

1. "本人確認を開始" ボタンをクリック
2. Stripe Identityのテストページにリダイレクト
3. **テストモードでの本人確認方法**:
   - Document type: "ID card" を選択
   - Upload document: テスト用画像をアップロード（任意の画像でOK）
   - Selfie: テスト用画像をアップロード（任意の画像でOK）
   - Submit

### Step 4: KYC結果確認

1. `/kyc/return` に自動リダイレクト
2. バックエンドが2秒間隔でステータスをポーリング（最大30秒）
3. Webhookで `identity.verification_session.verified` イベントを受信
4. `users.kyc_status` が `verified` に更新
5. 自動的に `/subscribe` にリダイレクト

### Step 5: サブスクリプション開始

1. `/subscribe` で "サブスクリプションを開始" ボタンが有効化
2. ボタンをクリック → Stripe Checkoutにリダイレクト
3. **テストカード情報**:
   - Card number: `4242 4242 4242 4242`
   - Expiry: 任意の未来の日付（例: 12/34）
   - CVC: 任意の3桁（例: 123）
   - ZIP: 任意（例: 12345）
4. "Subscribe" をクリック

### Step 6: サブスクリプション完了確認

1. `/billing/success` にリダイレクト
2. Webhookで `checkout.session.completed` イベントを受信
3. `users.membership_status` が `paid` に更新
4. `users.stripe_subscription_id` が保存される

## Webhook動作確認

### ローカル開発環境でのWebhook受信

Stripe CLIを使用してローカルでWebhookをテスト：

```bash
# Stripe CLI インストール
brew install stripe/stripe-cli/stripe

# Stripe CLIでログイン
stripe login

# Webhookをローカルにフォワード
stripe listen --forward-to localhost:8000/api/stripe/webhook

# 表示されるwebhook secretを STRIPE_WEBHOOK_SECRET に設定
```

### Webhookイベントの手動トリガー（テスト用）

```bash
# KYC verified イベント
stripe trigger identity.verification_session.verified

# Subscription completed イベント
stripe trigger checkout.session.completed
```

## トラブルシューティング

### KYCステータスが更新されない

1. Webhook署名検証を確認:
   ```bash
   # Backend logs
   tail -f backend/logs/app.log
   ```
2. `stripe_events` テーブルでイベント受信を確認:
   ```sql
   SELECT * FROM stripe_events ORDER BY created_at DESC LIMIT 10;
   ```

### チェックアウトで403エラー

- `users.kyc_status` が `verified` になっているか確認:
  ```sql
  SELECT id, email, kyc_status, kyc_verified_at FROM users WHERE email = 'test@example.com';
  ```

### Webhookが届かない

1. Stripe Dashboard → Developers → Webhooks → Logsで配信状況を確認
2. エンドポイントURLが正しいか確認
3. Webhook署名シークレットが正しいか確認

## セキュリティ要件

✅ **実装済み**:
- Webhook署名検証（必須）
- イベント冪等性（`stripe_events.event_id` unique制約）
- return_url到達だけで成功判定しない（Webhookで確定）
- KYC未完了時のチェックアウト拒否（403エラー）

## 本番環境への移行

本番環境に移行する際は、以下を変更してください：

1. Stripe KEYsをTESTモードからLIVEモードに変更
2. `STRIPE_SECRET_KEY`: `sk_live_...`
3. `STRIPE_PUBLISHABLE_KEY`: `pk_live_...`
4. `STRIPE_WEBHOOK_SECRET`: 本番用Webhookエンドポイントのシークレット
5. `STRIPE_PRICE_ID_MONTHLY`: 本番用Price ID

**注意**: 本番環境では実際の本人確認書類とセルフィーが必要です。

## API仕様

### POST /api/kyc/start

**Request**:
```json
// 認証ヘッダー必須
Authorization: Bearer <token>
```

**Response (Success)**:
```json
{
  "url": "https://verify.stripe.com/start/...",
  "sessionId": "vs_..."
}
```

**Response (Already Verified)**:
```json
{
  "alreadyVerified": true,
  "message": "KYC already verified"
}
```

### POST /api/billing/checkout

**Request**:
```json
// 認証ヘッダー必須
Authorization: Bearer <token>
```

**Response (Success)**:
```json
{
  "url": "https://checkout.stripe.com/c/pay/...",
  "session_id": "cs_..."
}
```

**Response (KYC Not Verified - 403)**:
```json
{
  "detail": "KYC verification required before subscription. Please complete identity verification first."
}
```

### POST /api/stripe/webhook

**Request**:
```
Stripe-Signature: t=...,v1=...
Content-Type: application/json

{Stripe Event JSON}
```

**Response**:
```json
{
  "status": "success"
}
```

## まとめ

この実装により、以下が保証されます：

1. ✅ KYC完了前はサブスクリプション不可
2. ✅ Webhook署名検証による安全性
3. ✅ イベント冪等性による重複処理防止
4. ✅ return_urlではなくWebhookでの状態確定
5. ✅ TESTモードでの完全な動作確認が可能

テストモードで十分に動作確認を行った後、本番環境に移行してください。
