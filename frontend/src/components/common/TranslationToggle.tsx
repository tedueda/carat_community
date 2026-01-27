import React from 'react';
import { Globe, Languages } from 'lucide-react';
import { Button } from '../ui/button';

// Supported languages
export const SUPPORTED_LANGUAGES = {
  ja: '日本語',
  en: 'English',
  ko: '한국어',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
  it: 'Italiano',
  de: 'Deutsch',
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

interface TranslationToggleProps {
  isTranslated: boolean;
  isLoading?: boolean;
  hasTranslation: boolean;
  originalLang?: string;
  viewLang?: string;
  onToggle: () => void;
  error?: string | null;
}

const TranslationToggle: React.FC<TranslationToggleProps> = ({
  isTranslated,
  isLoading = false,
  hasTranslation,
  originalLang,
  viewLang,
  onToggle,
  error,
}) => {
  const originalLangName = originalLang && originalLang in SUPPORTED_LANGUAGES 
    ? SUPPORTED_LANGUAGES[originalLang as SupportedLanguage] 
    : originalLang || '不明';
  
  const viewLangName = viewLang && viewLang in SUPPORTED_LANGUAGES
    ? SUPPORTED_LANGUAGES[viewLang as SupportedLanguage]
    : viewLang || '日本語';

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full" />
        <span>翻訳中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600">
        <Globe className="h-4 w-4" />
        <span>翻訳に失敗しました（原文を表示中）</span>
      </div>
    );
  }

  // Don't show toggle if original language matches view language
  if (originalLang === viewLang) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      >
        <Languages className="h-4 w-4" />
        {isTranslated ? (
          <span>原文を見る ({originalLangName})</span>
        ) : (
          <span>翻訳を見る ({viewLangName})</span>
        )}
      </Button>
      {hasTranslation && isTranslated && (
        <span className="text-xs text-gray-400">
          {originalLangName} → {viewLangName}
        </span>
      )}
    </div>
  );
};

export default TranslationToggle;
