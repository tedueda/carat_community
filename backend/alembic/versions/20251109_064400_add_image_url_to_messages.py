"""add_image_url_to_messages

Revision ID: add_image_url_001
Revises: add_chat_request_001
Create Date: 2025-11-09 06:44:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_image_url_001'
down_revision = 'add_chat_request_001'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("""
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='messages' AND column_name='image_url'
            ) THEN
                ALTER TABLE messages ADD COLUMN image_url TEXT;
            END IF;
        END $$;
    """)


def downgrade():
    op.execute("""
        DO $$ 
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name='messages' AND column_name='image_url'
            ) THEN
                ALTER TABLE messages DROP COLUMN image_url;
            END IF;
        END $$;
    """)
