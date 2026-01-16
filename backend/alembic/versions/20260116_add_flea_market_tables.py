"""add_flea_market_tables

Revision ID: add_flea_market_001
Revises: add_donation_001
Create Date: 2026-01-16 19:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_flea_market_001'
down_revision = 'add_donation_001'
branch_labels = None
depends_on = None


def upgrade():
    # flea_market_items テーブルを作成
    op.execute("""
        CREATE TABLE IF NOT EXISTS flea_market_items (
            id SERIAL PRIMARY KEY,
            seller_id INTEGER NOT NULL REFERENCES users(id),
            title VARCHAR(200) NOT NULL,
            description TEXT NOT NULL,
            price INTEGER NOT NULL,
            is_negotiable BOOLEAN NOT NULL DEFAULT FALSE,
            category VARCHAR(50) NOT NULL,
            region VARCHAR(100),
            transaction_method VARCHAR(50) NOT NULL DEFAULT 'negotiable',
            status VARCHAR(20) NOT NULL DEFAULT 'active',
            view_count INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT check_flea_market_status CHECK (status IN ('active', 'reserved', 'sold', 'cancelled')),
            CONSTRAINT check_transaction_method CHECK (transaction_method IN ('hand_delivery', 'shipping', 'negotiable'))
        );
    """)
    
    # flea_market_item_images テーブルを作成
    op.execute("""
        CREATE TABLE IF NOT EXISTS flea_market_item_images (
            id SERIAL PRIMARY KEY,
            item_id INTEGER NOT NULL REFERENCES flea_market_items(id) ON DELETE CASCADE,
            image_url VARCHAR(500) NOT NULL,
            display_order INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # flea_market_chats テーブルを作成
    op.execute("""
        CREATE TABLE IF NOT EXISTS flea_market_chats (
            id SERIAL PRIMARY KEY,
            item_id INTEGER NOT NULL REFERENCES flea_market_items(id) ON DELETE CASCADE,
            buyer_id INTEGER NOT NULL REFERENCES users(id),
            seller_id INTEGER NOT NULL REFERENCES users(id),
            last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT unique_item_buyer UNIQUE (item_id, buyer_id)
        );
    """)
    
    # flea_market_messages テーブルを作成
    op.execute("""
        CREATE TABLE IF NOT EXISTS flea_market_messages (
            id SERIAL PRIMARY KEY,
            chat_id INTEGER NOT NULL REFERENCES flea_market_chats(id) ON DELETE CASCADE,
            sender_id INTEGER NOT NULL REFERENCES users(id),
            content TEXT NOT NULL,
            is_read BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # インデックスを作成
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_flea_market_items_id ON flea_market_items(id);
        CREATE INDEX IF NOT EXISTS ix_flea_market_items_seller_id ON flea_market_items(seller_id);
        CREATE INDEX IF NOT EXISTS ix_flea_market_items_status ON flea_market_items(status);
        CREATE INDEX IF NOT EXISTS ix_flea_market_items_category ON flea_market_items(category);
        CREATE INDEX IF NOT EXISTS ix_flea_market_items_created_at ON flea_market_items(created_at DESC);
        CREATE INDEX IF NOT EXISTS ix_flea_market_item_images_item_id ON flea_market_item_images(item_id);
        CREATE INDEX IF NOT EXISTS ix_flea_market_chats_item_id ON flea_market_chats(item_id);
        CREATE INDEX IF NOT EXISTS ix_flea_market_chats_buyer_id ON flea_market_chats(buyer_id);
        CREATE INDEX IF NOT EXISTS ix_flea_market_chats_seller_id ON flea_market_chats(seller_id);
        CREATE INDEX IF NOT EXISTS ix_flea_market_messages_chat_id ON flea_market_messages(chat_id);
        CREATE INDEX IF NOT EXISTS ix_flea_market_messages_sender_id ON flea_market_messages(sender_id);
    """)


def downgrade():
    # テーブルを削除（依存関係の順序で）
    op.execute("DROP TABLE IF EXISTS flea_market_messages CASCADE;")
    op.execute("DROP TABLE IF EXISTS flea_market_chats CASCADE;")
    op.execute("DROP TABLE IF EXISTS flea_market_item_images CASCADE;")
    op.execute("DROP TABLE IF EXISTS flea_market_items CASCADE;")
