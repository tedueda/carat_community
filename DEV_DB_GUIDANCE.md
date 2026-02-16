# AWS データベース設定ガイダンス（開発者向け）

本番環境のデータベース接続は AWS App Runner の環境変数で管理されています。誤設定による接続不良やデータ欠損を防ぐため、以下を厳守してください。

## 1. 本番バックエンド/API
- 本番 API URL: https://ddxdewgmen.ap-northeast-1.awsapprunner.com
- フロントエンドの本番ビルド時は、必ず以下でビルドしてください。
  ```bash
  VITE_API_URL=https://ddxdewgmen.ap-northeast-1.awsapprunner.com npm run build
  ```

## 2. App Runner の DB 設定（最重要）
- App Runner > Service > Configuration > Environment variables にある `DATABASE_URL` が、現在運用中の RDS エンドポイントを指しています。
- ここを勝手に変更しないでください。DB の切り替えが必要な場合は、スナップショット復元 → 新 RDS エンドポイントの動作確認 → `DATABASE_URL` を差し替え → Save & Deploy → `/api/health` で `{"status":"ok","db":"ok"}` を確認、の手順で行ってください。
- 誤った RDS エンドポイント（タイポ・別リージョン・古いインスタンス）を設定すると、起動時に DB マイグレーション失敗や 500 エラーが発生します。

## 3. 動作確認チェックリスト
- デプロイ後に以下を確認：
  - `GET https://ddxdewgmen.ap-northeast-1.awsapprunner.com/api/health` → `{"status":"ok","db":"ok"}`
  - `GET https://ddxdewgmen.ap-northeast-1.awsapprunner.com/api/posts?limit=1` → 投稿が 1 件以上返る

## 4. Windsurf / ローカル開発の注意
- ローカル実行時に `VITE_API_URL` を設定しても、DB への接続先はバックエンド(App Runner)側で制御されます。フロントから直接 DB を参照・変更することはありません。
- 本番相当の挙動確認は、上記の本番 API URL を用いてビルド／動作確認してください（`VITE_API_URL` の指定）。
- 既存の RDS を差し替える必要がある場合は、必ずオーナー承認の上、前述の手順で `DATABASE_URL` を更新してください。

## 5. まとめ（やってはいけないこと）
- `DATABASE_URL` を独断で変更しない
- 古い/誤った RDS エンドポイントを設定しない
- DB 切替をフロントの `VITE_API_URL` で済ませようとしない（DB はバックエンド側の設定）

このファイルは、ブランチ `devin/1771146625-header-overlap-fix` に含めています。開発者は必ず一読し、手順に従ってください。
