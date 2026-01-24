-- 本番RDS用サンプルデータ投入スクリプト

-- 投稿データ（音楽カテゴリー）
INSERT INTO posts (user_id, title, body, category, post_type, status, visibility, created_at, updated_at)
VALUES 
(28, 'Midnight Whisper （AI Chill Music）', 'AIで作ってみました。いかがでしょうか？ #music', 'music', 'post', 'published', 'public', NOW(), NOW()),
(28, 'おすすめのLGBTQ+アーティスト', 'LGBTQコミュニティのアーティストの楽曲を紹介します！

多様性を歌うアーティストたちの音楽は、私たちの心に深く響きます。彼らの楽曲を通じて、愛の多様性や自分らしく生きることの大切さを感じることができます。

#music #LGBTQ #アーティスト #多様性 #愛', 'music', 'post', 'published', 'public', NOW(), NOW()),
(28, 'プライドソングプレイリスト', 'プライド月間にぴったりの楽曲をまとめたプレイリストを作成しました！

LGBTQをテーマにした楽曲や、多様性を歌った名曲を集めています。

#music #プライド #プレイリスト #LGBTQ', 'music', 'post', 'published', 'public', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 投稿データ（アートカテゴリー）
INSERT INTO posts (user_id, title, body, category, post_type, status, visibility, created_at, updated_at)
VALUES 
(28, '大阪城と桜の風景画', '大阪城と満開の桜を描いた風景画を制作しました！

春の訪れを感じる美しい季節に、大阪城の雄大な姿と満開の桜のコントラストを表現してみました。

#art #風景画 #大阪城 #桜 #春', 'art', 'post', 'published', 'public', NOW(), NOW()),
(28, '書道作品「月夜花」', '書道で「月夜花」という作品を書きました！

「月夜花」（げつやか）は、月夜に咲く花の美しさを表現した言葉です。

#art #書道 #月夜花 #行書', 'art', 'post', 'published', 'public', NOW(), NOW()),
(28, '水墨画「霧の山水」', '水墨画で「霧の山水」を描きました！

霧に包まれた山々の神秘的な風景を水墨画の技法で表現してみました。

#art #水墨画 #山水画 #霧', 'art', 'post', 'published', 'public', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- 投稿データ（サブカルチャーカテゴリー）
INSERT INTO posts (user_id, title, body, category, post_type, status, visibility, created_at, updated_at)
VALUES 
(28, 'ドラマ「好きな人がいること」レビュー', 'ドラマ「好きな人がいること」を見ました！

桐谷美玲さん主演の恋愛ドラマで、とても心温まる作品でした。

おすすめ度：★★★★☆

#comics #ドラマ #好きな人がいること', 'comics', 'post', 'published', 'public', NOW(), NOW()),
(28, 'ドラマ「おっさんずラブ」レビュー', '話題のドラマ「おっさんずラブ」を見ました！

田中圭さん主演のBLコメディドラマで、最初から最後まで笑いっぱなしでした。

おすすめ度：★★★★★

#comics #ドラマ #おっさんずラブ #BL', 'comics', 'post', 'published', 'public', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ジュエリー商品データ
INSERT INTO jewelry_products (name, description, material, size, price, price_includes_tax, stock, is_active, category, has_certificate, has_gem_id, created_at, updated_at)
VALUES 
('ダイヤモンドネックレス', '0.5カラットのダイヤモンドを使用した上品なネックレス', 'プラチナ900', 'チェーン長さ40cm', 150000, true, 5, true, 'necklace', true, false, NOW(), NOW()),
('サファイアリング', '深いブルーのサファイアが美しいリング', 'K18ホワイトゴールド', '11号', 120000, true, 3, true, 'ring', true, true, NOW(), NOW()),
('パールイヤリング', 'アコヤ真珠を使用したエレガントなイヤリング', 'K14ゴールド', '直径8mm', 80000, true, 10, true, 'earring', false, false, NOW(), NOW()),
('エメラルドブローチ', '鮮やかなグリーンのエメラルドブローチ', 'プラチナ850', '縦3cm×横2.5cm', 200000, true, 2, true, 'brooch', true, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

COMMIT;
