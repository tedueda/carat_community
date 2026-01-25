"""add_category_subcategory_and_blog_fields_to_posts

Revision ID: 7bb188854c12
Revises: 5d536f3622f2
Create Date: 2025-10-12 05:27:59.637331

"""
from alembic import op
import sqlalchemy as sa


revision = '7bb188854c12'
down_revision = '5d536f3622f2'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    from sqlalchemy import Inspector
    insp = Inspector.from_engine(conn)
    
    posts_columns = [c['name'] for c in insp.get_columns('posts')]
    
    if 'category' not in posts_columns:
        op.add_column('posts', sa.Column('category', sa.String(50), nullable=True))
    if 'subcategory' not in posts_columns:
        op.add_column('posts', sa.Column('subcategory', sa.String(100), nullable=True))
    if 'post_type' not in posts_columns:
        op.add_column('posts', sa.Column('post_type', sa.String(20), server_default='post', nullable=False))
    if 'slug' not in posts_columns:
        op.add_column('posts', sa.Column('slug', sa.String(200), nullable=True))
    if 'status' not in posts_columns:
        op.add_column('posts', sa.Column('status', sa.String(20), server_default='published', nullable=False))
    if 'og_image_url' not in posts_columns:
        op.add_column('posts', sa.Column('og_image_url', sa.String(500), nullable=True))
    if 'excerpt' not in posts_columns:
        op.add_column('posts', sa.Column('excerpt', sa.Text, nullable=True))
    
    constraints = [c['name'] for c in insp.get_check_constraints('posts')]
    if 'check_post_type' not in constraints:
        op.create_check_constraint('check_post_type', 'posts', "post_type IN ('post', 'blog', 'tourism')")
    if 'check_post_status' not in constraints:
        op.create_check_constraint('check_post_status', 'posts', "status IN ('draft', 'published')")
    
    indexes = [idx['name'] for idx in insp.get_indexes('posts')]
    if 'ix_posts_slug' not in indexes:
        op.create_index('ix_posts_slug', 'posts', ['slug'], unique=True)
    
    if not insp.has_table('posts_tourism'):
        op.create_table(
            'posts_tourism',
            sa.Column('post_id', sa.Integer, sa.ForeignKey('posts.id'), primary_key=True),
            sa.Column('prefecture', sa.String(50), nullable=True),
            sa.Column('event_datetime', sa.DateTime(timezone=True), nullable=True),
            sa.Column('meet_place', sa.String(200), nullable=True),
            sa.Column('meet_address', sa.String(500), nullable=True),
            sa.Column('tour_content', sa.Text, nullable=True),
            sa.Column('fee', sa.Integer, nullable=True),
            sa.Column('contact_phone', sa.String(20), nullable=True),
            sa.Column('contact_email', sa.String(200), nullable=True),
            sa.Column('deadline', sa.DateTime(timezone=True), nullable=True),
            sa.Column('attachment_pdf_url', sa.String(500), nullable=True)
        )


def downgrade():
    op.drop_table('posts_tourism')
    
    op.drop_index('ix_posts_slug', table_name='posts')
    
    op.drop_constraint('check_post_status', 'posts', type_='check')
    op.drop_constraint('check_post_type', 'posts', type_='check')
    
    op.drop_column('posts', 'excerpt')
    op.drop_column('posts', 'og_image_url')
    op.drop_column('posts', 'status')
    op.drop_column('posts', 'slug')
    op.drop_column('posts', 'post_type')
    op.drop_column('posts', 'subcategory')
    op.drop_column('posts', 'category')
