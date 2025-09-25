import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLanguage = (): Language => {
    try {
        const storedLang = localStorage.getItem('app_language');
        if (storedLang === 'en' || storedLang === 'es') {
            return storedLang;
        }
    } catch (error) {
        console.error('Error reading language from localStorage:', error);
    }
    // Default to browser language if available, otherwise 'en'
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'es' ? 'es' : 'en';
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    try {
        localStorage.setItem('app_language', language);
    } catch (error) {
        console.error('Failed to save language to localStorage:', error);
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
      setLanguageState(lang);
  };
  
  const value = { language, setLanguage };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};