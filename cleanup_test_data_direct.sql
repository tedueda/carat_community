-- テストデータのクリーンアップ
-- ID=28とID=49以外のユーザーとその関連データを削除

BEGIN;

-- 削除前の確認
SELECT 'Before cleanup:' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_matching_profiles FROM matching_profiles;
SELECT COUNT(*) as total_posts FROM posts;

-- 削除対象のユーザーID一覧を表示
SELECT 'Users to be deleted:' as status;
SELECT id, email, display_name FROM users WHERE id NOT IN (28, 49);

-- 1. マッチングプロフィール画像を削除
DELETE FROM matching_profile_images 
WHERE profile_id NOT IN (28, 49);

-- 2. マッチングプロフィールを削除
DELETE FROM matching_profiles 
WHERE user_id NOT IN (28, 49);

-- 3. プロフィールを削除
DELETE FROM profiles 
WHERE user_id NOT IN (28, 49);

-- 4. コメントを削除
DELETE FROM comments 
WHERE user_id NOT IN (28, 49);

-- 5. リアクションを削除
DELETE FROM reactions 
WHERE user_id NOT IN (28, 49);

-- 6. いいねを削除
DELETE FROM likes 
WHERE from_user_id NOT IN (28, 49) OR to_user_id NOT IN (28, 49);

-- 7. マッチを削除
DELETE FROM matches 
WHERE user_a_id NOT IN (28, 49) OR user_b_id NOT IN (28, 49);

-- 8. チャットリクエストを削除
DELETE FROM chat_requests 
WHERE from_user_id NOT IN (28, 49) OR to_user_id NOT IN (28, 49);

-- 9. 投稿を削除
DELETE FROM posts 
WHERE user_id NOT IN (28, 49);

-- 10. メディアアセットを削除
DELETE FROM media_assets 
WHERE user_id NOT IN (28, 49);

-- 11. 通知を削除
DELETE FROM notifications 
WHERE user_id NOT IN (28, 49);

-- 12. ポイントイベントを削除
DELETE FROM point_events 
WHERE user_id NOT IN (28, 49);

-- 13. ユーザーアワードを削除
DELETE FROM user_awards 
WHERE user_id NOT IN (28, 49);

-- 14. レビューを削除
DELETE FROM reviews 
WHERE user_id NOT IN (28, 49);

-- 15. フォローを削除
DELETE FROM follows 
WHERE follower_user_id NOT IN (28, 49) OR followee_user_id NOT IN (28, 49);

-- 16. ブロックを削除
DELETE FROM blocks 
WHERE blocker_user_id NOT IN (28, 49) OR blocked_user_id NOT IN (28, 49);

-- 17. レポートを削除
DELETE FROM reports 
WHERE reporter_user_id NOT IN (28, 49);

-- 18. 最後にユーザーを削除
DELETE FROM users 
WHERE id NOT IN (28, 49);

-- 削除後の確認
SELECT 'After cleanup:' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_matching_profiles FROM matching_profiles;
SELECT COUNT(*) as total_posts FROM posts;

-- 残っているユーザーを表示
SELECT 'Remaining users:' as status;
SELECT id, email, display_name, membership_type FROM users;

COMMIT;

-- 結果を確認
SELECT 'Cleanup completed successfully!' as status;
