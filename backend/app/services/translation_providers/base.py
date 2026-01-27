"""Base translation provider interface."""
from abc import ABC, abstractmethod
from typing import Optional
from dataclasses import dataclass


@dataclass
class TranslationResult:
    """Result of a translation operation."""
    translated_text: str
    translated_title: Optional[str] = None
    source_lang: Optional[str] = None
    target_lang: Optional[str] = None
    provider: str = "unknown"
    error_code: Optional[str] = None
    success: bool = True


class TranslationProvider(ABC):
    """Abstract base class for translation providers."""
    
    provider_name: str = "base"
    
    @abstractmethod
    async def translate(
        self,
        text: str,
        target_lang: str,
        source_lang: Optional[str] = None,
        title: Optional[str] = None
    ) -> TranslationResult:
        """
        Translate text to the target language.
        
        Args:
            text: The text to translate
            target_lang: Target language code (e.g., 'en', 'ja', 'ko')
            source_lang: Source language code (optional, auto-detect if not provided)
            title: Optional title to translate along with the text
            
        Returns:
            TranslationResult with translated text and metadata
        """
        pass
    
    @abstractmethod
    async def detect_language(self, text: str) -> str:
        """
        Detect the language of the given text.
        
        Args:
            text: The text to analyze
            
        Returns:
            Language code (e.g., 'en', 'ja', 'ko') or 'unknown'
        """
        pass
    
    def is_available(self) -> bool:
        """Check if the provider is properly configured and available."""
        return True
