import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { LANGUAGE_NAMES, LANGUAGE_FLAGS, SupportedLanguage } from '../../i18n';

interface LanguageSelectorProps {
  variant?: 'header' | 'dropdown' | 'compact';
  className?: string;
  isHomePage?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'header',
  className = '',
  isHomePage = false
}) => {
  const { currentLanguage, setLanguage, supportedLanguages, isChangingLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = async (lang: SupportedLanguage) => {
    await setLanguage(lang);
    setIsOpen(false);
  };

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors ${isHomePage ? 'bg-transparent text-white hover:bg-white/20 border border-white/30' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
          disabled={isChangingLanguage}
        >
          <span className="text-base">{LANGUAGE_FLAGS[currentLanguage]}</span>
          <span className="text-sm font-medium">{LANGUAGE_NAMES[currentLanguage]}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
            {supportedLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                  currentLanguage === lang ? 'bg-gray-50 text-blue-600' : 'text-gray-900'
                }`}
              >
                <span className="text-base">{LANGUAGE_FLAGS[lang]}</span>
                <span className="flex-1 text-left">{LANGUAGE_NAMES[lang]}</span>
                {currentLanguage === lang && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isHomePage ? 'bg-transparent text-white hover:bg-white/20 border border-white/30' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}
        disabled={isChangingLanguage}
        aria-label="言語を選択"
      >
        <Globe className="h-5 w-5" />
        <span className="text-base font-medium">
          {LANGUAGE_FLAGS[currentLanguage]} {LANGUAGE_NAMES[currentLanguage]}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-2">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
            言語を選択 / Select Language
          </div>
          {supportedLanguages.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-base hover:bg-gray-50 transition-colors ${
                currentLanguage === lang ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
              }`}
            >
              <span className="text-xl">{LANGUAGE_FLAGS[lang]}</span>
              <span className="flex-1 text-left">{LANGUAGE_NAMES[lang]}</span>
              {currentLanguage === lang && <Check className="h-5 w-5 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
