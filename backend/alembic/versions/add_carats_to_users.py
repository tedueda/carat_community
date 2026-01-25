"""add carats to users

Revision ID: add_carats_001
Revises: add_image_url_001
Create Date: 2025-11-15

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_carats_001'
down_revision = 'add_image_url_001'
depends_on = None


def upgrade():
    # Add carats column to users table
    op.add_column('users', sa.Column('carats', sa.Integer(), nullable=False, server_default='0'))


def downgrade():
    # Remove carats column from users table
    op.drop_column('users', 'carats')
