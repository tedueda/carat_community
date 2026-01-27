/**
 * Language utilities for translation feature
 */

export const SUPPORTED_LANGUAGES = ['ja', 'en', 'ko', 'es', 'pt', 'fr', 'it', 'de'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

const LANGUAGE_STORAGE_KEY = 'preferred_language';
const DEFAULT_LANGUAGE: SupportedLanguage = 'ja';

/**
 * Get the user's preferred language from localStorage
 */
export function getPreferredLanguage(): SupportedLanguage {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
      return stored as SupportedLanguage;
    }
  } catch (e) {
    console.warn('Failed to read preferred language from localStorage:', e);
  }
  
  // Fall back to browser language
  return detectBrowserLanguage();
}

/**
 * Set the user's preferred language in localStorage
 */
export function setPreferredLanguage(lang: SupportedLanguage): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (e) {
    console.warn('Failed to save preferred language to localStorage:', e);
  }
}

/**
 * Detect the browser's language and map it to a supported language
 */
export function detectBrowserLanguage(): SupportedLanguage {
  try {
    const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || '';
    const langCode = browserLang.split('-')[0].toLowerCase();
    
    if (SUPPORTED_LANGUAGES.includes(langCode as SupportedLanguage)) {
      return langCode as SupportedLanguage;
    }
  } catch (e) {
    console.warn('Failed to detect browser language:', e);
  }
  
  return DEFAULT_LANGUAGE;
}

/**
 * Get language display name
 */
export function getLanguageDisplayName(lang: string): string {
  const names: Record<string, string> = {
    ja: '日本語',
    en: 'English',
    ko: '한국어',
    es: 'Español',
    pt: 'Português',
    fr: 'Français',
    it: 'Italiano',
    de: 'Deutsch',
  };
  return names[lang] || lang;
}
