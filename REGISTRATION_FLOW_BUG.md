# Registration Flow Bug — Handoff Document

## 概要

新規ユーザー登録後、KYC（本人確認）→ Stripe決済のフローに進めない問題。
ブラウザからの `/api/auth/register` へのPOSTリクエストが失敗する。

---

## 意図するフロー

```
新規登録 → 自動ログイン → /subscribe（KYC + Stripe決済）→ /feed
```

## 現在の状態

- **バックエンドAPI:** 正常動作（`curl` で登録・ログイン・billing status 全て成功）
- **フロントエンド:** ブラウザからのfetchが失敗する

---

## 問題の詳細

### 症状

ブラウザのコンソールに以下のエラーが表示される：

```
Registration attempt: {baseUrl: '(proxy)', email: 't.ueda@studioq.co.jp'}
Failed to load resource: the server responded with a status of 500 ()  /api/auth/register
Registration response: 500

Registration attempt: {baseUrl: 'https://ddxdewgmen.ap-northeast-1.awsapprunner.com', email: 't.ueda@studioq.co.jp'}
Fetch failed for https://ddxdewgmen... TypeError: Failed to fetch
```

### 2つの失敗パターン

1. **Netlifyプロキシ経由（同一ドメイン）:** `/api/auth/register` → **500 Internal Server Error**
2. **直接バックエンドURL（クロスオリジン）:** `https://ddxdewgmen.ap-northeast-1.awsapprunner.com/api/auth/register` → **TypeError: Failed to fetch**

### 重要な事実

- `curl` で同じURLに同じデータを送ると **200 OK** で成功する（直接でもNetlifyプロキシ経由でも）
- バックエンドのCORS設定は `allow_origins=["*"]` で全許可
- CORSプリフライト（OPTIONS）も正常に応答する
- ブラウザ拡張機能（iGiveFreely等）がインストールされている

---

## 試した修正と結果

### 1. RegisterForm のリダイレクト修正 ✅ 完了
- **変更:** 登録成功後 `/feed` → `/subscribe` にリダイレクト
- **ファイル:** `frontend/src/components/RegisterForm.tsx`
- **結果:** リダイレクト先は正しく変更された

### 2. PublicRoute の除外 ✅ 完了
- **変更:** `/register` ルートから `PublicRoute` ラッパーを除外
- **ファイル:** `frontend/src/App.tsx`
- **結果:** ログイン後のリダイレクト競合を解消

### 3. kyc_status の大文字小文字正規化 ✅ 完了
- **変更:** `billingStatus.kyc_status` を lowercase に正規化
- **ファイル:** `frontend/src/pages/SubscribePage.tsx`
- **結果:** KYCボタンの表示条件を修正

### 4. membership_status カラム追加 ✅ 完了
- **変更:** DBに `membership_status` カラムを追加（`ALTER TABLE users ADD COLUMN membership_status VARCHAR(50) DEFAULT 'free'`）
- **結果:** `/api/billing/status` のレスポンスにフィールドが含まれるようになった

### 5. 二重送信防止 ✅ 完了
- **変更:** `isSubmitting` ref を追加
- **ファイル:** `frontend/src/components/RegisterForm.tsx`
- **結果:** フォームの二重送信を防止

### 6. Netlifyプロキシ設定 ✅ 完了（しかし500エラー）
- **変更:** `netlify.toml` と `_redirects` に `/api/*` プロキシルールを追加
- **変更:** `config.ts` の `API_URL` を空文字に変更（同一ドメインプロキシ）
- **結果:** プロキシルールは認識されるが、ブラウザからのPOSTリクエストで500エラー

### 7. resilientFetch フォールバック ✅ 完了（しかし直接URLもブロック）
- **変更:** プロキシ失敗時に直接バックエンドURLにフォールバック
- **ファイル:** `frontend/src/contexts/AuthContext.tsx`, `frontend/src/components/RegisterForm.tsx`
- **結果:** プロキシ→500、直接URL→TypeError: Failed to fetch

---

## 未解決の根本原因（推定）

### 仮説1: Netlifyプロキシの問題
- `curl` では成功するが、ブラウザからのPOSTリクエストで500エラー
- Netlifyの無料プランでのプロキシ制限、またはリクエストボディの転送問題の可能性
- `netlify.toml` の `[[redirects]]` と `_redirects` ファイルの優先順位問題は修正済み

