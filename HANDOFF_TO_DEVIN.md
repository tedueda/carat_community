# Devinへの引き継ぎ資料

## 現在の状況

カラットシステムの実装を進めていますが、**カラットクリック機能が正常に動作していません**。

## 問題の詳細

### 症状
- 他人の投稿の💎アイコンをクリックしても、カウントが増えない
- 自分の投稿をクリックすると、正しく警告メッセージが表示される（この部分は動作している）
- APIコールは実行されているようだが、データベースに反映されていない

### 試したこと
1. フロントエンドの楽観的更新ロジックを修正
2. エラーハンドリングとロールバック処理を実装
3. APIエンドポイント `/api/posts/{post_id}/like` の確認
4. データベースに`carats`カラムを追加

### 完了している部分
- ✅ UI変更（❤️ → 💎、「いいね」→「カラット」）
- ✅ データベース設定（`users.carats`カラム追加）
- ✅ API実装（`like_count`、`comment_count`をレスポンスに含める）
- ✅ 自分の投稿へのカラット制限

## デバッグが必要な箇所

### 1. フロントエンド
**ファイル:** `frontend/src/components/PostDetailModal.tsx`
**関数:** `handleLike` (行207-250)

```typescript
const handleLike = async () => {
  if (!token) {
    alert('カラットするには会員登録が必要です');
    return;
  }

  // 自分の投稿にはカラットできない
  if (currentUser && post.user_id === currentUser.id) {
    alert('ご自身の投稿にはいいねカウントのクリックができません');
    return;
  }

  // 元の値を保存
  const originalIsLiked = isLiked;
  const originalLikeCount = likeCount;
  const newIsLiked = !isLiked;
  const newLikeCount = isLiked ? likeCount - 1 : likeCount + 1;
  
  // 楽観的更新
  setIsLiked(newIsLiked);
  setLikeCount(newLikeCount);
  
  try {
    const response = await fetch(`${API_URL}/api/posts/${post.id}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // エラーの場合は元に戻す
      setIsLiked(originalIsLiked);
      setLikeCount(originalLikeCount);
    } else {
      const data = await response.json();
      setLikeCount(data.like_count);
      setIsLiked(data.liked);
    }
  } catch (error) {
    console.error('Error liking post:', error);
    // エラーの場合は元に戻す
    setIsLiked(originalIsLiked);
    setLikeCount(originalLikeCount);
  }
  
  // 親コンポーネントに通知
  onLike?.(post.id);
};
```

**確認ポイント:**
- APIレスポンスが正しく返ってきているか？
- `data.like_count`と`data.liked`の値は正しいか？
- ブラウザのコンソールにエラーが出ていないか？

### 2. バックエンド
**ファイル:** `backend/app/routers/posts.py`
**エンドポイント:** `POST /api/posts/{post_id}/like`

**確認ポイント:**
- このエンドポイントが正しく実装されているか？
- `reactions`テーブルへの書き込みが成功しているか？
- レスポンスで`like_count`と`liked`を正しく返しているか？

**確認用SQL:**
```sql
-- 最近のリアクションを確認
SELECT * FROM reactions 
WHERE target_type='post' 
ORDER BY created_at DESC 
LIMIT 10;

-- 特定の投稿のいいね数を確認
SELECT COUNT(*) FROM reactions 
WHERE target_type='post' 
AND target_id=66 
AND reaction_type='like';
```

### 3. データベース接続
**環境変数:** `DATABASE_URL`
```
postgresql://dbadmin:NewPassword123!@rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com:5432/lgbtq_community?sslmode=require
```

**確認ポイント:**
- App Runnerの環境変数が正しく設定されているか？
- データベース接続が正常か？

## 推奨デバッグ手順

1. **ブラウザのコンソールを開く**
   - 💎をクリックした時のAPIレスポンスを確認
   - エラーメッセージがないか確認

2. **AWSのログを確認**
   - App Runnerの「ログ」タブで`/api/posts/{post_id}/like`のリクエストを確認
   - エラーログがないか確認

3. **データベースを直接確認**
   ```bash
   PGPASSWORD='NewPassword123!' psql -h rainbow-community-db-tokyo.cj8agmy8kjhv.ap-northeast-1.rds.amazonaws.com -U dbadmin -d lgbtq_community
   ```
   
   ```sql
   -- リアクションテーブルを確認
   SELECT * FROM reactions WHERE target_type='post' ORDER BY created_at DESC LIMIT 5;
   ```

4. **APIを直接テスト**
   ```bash
   # ログインしてトークンを取得
   TOKEN="your_token_here"
   
   # いいねAPIをテスト
   curl -X POST "https://ddxdewgmen.ap-northeast-1.awsapprunner.com/api/posts/66/like" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json"
   ```

## 環境情報

- **フロントエンド:** https://carat-rainbow-community.netlify.app
- **バックエンド:** https://ddxdewgmen.ap-northeast-1.awsapprunner.com
- **データベース:** PostgreSQL on AWS RDS (ap-northeast-1)
- **GitHubリポジトリ:** https://github.com/tedueda/rainbow_community
- **ブランチ:** main

## 最新のコミット

```
617c3de - Add carat system TODO: document completed work and remaining issues
a71e9a8 - Add error handling for like_count and comment_count queries
```

## 次にやるべきこと

1. **カラットクリック機能の修正**（最優先）
   - APIレスポンスとデータベース連携を確認
   - 必要に応じてバックエンドのエンドポイントを修正

2. **カラット付与ロジックの実装**
   - 新規投稿時に5カラット付与
   - いいねを受けた時に1カラット付与
   - チャット送信時に1カラット付与
   - お気に入りマッチング時に1カラット付与

3. **アカウントページでの総カラット表示**

## 参考資料

- `CARAT_SYSTEM_TODO.md` - 詳細な課題リスト
- `frontend/src/components/PostDetailModal.tsx` - モーダルのコード
- `backend/app/routers/posts.py` - 投稿APIのコード
- `backend/app/models.py` - データベースモデル

---
作成日: 2025-11-15
作成者: Cascade AI
引き継ぎ先: Devin
