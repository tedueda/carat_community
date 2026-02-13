import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  SUPPORTED_LANGUAGES, 
  SupportedLanguage, 
  changeLanguage as i18nChangeLanguage,
  getCurrentLanguage 
} from '../i18n';
import { useAuth } from './AuthContext';
import { API_URL } from '../config';


interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  supportedLanguages: readonly SupportedLanguage[];
  isChangingLanguage: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const { user, token } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(getCurrentLanguage());
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  // Sync language from user preference on login
  useEffect(() => {
    const syncUserLanguage = async () => {
      if (user && token) {
        try {
          const response = await fetch(`${API_URL}/api/users/me/language`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.preferred_lang && SUPPORTED_LANGUAGES.includes(data.preferred_lang)) {
              await i18nChangeLanguage(data.preferred_lang);
              setCurrentLanguage(data.preferred_lang);
            }
          }
        } catch (error) {
          console.error('Failed to fetch user language preference:', error);
        }
      }
    };

    syncUserLanguage();
  }, [user, token]);

  // Update state when i18n language changes
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      const lang = lng.split('-')[0] as SupportedLanguage;
      if (SUPPORTED_LANGUAGES.includes(lang)) {
        setCurrentLanguage(lang);
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const setLanguage = useCallback(async (lang: SupportedLanguage) => {
    if (lang === currentLanguage) return;
    
    setIsChangingLanguage(true);
    try {
      // Update i18n
      await i18nChangeLanguage(lang);
      setCurrentLanguage(lang);

      // If user is logged in, save preference to server
      if (user && token) {
        try {
          await fetch(`${API_URL}/api/users/me/language`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ preferred_lang: lang }),
          });
        } catch (error) {
          console.error('Failed to save language preference:', error);
        }
      }
    } finally {
      setIsChangingLanguage(false);
    }
  }, [currentLanguage, user, token]);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        supportedLanguages: SUPPORTED_LANGUAGES,
        isChangingLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
