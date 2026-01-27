import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import locale files
import ja from './locales/ja.json';
import en from './locales/en.json';
import ko from './locales/ko.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import de from './locales/de.json';

// Supported languages
export const SUPPORTED_LANGUAGES = ['ja', 'en', 'ko', 'es', 'pt', 'fr', 'it', 'de'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Language display names (in their native language)
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  ja: '日本語',
  en: 'English',
  ko: '한국어',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
  it: 'Italiano',
  de: 'Deutsch',
};

// Language flags (emoji)
export const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  ja: '🇯🇵',
  en: '🇺🇸',
  ko: '🇰🇷',
  es: '🇪🇸',
  pt: '🇧🇷',
  fr: '🇫🇷',
  it: '🇮🇹',
  de: '🇩🇪',
};

const resources = {
  ja: { translation: ja },
  en: { translation: en },
  ko: { translation: ko },
  es: { translation: es },
  pt: { translation: pt },
  fr: { translation: fr },
  it: { translation: it },
  de: { translation: de },
};

// Custom language detector that checks user preference first
const customLanguageDetector = {
  name: 'customDetector',
  lookup() {
    // 1. Check localStorage for user preference
    const storedLang = localStorage.getItem('preferred_lang');
    if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang as SupportedLanguage)) {
      return storedLang;
    }
    
    // 2. Check cookie
    const cookieLang = document.cookie
      .split('; ')
      .find(row => row.startsWith('preferred_lang='))
      ?.split('=')[1];
    if (cookieLang && SUPPORTED_LANGUAGES.includes(cookieLang as SupportedLanguage)) {
      return cookieLang;
    }
    
    // 3. Fall back to browser language detection
    return null;
  },
  cacheUserLanguage(lng: string) {
    localStorage.setItem('preferred_lang', lng);
    // Also set cookie for server-side access
    document.cookie = `preferred_lang=${lng};path=/;max-age=31536000`;
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ja',
    supportedLngs: SUPPORTED_LANGUAGES,
    
    detection: {
      order: ['customDetector', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    react: {
      useSuspense: false,
    },
  });

// Register custom detector
const languageDetector = i18n.services.languageDetector as {
  addDetector: (detector: typeof customLanguageDetector) => void;
};
if (languageDetector && typeof languageDetector.addDetector === 'function') {
  languageDetector.addDetector(customLanguageDetector);
}

// Helper function to change language
export const changeLanguage = async (lang: SupportedLanguage) => {
  await i18n.changeLanguage(lang);
  localStorage.setItem('preferred_lang', lang);
  document.cookie = `preferred_lang=${lang};path=/;max-age=31536000`;
  
  // Update HTML lang attribute
  document.documentElement.lang = lang;
};

// Helper function to get current language
export const getCurrentLanguage = (): SupportedLanguage => {
  const lang = i18n.language;
  if (SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
    return lang as SupportedLanguage;
  }
  // Handle language codes like 'en-US' -> 'en'
  const shortLang = lang.split('-')[0];
  if (SUPPORTED_LANGUAGES.includes(shortLang as SupportedLanguage)) {
    return shortLang as SupportedLanguage;
  }
  return 'ja';
};

export default i18n;
