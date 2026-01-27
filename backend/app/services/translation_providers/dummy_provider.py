"""Dummy translation provider for testing and fallback."""
import logging
from typing import Optional

from .base import TranslationProvider, TranslationResult

logger = logging.getLogger(__name__)


class DummyTranslationProvider(TranslationProvider):
    """
    Dummy translation provider that returns the original text.
    Used for testing or when no real translation provider is configured.
    """
    
    provider_name = "dummy"
    
    async def translate(
        self,
        text: str,
        target_lang: str,
        source_lang: Optional[str] = None,
        title: Optional[str] = None
    ) -> TranslationResult:
        """Return original text without translation."""
        logger.info(f"Dummy provider: would translate from {source_lang} to {target_lang}")
        
        return TranslationResult(
            translated_text=text,
            translated_title=title,
            source_lang=source_lang or "unknown",
            target_lang=target_lang,
            provider=self.provider_name,
            error_code="dummy_provider",
            success=False  # Mark as not successful since no actual translation occurred
        )
    
    async def detect_language(self, text: str) -> str:
        """Return 'unknown' as dummy provider cannot detect language."""
        return "unknown"
    
    def is_available(self) -> bool:
        """Dummy provider is always available."""
        return True
