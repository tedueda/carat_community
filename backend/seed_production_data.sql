-- 本番RDS用サンプルデータ投入スクリプト
-- テスト投稿は削除済み

-- ジュエリー商品データ
INSERT INTO jewelry_products (name, description, material, size, price, price_includes_tax, stock, is_active, category, has_certificate, has_gem_id, created_at, updated_at)
VALUES 
('ダイヤモンドネックレス', '0.5カラットのダイヤモンドを使用した上品なネックレス', 'プラチナ900', 'チェーン長さ40cm', 150000, true, 5, true, 'necklace', true, false, NOW(), NOW()),
('サファイアリング', '深いブルーのサファイアが美しいリング', 'K18ホワイトゴールド', '11号', 120000, true, 3, true, 'ring', true, true, NOW(), NOW()),
('パールイヤリング', 'アコヤ真珠を使用したエレガントなイヤリング', 'K14ゴールド', '直径8mm', 80000, true, 10, true, 'earring', false, false, NOW(), NOW()),
('エメラルドブローチ', '鮮やかなグリーンのエメラルドブローチ', 'プラチナ850', '縦3cm×横2.5cm', 200000, true, 2, true, 'brooch', true, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

COMMIT;
