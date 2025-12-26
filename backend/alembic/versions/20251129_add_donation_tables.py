"""add_donation_tables

Revision ID: add_donation_001
Revises: add_image_url_001
Create Date: 2025-11-29 06:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'add_donation_001'
down_revision = 'add_carats_001'  # add_carats_001の後に実行
branch_labels = None
depends_on = None


def upgrade():
    # donation_projects テーブルを作成
    op.execute("""
        CREATE TABLE IF NOT EXISTS donation_projects (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            title VARCHAR(200) NOT NULL,
            description TEXT NOT NULL,
            category VARCHAR(50) NOT NULL,
            goal_amount INTEGER NOT NULL,
            current_amount INTEGER NOT NULL DEFAULT 0,
            deadline DATE NOT NULL,
            image_urls JSON,
            supporters_count INTEGER NOT NULL DEFAULT 0,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # donation_supports テーブルを作成
    op.execute("""
        CREATE TABLE IF NOT EXISTS donation_supports (
            id SERIAL PRIMARY KEY,
            project_id INTEGER NOT NULL REFERENCES donation_projects(id),
            user_id INTEGER NOT NULL REFERENCES users(id),
            amount INTEGER NOT NULL,
            message TEXT,
            is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    # インデックスを作成
    op.execute("""
        CREATE INDEX IF NOT EXISTS ix_donation_projects_id ON donation_projects(id);
        CREATE INDEX IF NOT EXISTS ix_donation_projects_user_id ON donation_projects(user_id);
        CREATE INDEX IF NOT EXISTS ix_donation_projects_is_active ON donation_projects(is_active);
        CREATE INDEX IF NOT EXISTS ix_donation_supports_id ON donation_supports(id);
        CREATE INDEX IF NOT EXISTS ix_donation_supports_project_id ON donation_supports(project_id);
        CREATE INDEX IF NOT EXISTS ix_donation_supports_user_id ON donation_supports(user_id);
    """)


def downgrade():
    # テーブルを削除
    op.execute("DROP TABLE IF EXISTS donation_supports CASCADE;")
    op.execute("DROP TABLE IF EXISTS donation_projects CASCADE;")
