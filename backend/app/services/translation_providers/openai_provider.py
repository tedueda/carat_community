"""OpenAI translation provider using GPT models."""
import os
import logging
from typing import Optional

from .base import TranslationProvider, TranslationResult

logger = logging.getLogger(__name__)

# Supported languages
SUPPORTED_LANGUAGES = {
    "ja": "Japanese",
    "en": "English",
    "ko": "Korean",
    "es": "Spanish",
    "pt": "Portuguese",
    "fr": "French",
    "it": "Italian",
    "de": "German",
}


class OpenAITranslationProvider(TranslationProvider):
    """Translation provider using OpenAI GPT models."""
    
    provider_name = "openai"
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self._client = None
    
    def _get_client(self):
        """Lazy initialization of OpenAI client."""
        if self._client is None:
            try:
                from openai import AsyncOpenAI
                import httpx
                # Set explicit timeout to avoid connection issues
                timeout = httpx.Timeout(60.0, connect=30.0)
                self._client = AsyncOpenAI(
                    api_key=self.api_key,
                    timeout=timeout
                )
                logger.info(f"OpenAI client initialized with API key: {self.api_key[:10]}..." if self.api_key else "No API key")
            except ImportError:
                logger.error("OpenAI package not installed")
                raise
        return self._client
    
    def is_available(self) -> bool:
        """Check if OpenAI API key is configured."""
        return bool(self.api_key)
    
    async def translate(
        self,
        text: str,
        target_lang: str,
        source_lang: Optional[str] = None,
        title: Optional[str] = None
    ) -> TranslationResult:
        """Translate text using OpenAI GPT."""
        if not self.is_available():
            return TranslationResult(
                translated_text=text,
                translated_title=title,
                source_lang=source_lang,
                target_lang=target_lang,
                provider=self.provider_name,
                error_code="api_key_missing",
                success=False
            )
        
        if target_lang not in SUPPORTED_LANGUAGES:
            return TranslationResult(
                translated_text=text,
                translated_title=title,
                source_lang=source_lang,
                target_lang=target_lang,
                provider=self.provider_name,
                error_code="unsupported_language",
                success=False
            )
        
        target_lang_name = SUPPORTED_LANGUAGES[target_lang]
        source_lang_name = SUPPORTED_LANGUAGES.get(source_lang, "the original language") if source_lang else "auto-detected language"
        
        try:
            client = self._get_client()
            
            # Build the prompt
            content_to_translate = f"Text:\n{text}"
            if title:
                content_to_translate = f"Title: {title}\n\n{content_to_translate}"
            
            system_prompt = f"""You are a professional translator. Translate the following content from {source_lang_name} to {target_lang_name}.
Keep the original meaning, tone, and style. Do not add explanations or notes.
If there is a title, translate it separately and format your response as:
Title: [translated title]

Text:
[translated text]

If there is no title, just provide the translated text directly."""

            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": content_to_translate}
                ],
                temperature=0.3,
                max_tokens=4000
            )
            
            result_text = response.choices[0].message.content.strip()
            
            # Parse the response
            translated_title = None
            translated_text = result_text
            
            if title and result_text.startswith("Title:"):
                lines = result_text.split("\n", 2)
                if len(lines) >= 1:
                    translated_title = lines[0].replace("Title:", "").strip()
                if len(lines) >= 3:
                    # Find the text after "Text:" line
                    remaining = "\n".join(lines[1:])
                    if "Text:" in remaining:
                        translated_text = remaining.split("Text:", 1)[1].strip()
                    else:
                        translated_text = remaining.strip()
            
            return TranslationResult(
                translated_text=translated_text,
                translated_title=translated_title,
                source_lang=source_lang,
                target_lang=target_lang,
                provider=self.provider_name,
                success=True
            )
            
        except Exception as e:
            logger.error(f"OpenAI translation error: {e}")
            return TranslationResult(
                translated_text=text,
                translated_title=title,
                source_lang=source_lang,
                target_lang=target_lang,
                provider=self.provider_name,
                error_code=f"api_error:{type(e).__name__}",
                success=False
            )
    
    async def detect_language(self, text: str) -> str:
        """Detect language using OpenAI."""
        if not self.is_available():
            return "unknown"
        
        try:
            client = self._get_client()
            
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": f"Detect the language of the following text. Respond with only the ISO 639-1 language code (e.g., 'en', 'ja', 'ko', 'es', 'pt', 'fr', 'it', 'de'). If unsure, respond with 'unknown'."
                    },
                    {"role": "user", "content": text[:500]}  # Limit text length for detection
                ],
                temperature=0,
                max_tokens=10
            )
            
            detected = response.choices[0].message.content.strip().lower()
            
            # Validate the response
            if detected in SUPPORTED_LANGUAGES:
                return detected
            return "unknown"
            
        except Exception as e:
            logger.error(f"Language detection error: {e}")
            return "unknown"
