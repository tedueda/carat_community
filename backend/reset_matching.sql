-- マッチング関連データをリセットするSQLスクリプト

-- 現在のデータ件数を表示
SELECT 'messages' as table_name, COUNT(*) as count FROM messages
UNION ALL
SELECT 'chat_requests', COUNT(*) FROM chat_requests
UNION ALL
SELECT 'chats', COUNT(*) FROM chats
UNION ALL
SELECT 'likes', COUNT(*) FROM likes
UNION ALL
SELECT 'matches', COUNT(*) FROM matches;

-- データ削除
DELETE FROM messages;
DELETE FROM chat_requests;
DELETE FROM chats;
DELETE FROM likes;
DELETE FROM matches;

-- 削除後のデータ件数を表示
SELECT 'messages' as table_name, COUNT(*) as count FROM messages
UNION ALL
SELECT 'chat_requests', COUNT(*) FROM chat_requests
UNION ALL
SELECT 'chats', COUNT(*) FROM chats
UNION ALL
SELECT 'likes', COUNT(*) FROM likes
UNION ALL
SELECT 'matches', COUNT(*) FROM matches;
