-- 田中さん（user_id: 28）の投稿を削除
DELETE FROM posts WHERE user_id = 28;

-- 確認
SELECT COUNT(*) as deleted_count FROM posts WHERE user_id = 28;
