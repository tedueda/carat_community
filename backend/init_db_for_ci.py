"""Initialize database tables for CI testing.

This script creates all tables from SQLAlchemy models before running Alembic migrations.
This is needed because the existing migrations assume tables already exist.
"""
from app.database import Base, engine
from app.models import (
    User, Orientation, Gender, Pronoun, Profile, MediaAsset, Post, Comment,
    Tag, PostTag, PostMedia, Follow, Reaction, Notification, Report, Block,
    ContentItem, Review, PointEvent, Award, UserAward
)

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created from models")
