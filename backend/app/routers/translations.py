"""Translation API endpoints for posts."""
from fastapi import APIRouter, Depends, HTTPException, Query, Header, Request
import logging
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models import Post, PostTranslation as PostTranslationModel, MediaAsset, PostMedia, PostTourism
from app.schemas import PostWithTranslation
from app.auth import get_optional_user
from app.services.translation import (
    get_or_create_translation,
    get_user_preferred_language,
    detect_post_language,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE
)

router = APIRouter(prefix="/api/posts", tags=["translations"])
logger = logging.getLogger(__name__)


@router.get("/{post_id}/translated", response_model=PostWithTranslation)
async def get_post_with_translation(
    post_id: int,
    lang: Optional[str] = Query(None, description="Target language code (ja, en, ko, es, pt, fr, it, de)"),
    mode: Optional[str] = Query("translated", description="Display mode: 'translated' or 'original'"),
    accept_language: Optional[str] = Header(None, alias="Accept-Language"),
    db: Session = Depends(get_db),
    current_user = Depends(get_optional_user)
):
    """
    Get a post with translation support.
    
    - If mode='original', returns the original post content
    - If mode='translated', returns translated content if available
    - Translation is created on-demand and cached
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Determine target language
    user_lang = None  # TODO: Get from user profile when implemented
    target_lang = get_user_preferred_language(
        user_lang=user_lang,
        accept_language=accept_language,
        query_lang=lang
    )
    
    # Build base response
    post_dict = build_post_dict(post, db)
    
    # Add translation fields
    post_dict["original_lang"] = post.original_lang or "unknown"
    post_dict["view_lang"] = target_lang
    post_dict["display_title"] = post.title
    post_dict["display_text"] = post.body
    post_dict["has_translation"] = False
    post_dict["is_translated"] = False
    
    # Check if translation is needed
    if mode == "original" or target_lang == post.original_lang:
        # Return original content
        return PostWithTranslation(**post_dict)
    
    # Try to get or create translation
    translation = await get_or_create_translation(db, post, target_lang)
    
    if translation and not translation.error_code:
        post_dict["display_title"] = translation.translated_title or post.title
        post_dict["display_text"] = translation.translated_text
        post_dict["has_translation"] = True
        post_dict["is_translated"] = True
        logger.info(f"Returning translated post {post_id} in {target_lang}")
    else:
        # Translation failed or not available, return original
        post_dict["has_translation"] = translation is not None
        logger.info(f"Returning original post {post_id} (translation not available)")
    
    return PostWithTranslation(**post_dict)


@router.get("/languages")
async def get_supported_languages():
    """Get list of supported languages for translation."""
    return {
        "supported_languages": SUPPORTED_LANGUAGES,
        "default_language": DEFAULT_LANGUAGE,
        "language_names": {
            "ja": "日本語",
            "en": "English",
            "ko": "한국어",
            "es": "Español",
            "pt": "Português",
            "fr": "Français",
            "it": "Italiano",
            "de": "Deutsch"
        }
    }


def build_post_dict(post: Post, db: Session) -> dict:
    """Build a dictionary representation of a post."""
    post_dict = {
        "id": post.id,
        "user_id": post.user_id,
        "title": post.title,
        "body": post.body,
        "visibility": post.visibility,
        "youtube_url": post.youtube_url,
        "media_id": post.media_id,
        "media_url": None,
        "media_urls": [],
        "category": post.category,
        "subcategory": post.subcategory,
        "post_type": post.post_type or "post",
        "slug": post.slug,
        "status": post.status or "published",
        "og_image_url": post.og_image_url,
        "excerpt": post.excerpt,
        "goal_amount": post.goal_amount if hasattr(post, 'goal_amount') else 0,
        "current_amount": post.current_amount if hasattr(post, 'current_amount') else 0,
        "deadline": post.deadline if hasattr(post, 'deadline') else None,
        "tourism_details": None,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
        "like_count": 0,
        "comment_count": 0,
        "user_display_name": None
    }
    
    # Get user display name
    if post.user:
        post_dict["user_display_name"] = post.user.display_name
    
    # Get media URL
    if post.media_id:
        media = db.query(MediaAsset).filter(MediaAsset.id == post.media_id).first()
        if media:
            post_dict["media_url"] = media.url
    
    # Get media URLs
    post_media_records = db.query(PostMedia).filter(PostMedia.post_id == post.id).order_by(PostMedia.order_index).all()
    if post_media_records:
        media_urls = []
        for pm in post_media_records:
            media = db.query(MediaAsset).filter(MediaAsset.id == pm.media_asset_id).first()
            if media:
                url = media.url
                if url and url.startswith('/media/'):
                    url = f"https://rainbow-community-media-prod.s3.ap-northeast-1.amazonaws.com{url}"
                media_urls.append(url)
        post_dict["media_urls"] = media_urls
    
    # Get tourism details
    if post.post_type == 'tourism':
        tourism = db.query(PostTourism).filter(PostTourism.post_id == post.id).first()
        if tourism:
            post_dict["tourism_details"] = {
                "prefecture": tourism.prefecture,
                "event_datetime": tourism.event_datetime,
                "meet_place": tourism.meet_place,
                "meet_address": tourism.meet_address,
                "tour_content": tourism.tour_content,
                "fee": tourism.fee,
                "contact_phone": tourism.contact_phone,
                "contact_email": tourism.contact_email,
                "deadline": tourism.deadline,
                "attachment_pdf_url": tourism.attachment_pdf_url
            }
    
    return post_dict
