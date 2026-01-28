"""Translation API endpoints for posts, comments, and messages."""
from fastapi import APIRouter, Depends, HTTPException, Query, Header, Request
import logging
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from app.database import get_db
from app.models import (
    Post, PostTranslation as PostTranslationModel, MediaAsset, PostMedia, PostTourism,
    Comment, CommentTranslation, Message, MessageTranslation
)
from app.schemas import PostWithTranslation
from app.auth import get_optional_user
from app.services.translation import (
    get_or_create_translation,
    get_or_create_comment_translation,
    get_or_create_message_translation,
    get_user_preferred_language,
    detect_post_language,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE
)

router = APIRouter(prefix="/api", tags=["translations"])

# Response models
class CommentTranslationResponse(BaseModel):
    comment_id: int
    original_text: str
    translated_text: str
    target_lang: str
    is_translated: bool
    has_translation: bool

class MessageTranslationResponse(BaseModel):
    message_id: int
    original_text: str
    translated_text: str
    target_lang: str
    is_translated: bool
    has_translation: bool
logger = logging.getLogger(__name__)


@router.get("/posts/{post_id}/translated", response_model=PostWithTranslation)
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


@router.get("/translations/posts")
async def get_posts_with_translation(
    lang: Optional[str] = Query(None, description="Target language code (ja, en, ko, es, pt, fr, it, de)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(20, ge=1, le=100, description="Number of posts to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    accept_language: Optional[str] = Header(None, alias="Accept-Language"),
    db: Session = Depends(get_db),
    current_user = Depends(get_optional_user)
):
    """
    Get multiple posts with translation support.
    Returns posts with translated content if available.
    """
    # Determine target language
    target_lang = get_user_preferred_language(
        user_lang=None,
        accept_language=accept_language,
        query_lang=lang
    )
    
    # Build query
    query = db.query(Post).filter(Post.visibility == "public")
    if category:
        query = query.filter(Post.category == category)
    
    posts = query.order_by(Post.created_at.desc()).offset(offset).limit(limit).all()
    
    result = []
    for post in posts:
        post_dict = build_post_dict(post, db)
        
        # Add translation fields
        post_dict["original_lang"] = post.original_lang or "unknown"
        post_dict["view_lang"] = target_lang
        post_dict["display_title"] = post.title
        post_dict["display_text"] = post.body
        post_dict["has_translation"] = False
        post_dict["is_translated"] = False
        
        # Skip translation if same language
        if target_lang != post.original_lang:
            # Try to get or create translation
            translation = await get_or_create_translation(db, post, target_lang)
            
            if translation and not translation.error_code:
                post_dict["display_title"] = translation.translated_title or post.title
                post_dict["display_text"] = translation.translated_text
                post_dict["has_translation"] = True
                post_dict["is_translated"] = True
        
        result.append(post_dict)
    
    return result


@router.get("/comments/{comment_id}/translated", response_model=CommentTranslationResponse)
async def get_comment_with_translation(
    comment_id: int,
    lang: Optional[str] = Query(None, description="Target language code"),
    mode: Optional[str] = Query("translated", description="Display mode: 'translated' or 'original'"),
    accept_language: Optional[str] = Header(None, alias="Accept-Language"),
    db: Session = Depends(get_db),
    current_user = Depends(get_optional_user)
):
    """
    Get a comment with translation support.
    """
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if comment is None:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Determine target language
    target_lang = get_user_preferred_language(
        user_lang=None,
        accept_language=accept_language,
        query_lang=lang
    )
    
    response = {
        "comment_id": comment.id,
        "original_text": comment.body,
        "translated_text": comment.body,
        "target_lang": target_lang,
        "is_translated": False,
        "has_translation": False
    }
    
    # Return original if mode is original
    if mode == "original":
        return CommentTranslationResponse(**response)
    
    # Try to get or create translation
    translation = await get_or_create_comment_translation(db, comment, target_lang)
    
    if translation and not translation.error_code:
        response["translated_text"] = translation.translated_text
        response["has_translation"] = True
        response["is_translated"] = True
        logger.info(f"Returning translated comment {comment_id} in {target_lang}")
    else:
        response["has_translation"] = translation is not None
        logger.info(f"Returning original comment {comment_id} (translation not available)")
    
    return CommentTranslationResponse(**response)


@router.get("/messages/{message_id}/translated", response_model=MessageTranslationResponse)
async def get_message_with_translation(
    message_id: int,
    lang: Optional[str] = Query(None, description="Target language code"),
    mode: Optional[str] = Query("translated", description="Display mode: 'translated' or 'original'"),
    accept_language: Optional[str] = Header(None, alias="Accept-Language"),
    db: Session = Depends(get_db),
    current_user = Depends(get_optional_user)
):
    """
    Get a message with translation support.
    """
    message = db.query(Message).filter(Message.id == message_id).first()
    if message is None:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Determine target language
    target_lang = get_user_preferred_language(
        user_lang=None,
        accept_language=accept_language,
        query_lang=lang
    )
    
    response = {
        "message_id": message.id,
        "original_text": message.body or "",
        "translated_text": message.body or "",
        "target_lang": target_lang,
        "is_translated": False,
        "has_translation": False
    }
    
    # Return original if mode is original or body is empty
    if mode == "original" or not message.body:
        return MessageTranslationResponse(**response)
    
    # Try to get or create translation
    translation = await get_or_create_message_translation(db, message, target_lang)
    
    if translation and not translation.error_code:
        response["translated_text"] = translation.translated_text
        response["has_translation"] = True
        response["is_translated"] = True
        logger.info(f"Returning translated message {message_id} in {target_lang}")
    else:
        response["has_translation"] = translation is not None
        logger.info(f"Returning original message {message_id} (translation not available)")
    
    return MessageTranslationResponse(**response)


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
