"""
Add ON DELETE CASCADE to key foreign keys and ensure profile uniqueness

Revision ID: 20250926_0001
Revises: 
Create Date: 2025-09-26 06:55:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector

# revision identifiers, used by Alembic.
revision = '20250926_0001'
down_revision = None
branch_labels = None
depends_on = None

def _has_constraint(conn, table, name):
    insp = Inspector.from_engine(conn)
    if not insp.has_table(table):
        return False
    for fk in insp.get_foreign_keys(table):
        if fk.get('name') == name:
            return True
    for uq in insp.get_unique_constraints(table):
        if uq.get('name') == name:
            return True
    return False

def upgrade():
    conn = op.get_bind()
    insp = Inspector.from_engine(conn)
    
    if not insp.has_table('users') or not insp.has_table('posts'):
        return
    
    dialect = conn.dialect.name

    # profiles.user_id is already PK, but add an explicit UNIQUE constraint name if desired
    if not _has_constraint(conn, 'profiles', 'uq_profiles_user_id'):
        try:
            op.create_unique_constraint('uq_profiles_user_id', 'profiles', ['user_id'])
        except Exception:
            pass

    # For ON DELETE CASCADE, we must drop and re-create FKs where necessary
    # comments(post_id -> posts.id), comments(user_id -> users.id)
    if _has_constraint(conn, 'comments', 'comments_post_id_fkey'):
        try:
            op.drop_constraint('comments_post_id_fkey', 'comments', type_='foreignkey')
        except Exception:
            pass
    if not _has_constraint(conn, 'comments', 'comments_post_id_fkey'):
        op.create_foreign_key('comments_post_id_fkey', 'comments', 'posts', ['post_id'], ['id'], ondelete='CASCADE')

    if _has_constraint(conn, 'comments', 'comments_user_id_fkey'):
        try:
            op.drop_constraint('comments_user_id_fkey', 'comments', type_='foreignkey')
        except Exception:
            pass
    if not _has_constraint(conn, 'comments', 'comments_user_id_fkey'):
        op.create_foreign_key('comments_user_id_fkey', 'comments', 'users', ['user_id'], ['id'], ondelete='CASCADE')

    # post_tags(post_id -> posts.id), post_tags(tag_id -> tags.id)
    if _has_constraint(conn, 'post_tags', 'post_tags_post_id_fkey'):
        try:
            op.drop_constraint('post_tags_post_id_fkey', 'post_tags', type_='foreignkey')
        except Exception:
            pass
    if not _has_constraint(conn, 'post_tags', 'post_tags_post_id_fkey'):
        op.create_foreign_key('post_tags_post_id_fkey', 'post_tags', 'posts', ['post_id'], ['id'], ondelete='CASCADE')

    if _has_constraint(conn, 'post_tags', 'post_tags_tag_id_fkey'):
        try:
            op.drop_constraint('post_tags_tag_id_fkey', 'post_tags', type_='foreignkey')
        except Exception:
            pass
    if not _has_constraint(conn, 'post_tags', 'post_tags_tag_id_fkey'):
        op.create_foreign_key('post_tags_tag_id_fkey', 'post_tags', 'tags', ['tag_id'], ['id'], ondelete='CASCADE')

    # reactions(user_id -> users.id) is safe to cascade
    if _has_constraint(conn, 'reactions', 'reactions_user_id_fkey'):
        try:
            op.drop_constraint('reactions_user_id_fkey', 'reactions', type_='foreignkey')
        except Exception:
            pass
    if not _has_constraint(conn, 'reactions', 'reactions_user_id_fkey'):
        op.create_foreign_key('reactions_user_id_fkey', 'reactions', 'users', ['user_id'], ['id'], ondelete='CASCADE')

    # posts(user_id -> users.id), posts.media_id -> media_assets.id (do NOT cascade media)
    if _has_constraint(conn, 'posts', 'posts_user_id_fkey'):
        try:
            op.drop_constraint('posts_user_id_fkey', 'posts', type_='foreignkey')
        except Exception:
            pass
    if not _has_constraint(conn, 'posts', 'posts_user_id_fkey'):
        op.create_foreign_key('posts_user_id_fkey', 'posts', 'users', ['user_id'], ['id'], ondelete='CASCADE')

    # point_events(user_id -> users.id)
    if _has_constraint(conn, 'point_events', 'point_events_user_id_fkey'):
        try:
            op.drop_constraint('point_events_user_id_fkey', 'point_events', type_='foreignkey')
        except Exception:
            pass
    if not _has_constraint(conn, 'point_events', 'point_events_user_id_fkey'):
        op.create_foreign_key('point_events_user_id_fkey', 'point_events', 'users', ['user_id'], ['id'], ondelete='CASCADE')


def downgrade():
    # Best-effort downgrade: drop recreated constraints (names as above) and re-add without cascade
    try:
        op.drop_constraint('uq_profiles_user_id', 'profiles', type_='unique')
    except Exception:
        pass

    for table, cname, rtable, cols, rcols in [
        ('comments', 'comments_post_id_fkey', 'posts', ['post_id'], ['id']),
        ('comments', 'comments_user_id_fkey', 'users', ['user_id'], ['id']),
        ('post_tags', 'post_tags_post_id_fkey', 'posts', ['post_id'], ['id']),
        ('post_tags', 'post_tags_tag_id_fkey', 'tags', ['tag_id'], ['id']),
        ('reactions', 'reactions_user_id_fkey', 'users', ['user_id'], ['id']),
        ('posts', 'posts_user_id_fkey', 'users', ['user_id'], ['id']),
        ('point_events', 'point_events_user_id_fkey', 'users', ['user_id'], ['id']),
    ]:
        try:
            op.drop_constraint(cname, table, type_='foreignkey')
        except Exception:
            pass
        op.create_foreign_key(cname, table, rtable, cols, rcols)
