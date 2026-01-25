# App Runner デプロイ問題 - 引き継ぎドキュメント

## 問題の概要

講座機能（courses）のバックエンドコードは完全に実装され、ローカル環境とDockerイメージでは正常に動作していますが、AWS App Runnerにデプロイすると`/api/courses`エンドポイントが404を返す問題が発生しています。

## 現状

### ✅ 完了している項目

1. **バックエンド実装**
   - `app/routers/courses.py` - 講座APIの完全実装
   - `app/models.py` - Course, CourseImage, CourseVideoモデル
   - `app/schemas.py` - CourseCreate, CourseUpdate, CourseResponseスキーマ
   - `app/main.py` - coursesルーターの登録

2. **データベース**
   - `courses`, `course_images`, `course_videos`テーブルが作成済み
   - `instructor_profile`カラムが追加済み
   - テストデータが1件登録済み（course_id=1）

3. **フロントエンド実装**
   - `frontend/src/components/courses/` - 全コンポーネント実装済み
   - Netlifyにデプロイ済み: https://carat-rainbow-community.netlify.app

4. **ローカル環境での動作確認**
   - ✅ Dockerイメージ内で`courses`ルーターが正常にインポートされる
   - ✅ `/api/courses`エンドポイントが正常にデータを返す
   - ✅ 158個のルートが登録される（coursesルート含む）

### ❌ 問題が発生している項目

**App Runner環境でのみ`courses`ルーターが登録されない**

- App RunnerのURL: https://ddxdewgmen.ap-northeast-1.awsapprunner.com
- `/api/courses` → 404 Not Found
- `/openapi.json` → coursesパスが含まれていない
- 登録されているルート数: 149個（coursesルートが欠落）

## 技術的詳細

### ECRイメージ

- リポジトリ: `192933325498.dkr.ecr.ap-northeast-1.amazonaws.com/rainbow-community-api`
- 最新タグ: `latest`
- 最新ダイジェスト: `sha256:7b0d359d09dc47d2ccb2300bf102077c06f7db9324b387cbacab1180f3246020`
- プッシュ日時: 2026-01-24 16:33 JST

### App Runner設定

- サービス名: rainbow-community-api
- イメージタグ: latest
- ポート: 8000
- 起動コマンド: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- VPCコネクタ: apprunner-conn-rainbow-etg
- データベース: RDS PostgreSQL (rainbow-community-db-tokyo)

### 環境変数

```
DATABASE_URL=postgresql+psycopg2://dbadmin:NewPassword123!@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require
```

## 試行した解決策（すべて失敗）

1. ✗ 複数回のデプロイボタンクリック
2. ✗ イメージタグの変更（latest → prod-v14 → v2）
3. ✗ `--no-cache`でのDockerイメージ再ビルド
4. ✗ App Runnerサービスの一時停止→再開
5. ✗ 起動コマンドの変更（start.sh → 直接uvicorn）
6. ✗ ヘルスチェック設定の調整
7. ✗ デバッグログの追加（`main.py`にtry-except追加）

## 問題の原因（推測）

App Runnerが**古いイメージをキャッシュし続けている**可能性が高い。新しいイメージをECRにプッシュしても、App Runnerは古いイメージを使い続けている。

### 証拠

1. ECRの`latest`タグは新しいダイジェストを指している
2. ローカルで同じイメージを実行すると`courses`ルーターが正常に動作する
3. App Runnerのログに`✅ Successfully imported courses router`メッセージが表示されない（デバッグログが追加されたはずなのに）

## 推奨される解決策

### オプション1: App Runnerサービスの再作成（最も確実）

1. 現在のApp Runnerサービスを削除
2. 同じ設定で新しいサービスを作成
3. 環境変数とVPCコネクタを再設定

### オプション2: 別名で新しいApp Runnerサービスを作成

1. 新しいサービス名で作成（例: rainbow-community-api-v2）
2. 動作確認後、古いサービスを削除
3. フロントエンドの環境変数を新しいURLに更新

### オプション3: 別のデプロイ方法に移行

- AWS ECS Fargate
- AWS EC2 + Docker
- AWS Elastic Beanstalk

## ローカルでの動作確認コマンド

```bash
# Dockerイメージのビルド
cd /Users/tedueda/rainbow_community/backend
docker build -t rainbow-community-backend:latest .

# ローカルでの実行
docker run --rm -p 8001:8000 \
  -e DATABASE_URL="postgresql+psycopg2://dbadmin:NewPassword123!@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require" \
  rainbow-community-backend:latest

# 動作確認
curl http://localhost:8001/api/courses
curl http://localhost:8001/api/_routes | grep -i course
```

## 関連ファイル

- `backend/app/routers/courses.py` - 講座API実装
- `backend/app/main.py` - ルーター登録（行10-20, 124-128）
- `backend/Dockerfile` - Dockerイメージ定義
- `backend/start.sh` - 起動スクリプト
- `frontend/.env.production` - 本番API URL設定
- `frontend/src/components/courses/` - フロントエンド実装

## データベース確認

```sql
-- 講座データの確認
SELECT id, title, instructor_profile, owner_user_id FROM courses;

-- 講座画像の確認
SELECT * FROM course_images WHERE course_id = 1;

-- 講座動画の確認
SELECT * FROM course_videos WHERE course_id = 1;
```

## 次のステップ

1. App Runnerサービスを削除して新規作成する
2. または、AWS ECS/EC2への移行を検討する
3. デプロイが成功したら、`/api/courses`エンドポイントの動作を確認
4. フロントエンドで講座一覧と詳細ページが正常に表示されることを確認

## 連絡先

- プロジェクトリポジトリ: /Users/tedueda/rainbow_community
- フロントエンドURL: https://carat-rainbow-community.netlify.app
- バックエンドURL: https://ddxdewgmen.ap-northeast-1.awsapprunner.com（現在問題あり）

---

作成日: 2026-01-24
作成者: Cascade AI
引き継ぎ先: Devin
