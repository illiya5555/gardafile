import React, { useState } from 'react';
import { Globe, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useLanguageContext } from '../context/LanguageContext';

interface LanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className = '', 
  showLabel = true 
}) => {
  const { currentLanguage, changeLanguage, supportedLanguages, loading } = useLanguageContext();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = supportedLanguages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = async (languageCode: string) => {
    setIsOpen(false);
    if (languageCode !== currentLanguage) {
      await changeLanguage(languageCode);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-300 disabled:opacity-50"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4" />
        {currentLang && (
          <>
            <span className="text-lg" role="img" aria-label={currentLang.name}>
              {currentLang.flag}
            </span>
            {showLabel && (
              <span className="text-sm font-medium hidden sm:inline">
                {currentLang.code.toUpperCase()}
              </span>
            )}
          </>
        )}
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="py-2">
            {supportedLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-100 transition-colors duration-300 ${
                  language.code === currentLanguage ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg" role="img" aria-label={language.name}>
                    {language.flag}
                  </span>
                  <div>
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-sm text-gray-500">{language.name}</div>
                  </div>
                </div>
                {language.code === currentLanguage && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;