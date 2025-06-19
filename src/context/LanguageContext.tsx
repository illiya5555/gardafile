import React, { createContext, useContext, ReactNode } from 'react';
import { useLanguage, LanguageContextType } from '../hooks/useLanguage';

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const languageData = useLanguage();

  return (
    <LanguageContext.Provider value={languageData}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
};

// Export a simple hook for translation
export const useTranslation = () => {
  const { t, currentLanguage, isRTL } = useLanguageContext();
  return { t, currentLanguage, isRTL };
};