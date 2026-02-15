# Deploy (Netlify)

このリポジトリのフロントエンドは **`dist/` をNetlifyにデプロイ**します。

## やること（正しい手順）

- **[1] buildして`dist/`を作る**
  - `frontend/` で `npm run build`

- **[2] `dist/` を zip 化する**
  - `frontend/` で `zip -r carat_dist_final.zip dist`

- **[3] Netlifyへアップロードするのは zip（= distのみ）**
  - NetlifyのUIで **`carat_dist_final.zip`** をアップロード

## やってはいけないこと（事故防止）

- **ローカルサーバーやソース一式をアップロードしない**
  - `frontend/src` や `node_modules`、プロジェクトルートをそのままアップしない

- **`dist/` や `carat_dist_final.zip` をGitHubにコミットしない**
  - 生成物なのでGit管理しません（`.gitignore` で除外しています）

## 参考

- デプロイ対象は **ビルド成果物 `dist/`** だけです。
