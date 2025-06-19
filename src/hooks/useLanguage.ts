import { useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

interface Translation {
  key: string;
  language_code: string;
  text: string;
  category: string;
}

export interface LanguageConfig {
  code: string;
  name: string;
  flag: string;
}

export interface LanguageContextType {
  currentLanguage: string;
  translations: Record<string, string>;
  loading: boolean;
  error: string | null;
  changeLanguage: (languageCode: string) => Promise<void>;
  t: (key: string, fallback?: string) => string;
  isRTL: boolean;
  supportedLanguages: LanguageConfig[];
}

// Import the context from the proper location
import { LanguageContext } from '../context/LanguageContext';

const AVAILABLE_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
  { code: 'ro', name: 'Română', flag: '🇷🇴' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenščina', flag: '🇸🇮' },
  { code: 'et', name: 'Eesti', flag: '🇪🇪' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹' },
  { code: 'mt', name: 'Malti', flag: '🇲🇹' },
  { code: 'cy', name: 'Cymraeg', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿' },
  { code: 'ga', name: 'Gaeilge', flag: '🇮🇪' },
  { code: 'eu', name: 'Euskera', flag: '🏴󠁥󠁳󠁰󠁶󠁿' },
  { code: 'ca', name: 'Català', flag: '🏴󠁥󠁳󠁣󠁴󠁿' },
  { code: 'gl', name: 'Galego', flag: '🏴󠁥󠁳󠁧󠁡󠁿' },
];

// RTL languages
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

// Fallback translations for critical UI elements
const FALLBACK_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.events': 'Events',
    'nav.contact': 'Contact',
    'nav.book': 'Book Now',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'language.selector': 'Language',
  },
  it: {
    'nav.home': 'Home',
    'nav.services': 'Servizi',
    'nav.events': 'Eventi',
    'nav.contact': 'Contatti',
    'nav.book': 'Prenota Ora',
    'common.loading': 'Caricamento...',
    'common.error': 'Errore',
    'common.retry': 'Riprova',
    'language.selector': 'Lingua',
  },
  de: {
    'nav.home': 'Startseite',
    'nav.services': 'Dienstleistungen',
    'nav.events': 'Veranstaltungen',
    'nav.contact': 'Kontakt',
    'nav.book': 'Jetzt Buchen',
    'common.loading': 'Laden...',
    'common.error': 'Fehler',
    'common.retry': 'Wiederholen',
    'language.selector': 'Sprache',
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.services': 'Services',
    'nav.events': 'Événements',
    'nav.contact': 'Contact',
    'nav.book': 'Réserver',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.retry': 'Réessayer',
    'language.selector': 'Langue',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.services': 'Servicios',
    'nav.events': 'Eventos',
    'nav.contact': 'Contacto',
    'nav.book': 'Reservar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.retry': 'Reintentar',
    'language.selector': 'Idioma',
  },
};

// Retry utility function
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`Translation load attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// Load translations with enhanced error handling and retry logic
export const loadTranslations = async (languageCode: string) => {
  try {
    console.log(`Loading translations for language: ${languageCode}`);
    
    const result = await retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from('translations')
        .select('key, text')
        .eq('language_code', languageCode);
      
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      return data;
    });
    
    if (result && result.length > 0) {
      const translationMap = result.reduce((acc: Record<string, string>, item: Translation) => {
        acc[item.key] = item.text;
        return acc;
      }, {});
      
      // Merge with fallback translations
      const fallbackTranslations = FALLBACK_TRANSLATIONS[languageCode] || FALLBACK_TRANSLATIONS.en;
      const mergedTranslations = { ...fallbackTranslations, ...translationMap };
      
      console.log(`Successfully loaded ${result.length} translations for ${languageCode}`);
      return mergedTranslations;
    } else {
      console.warn(`No translations found for language: ${languageCode}, using fallbacks`);
      return FALLBACK_TRANSLATIONS[languageCode] || FALLBACK_TRANSLATIONS.en;
    }
  } catch (error) {
    console.error('Error loading translations:', error);
    
    // Use fallback translations on error
    const fallbackTranslations = FALLBACK_TRANSLATIONS[languageCode] || FALLBACK_TRANSLATIONS.en;
    return fallbackTranslations;
  }
};

// Translation function with fallback
export const createTranslationFunction = (translations: Record<string, string>) => {
  return (key: string, fallback?: string): string => {
    const translation = translations[key];
    if (translation) {
      return translation;
    }
    
    // Try English fallback
    const englishFallback = FALLBACK_TRANSLATIONS.en[key];
    if (englishFallback) {
      return englishFallback;
    }
    
    // Use provided fallback or key itself
    return fallback || key;
  };
};

// Core language hook that manages state - this is used by the LanguageProvider
export const useLanguage = (): LanguageContextType => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize language on mount
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to get saved language from localStorage
        const savedLanguage = localStorage.getItem('preferred-language') || 'en';
        
        // Load translations for the saved language
        const loadedTranslations = await loadTranslations(savedLanguage);
        
        setCurrentLanguage(savedLanguage);
        setTranslations(loadedTranslations);
      } catch (err) {
        console.error('Failed to initialize language:', err);
        setError('Failed to load language settings');
        
        // Fallback to English
        setCurrentLanguage('en');
        setTranslations(FALLBACK_TRANSLATIONS.en);
      } finally {
        setLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  const changeLanguage = async (languageCode: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const loadedTranslations = await loadTranslations(languageCode);
      
      setCurrentLanguage(languageCode);
      setTranslations(loadedTranslations);
      
      // Save to localStorage
      localStorage.setItem('preferred-language', languageCode);
    } catch (err) {
      console.error('Failed to change language:', err);
      setError('Failed to change language');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const t = createTranslationFunction(translations);
  const isRTL = RTL_LANGUAGES.includes(currentLanguage);

  return {
    currentLanguage,
    translations,
    loading,
    error,
    changeLanguage,
    t,
    isRTL,
    supportedLanguages: AVAILABLE_LANGUAGES,
  };
};

// Hook for consuming the context (used by components)
export const useLanguageContext = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
};

// Export constants for use in other files
export { AVAILABLE_LANGUAGES, FALLBACK_TRANSLATIONS };

// Export for backward compatibility
export default useLanguageContext;