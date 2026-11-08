import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, LanguageOption } from '../types/i18n';
import { TRANSLATIONS, getCategoryLabel, getDifficultyLabel } from '../i18n/translations';
import { RecipeCategory, Difficulty } from '../types/recipe';

const STORAGE_KEY = 'ciboulette_language_v1';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  availableLanguages: LanguageOption[];
  currentLanguageOption: LanguageOption;
  t: (key: string, vars?: Record<string, string | number>) => string;
  getCategoryText: (category: RecipeCategory | 'all') => string;
  getDifficultyText: (difficulty: Difficulty) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'fr' || stored === 'en' || stored === 'es') {
        return stored;
      }
      // Detect browser language
      const browserLang = navigator.language.slice(0, 2).toLowerCase();
      if (browserLang === 'es') return 'es';
      if (browserLang === 'en') return 'en';
      return 'fr';
    } catch {
      return 'fr';
    }
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    } catch (e) {
      console.error('Error saving language:', e);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, vars?: Record<string, string | number>): string => {
    let text = TRANSLATIONS[language]?.[key] || TRANSLATIONS.fr[key] || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  };

  const getCategoryText = (category: RecipeCategory | 'all') => {
    return getCategoryLabel(category, language);
  };

  const getDifficultyText = (difficulty: Difficulty) => {
    return getDifficultyLabel(difficulty, language);
  };

  const currentLanguageOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        availableLanguages: SUPPORTED_LANGUAGES,
        currentLanguageOption,
        t,
        getCategoryText,
        getDifficultyText
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
