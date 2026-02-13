# App Runner 新サービス作成手順

## 背景

現在のApp Runnerサービス（rainbow-community-api）でcoursesルーターが登録されない問題が発生しています。
Dockerイメージキャッシュ問題のため、新しいサービスを作成して解決します。

## 作成手順

### 1. AWS Console にアクセス

1. AWS Console → App Runner
2. 「サービスを作成」をクリック

### 2. ソース設定

**リポジトリタイプ:**
- ☑ コンテナレジストリ
- ☐ ソースコードリポジトリ

**プロバイダー:**
- Amazon ECR

**コンテナイメージURI:**
```
192933325498.dkr.ecr.ap-northeast-1.amazonaws.com/rainbow-community-api:latest
```

**デプロイ設定:**
- ☑ 手動
- ☐ 自動

**ECRアクセスロール:**
- 既存のロールを使用: `apprunner-service-role-rainbow-community-api` または新規作成

### 3. サービス設定

**サービス名:**
```
rainbow-community-api-v2
```

**仮想CPU とメモリ:**
- CPU: 1 vCPU
- メモリ: 2 GB

**環境変数:**

| キー | 値 | タイプ |
|------|-----|--------|
| DATABASE_URL | `postgresql+psycopg2://dbadmin:NewPassword123!@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require` | プレーンテキスト |
| RUN_MIGRATIONS | `true` | プレーンテキスト |
| PORT | `8000` | プレーンテキスト |

**ポート:**
```
8000
```

### 4. ネットワーク設定

**カスタムVPC:**
- ☑ カスタムVPCを追加

**VPCコネクタ:**
- 既存のVPCコネクタを使用: `apprunner-conn-rainbow-etg`

または新規作成する場合:
- VPC: rainbow-community-vpc
- サブネット: プライベートサブネット（2つ以上）
- セキュリティグループ: 新規作成または既存のものを使用

### 5. ヘルスチェック設定

**ヘルスチェックプロトコル:**
- HTTP

**ヘルスチェックパス:**
```
/healthz
```

**間隔:** 10秒
**タイムアウト:** 5秒
**正常しきい値:** 1
**異常しきい値:** 5

### 6. セキュリティ設定

**インスタンスロール:**
- デフォルトまたは既存のロールを使用

### 7. 確認と作成

設定を確認して「作成とデプロイ」をクリック

## デプロイ後の確認

### 1. サービスURLの取得

デプロイ完了後、サービスURLが表示されます:
```
https://xxxxx.ap-northeast-1.awsapprunner.com
```

### 2. 動作確認コマンド

```bash
# 新しいURLを変数に設定
NEW_URL="https://xxxxx.ap-northeast-1.awsapprunner.com"

# ヘルスチェック
curl -s "$NEW_URL/api/health"
# 期待値: {"status":"ok","db":"ok"}

# 講座カテゴリAPI（重要！）
curl -s "$NEW_URL/api/courses/categories" | python3 -m json.tool
# 期待値: カテゴリのJSON配列

# 講座一覧API
curl -s "$NEW_URL/api/courses" | python3 -m json.tool | head -20

# OpenAPIドキュメントでcoursesパスを確認
curl -s "$NEW_URL/openapi.json" | python3 -c "import sys, json; data = json.load(sys.stdin); paths = data.get('paths', {}); course_paths = [p for p in paths.keys() if 'course' in p.lower()]; print(f'Course paths found: {len(course_paths)}'); [print(f'  - {p}') for p in course_paths[:10]]"
# 期待値: Course paths found: 9 以上

# 投稿API（カラットシステム確認）
curl -s "$NEW_URL/api/posts?limit=1" | python3 -m json.tool | head -30
```

### 3. 成功の判定基準

✅ `/api/health` が 200 OK を返す
✅ `/api/courses/categories` が JSON配列を返す（404ではない）
✅ OpenAPIドキュメントに courses パスが含まれている
✅ 投稿APIが正常に動作する

## フロントエンドの更新

### Netlify環境変数の更新

1. Netlify Dashboard → Site settings → Environment variables
2. `VITE_API_BASE_URL` を新しいURLに更新:
   ```
   https://xxxxx.ap-northeast-1.awsapprunner.com
   ```
3. 「Save」をクリック
4. Deploys → Trigger deploy → Deploy site

### ローカル開発環境の更新

```bash
# frontend/.env.local を更新
echo "VITE_API_BASE_URL=https://xxxxx.ap-northeast-1.awsapprunner.com" > frontend/.env.local
```

## 旧サービスの削除

新サービスが正常に動作することを確認したら:

1. AWS Console → App Runner
2. `rainbow-community-api`（旧サービス）を選択
3. 「アクション」→「サービスを削除」
4. 確認して削除

## トラブルシューティング

### coursesエンドポイントが404を返す場合

1. App Runnerのログを確認:
   ```
   ✅ Successfully imported courses router
   ✅ Courses router registered
   ```
   これらのメッセージが表示されているか確認

2. Dockerイメージが正しいか確認:
   ```bash
   docker pull 192933325498.dkr.ecr.ap-northeast-1.amazonaws.com/rainbow-community-api:latest
   docker run --rm 192933325498.dkr.ecr.ap-northeast-1.amazonaws.com/rainbow-community-api:latest ls -la /app/app/routers/courses.py
   ```

3. それでも解決しない場合は、サービスを削除して再作成

### データベース接続エラーの場合

1. VPCコネクタが正しく設定されているか確認
2. RDSセキュリティグループでApp Runnerからの接続を許可しているか確認
3. DATABASE_URL環境変数が正しいか確認

## 実装済み機能の確認

新サービスで以下の機能が動作することを確認:

1. ✅ **カラットシステム**
   - 新規投稿時に5カラット付与
   - いいね時に1カラット付与
   - アカウントページで総カラット表示

2. ✅ **講座レッスン機能**
   - 講座一覧表示
   - 講座詳細表示
   - 講座の作成・編集・削除（有料会員のみ）

---

作成日: 2026-01-26
最終更新: 2026-01-26