### 仮説2: ブラウザ拡張機能によるブロック
- 直接バックエンドURLへのfetchが `TypeError: Failed to fetch` で失敗
- `iGiveFreely` などのブラウザ拡張機能がリクエストをブロックしている可能性
- **検証方法:** シークレットモード（拡張機能無効）でテスト

### 仮説3: App Runner の接続制限
- App Runner がブラウザからの直接リクエストを拒否している可能性
- ただし `curl` では成功するため、User-Agent やリファラーによるフィルタリングの可能性は低い

---

## 環境情報

### フロントエンド
- **フレームワーク:** React + TypeScript + Vite
- **ホスティング:** Netlify（`carat-community.com`）
- **ビルド出力:** `frontend/dist`
- **Vite publicDir:** `frontend/public-lite`（`public` ではない）

### バックエンド
- **フレームワーク:** FastAPI (Python)
- **ホスティング:** AWS App Runner（`https://ddxdewgmen.ap-northeast-1.awsapprunner.com`）
- **DB:** PostgreSQL on AWS RDS（`rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com`）

### 主要ファイル
- `frontend/src/components/RegisterForm.tsx` — 登録フォーム
- `frontend/src/contexts/AuthContext.tsx` — 認証コンテキスト（login, resilientFetch）
- `frontend/src/config.ts` — API URL設定
- `frontend/src/pages/SubscribePage.tsx` — KYC + 決済ページ
- `frontend/src/App.tsx` — ルーティング
- `frontend/netlify.toml` — Netlify設定
- `frontend/public-lite/_redirects` — Netlifyリダイレクト
- `backend/app/routers/auth.py` — 登録・ログインAPI
- `backend/app/routers/billing.py` — billing status API
- `backend/app/models.py` — User モデル

### DB接続情報
- Host: `rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com`
- User: `dbadmin`
- Password: `NewPassword123!`
- Database: `lgbtq_community`

### テスト用コマンド

```bash
# 登録API直接テスト（成功する）
curl -X POST https://ddxdewgmen.ap-northeast-1.awsapprunner.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test12345","display_name":"テスト","phone_number":"09000000000"}'

# Netlifyプロキシ経由テスト（curlでは成功する）
curl -X POST https://carat-community.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test12345","display_name":"テスト","phone_number":"09000000000"}'

# ログインテスト
curl -X POST https://ddxdewgmen.ap-northeast-1.awsapprunner.com/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=Test12345"

# DB確認
PGPASSWORD='NewPassword123!' psql -h rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com -U dbadmin -d lgbtq_community -c "SELECT id, email, display_name FROM users ORDER BY id DESC LIMIT 10;"
```

---

## 推奨する次のステップ

1. **シークレットモードでテスト** — ブラウザ拡張機能を無効にした状態で登録を試す
2. **Netlifyプロキシのデバッグ** — Netlify Functions（サーバーレス関数）でAPIプロキシを実装する方が確実
3. **バックエンドログ確認** — App Runner のログで、ブラウザからのリクエストが実際に到達しているか確認
4. **別のブラウザでテスト** — Chrome以外（Safari, Firefox）で試す
5. **Netlify Functionsでプロキシ実装** — `_redirects` プロキシの代わりに、Netlify Functionsでサーバーサイドプロキシを実装

---

## 変更済みファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `frontend/src/components/RegisterForm.tsx` | リダイレクト先変更、二重送信防止、フォールバックfetch |
| `frontend/src/App.tsx` | `/register` ルートからPublicRoute除外 |
| `frontend/src/pages/SubscribePage.tsx` | kyc_status正規化、billingStatus nullフォールバック |
| `frontend/src/contexts/AuthContext.tsx` | resilientFetch追加、全API呼び出しにフォールバック |
| `frontend/src/config.ts` | API_URL空文字 + DIRECT_API_URLエクスポート |
| `frontend/netlify.toml` | /api/* プロキシルール追加 |
| `frontend/public-lite/_redirects` | /api/* プロキシルール追加 |
| `frontend/src/components/HomePage.tsx` | CTAボタンを/registerに変更 |
| DB: users テーブル | membership_status カラム追加 |
