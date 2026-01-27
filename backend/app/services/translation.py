"""Translation service for posts."""
import os
import logging
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models import Post, PostTranslation
from app.services.translation_providers.base import TranslationProvider, TranslationResult
from app.services.translation_providers.openai_provider import OpenAITranslationProvider
from app.services.translation_providers.dummy_provider import DummyTranslationProvider

logger = logging.getLogger(__name__)

# Supported languages
SUPPORTED_LANGUAGES = ["ja", "en", "ko", "es", "pt", "fr", "it", "de"]
DEFAULT_LANGUAGE = "ja"


def get_translation_provider() -> TranslationProvider:
    """Get the configured translation provider."""
    provider_name = os.getenv("TRANSLATION_PROVIDER", "openai").lower()
    
    if provider_name == "openai":
        provider = OpenAITranslationProvider()
        if provider.is_available():
            return provider
        logger.warning("OpenAI provider not available, falling back to dummy")
    
    return DummyTranslationProvider()


async def detect_post_language(text: str, title: Optional[str] = None) -> str:
    """
    Detect the language of a post's content.
    
    Args:
        text: The post body text
        title: Optional post title
        
    Returns:
        Detected language code or 'unknown'
    """
    provider = get_translation_provider()
    
    # Combine title and text for better detection
    content = f"{title}\n{text}" if title else text
    
    try:
        detected = await provider.detect_language(content)
        if detected in SUPPORTED_LANGUAGES:
            return detected
        return "unknown"
    except Exception as e:
        logger.error(f"Language detection failed: {e}")
        return "unknown"


async def get_or_create_translation(
    db: Session,
    post: Post,
    target_lang: str
) -> Optional[PostTranslation]:
    """
    Get existing translation or create a new one.
    
    This function handles the on-demand translation with caching.
    It uses database UNIQUE constraint to prevent duplicate translations.
    
    Args:
        db: Database session
        post: The post to translate
        target_lang: Target language code
        
    Returns:
        PostTranslation object or None if translation failed
    """
    if target_lang not in SUPPORTED_LANGUAGES:
        logger.warning(f"Unsupported target language: {target_lang}")
        return None
    
    # Check if translation already exists (cache hit)
    existing = db.query(PostTranslation).filter(
        PostTranslation.post_id == post.id,
        PostTranslation.lang == target_lang
    ).first()
    
    if existing:
        logger.info(f"Cache hit: translation for post {post.id} to {target_lang}")
        return existing
    
    # No existing translation, create one
    logger.info(f"Cache miss: creating translation for post {post.id} to {target_lang}")
    
    # Skip translation if source and target are the same
    source_lang = post.original_lang or "unknown"
    if source_lang == target_lang:
        logger.info(f"Source and target language are the same ({target_lang}), skipping translation")
        return None
    
    provider = get_translation_provider()
    
    try:
        result = await provider.translate(
            text=post.body,
            target_lang=target_lang,
            source_lang=source_lang if source_lang != "unknown" else None,
            title=post.title
        )
        
        # Create translation record
        translation = PostTranslation(
            post_id=post.id,
            lang=target_lang,
            translated_title=result.translated_title,
            translated_text=result.translated_text,
            provider=result.provider,
            error_code=result.error_code if not result.success else None
        )
        
        try:
            db.add(translation)
            db.commit()
            db.refresh(translation)
            return translation
        except IntegrityError:
            # Another request already created this translation (race condition)
            db.rollback()
            logger.info(f"Race condition: translation already exists for post {post.id} to {target_lang}")
            return db.query(PostTranslation).filter(
                PostTranslation.post_id == post.id,
                PostTranslation.lang == target_lang
            ).first()
            
    except Exception as e:
        logger.error(f"Translation failed for post {post.id}: {e}")
        db.rollback()
        return None


def get_user_preferred_language(
    user_lang: Optional[str] = None,
    accept_language: Optional[str] = None,
    query_lang: Optional[str] = None
) -> str:
    """
    Determine the user's preferred language.
    
    Priority:
    1. Query parameter (?lang=xx)
    2. User profile setting (if logged in)
    3. Accept-Language header
    4. Default to 'ja'
    
    Args:
        user_lang: Language from user profile
        accept_language: Accept-Language header value
        query_lang: Language from query parameter
        
    Returns:
        Language code
    """
    # Priority 1: Query parameter
    if query_lang and query_lang in SUPPORTED_LANGUAGES:
        return query_lang
    
    # Priority 2: User profile setting
    if user_lang and user_lang in SUPPORTED_LANGUAGES:
        return user_lang
    
    # Priority 3: Accept-Language header
    if accept_language:
        # Parse Accept-Language header (simplified)
        # Format: "ja,en-US;q=0.9,en;q=0.8"
        for lang_part in accept_language.split(","):
            lang = lang_part.split(";")[0].strip().split("-")[0].lower()
            if lang in SUPPORTED_LANGUAGES:
                return lang
    
    # Priority 4: Default
    return DEFAULT_LANGUAGE
