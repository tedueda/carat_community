"""add post_media junction table for multiple images

Revision ID: 5d536f3622f2
Revises: cb9c88170ba1
Create Date: 2025-10-11 05:33:53.399612

"""
from alembic import op
import sqlalchemy as sa


revision = '5d536f3622f2'
down_revision = 'cb9c88170ba1'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    from sqlalchemy import Inspector
    insp = Inspector.from_engine(conn)
    
    if not insp.has_table('post_media'):
        op.create_table(
            'post_media',
            sa.Column('post_id', sa.Integer(), nullable=False),
            sa.Column('media_asset_id', sa.Integer(), nullable=False),
            sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
            sa.ForeignKeyConstraint(['media_asset_id'], ['media_assets.id'], ),
            sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ),
            sa.PrimaryKeyConstraint('post_id', 'media_asset_id')
        )
        op.create_index('ix_post_media_post_id', 'post_media', ['post_id'])


def downgrade():
    op.drop_index('ix_post_media_post_id', table_name='post_media')
    op.drop_table('post_media')
