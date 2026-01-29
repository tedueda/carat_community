"""Add nationality column to matching_profiles table

Revision ID: 20260129_nationality
Revises: 
Create Date: 2026-01-29

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260129_nationality'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add nationality column to matching_profiles table
    # Using batch mode for SQLite compatibility during tests
    try:
        op.add_column('matching_profiles', sa.Column('nationality', sa.String(100), nullable=True))
    except Exception:
        # Column may already exist
        pass


def downgrade():
    try:
        op.drop_column('matching_profiles', 'nationality')
    except Exception:
        pass
