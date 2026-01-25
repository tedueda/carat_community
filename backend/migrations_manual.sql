-- ===== マッチングプロフィール拡張マイグレーション =====
-- 実行日: 2025-10-17

-- 1. matching_profiles に avatar_url と meeting_style を追加
ALTER TABLE matching_profiles ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);
ALTER TABLE matching_profiles ADD COLUMN IF NOT EXISTS meeting_style VARCHAR(50);

-- 2. 既存の meet_pref を meeting_style にコピー（互換性）
UPDATE matching_profiles 
SET meeting_style = meet_pref 
WHERE meet_pref IS NOT NULL AND meeting_style IS NULL;

-- 3. プロフィール画像テーブルを作成（最大5枚）
CREATE TABLE IF NOT EXISTS matching_profile_images (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER NOT NULL REFERENCES matching_profiles(user_id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_profile_order UNIQUE (profile_id, display_order),
    CONSTRAINT check_order_range CHECK (display_order >= 0 AND display_order < 5)
);

CREATE INDEX IF NOT EXISTS idx_profile_images_profile_id ON matching_profile_images(profile_id);

-- 4. 趣味マスターデータを投入
INSERT INTO hobbies (name) VALUES 
('料理'), ('グルメ'), ('カフェ巡り'), ('お酒・バー'), ('お菓子作り'),
('旅行'), ('温泉'), ('ドライブ'), ('バイク'), ('キャンプ'), ('登山'), ('釣り'), ('海・ビーチ'),
('スポーツ観戦'), ('ランニング'), ('筋トレ'), ('ヨガ'), ('ダンス'), ('サイクリング'),
('音楽鑑賞'), ('楽器'), ('カラオケ'), ('DJ'),
('映画'), ('海外ドラマ'), ('アニメ'), ('マンガ'), ('コスプレ'), ('ゲーム'), ('ボードゲーム'),
('アート'), ('写真'), ('デザイン'), ('ファッション'), ('手芸・DIY'),
('読書'), ('語学'), ('プログラミング'), ('テクノロジー'),
('ペット'), ('ガーデニング'), ('ボランティア'), ('その他')
ON CONFLICT (name) DO NOTHING;

-- 完了
SELECT 'マイグレーション完了' AS status;
