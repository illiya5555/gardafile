import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface Translation {
  key: string;
  language_code: string;
  text: string;
  category: string;
}

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
  isLoading: boolean;
  error: string | null;
  availableLanguages: { code: string; name: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const AVAILABLE_LANGUAGES = [
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

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load translations with enhanced error handling and retry logic
  const loadTranslations = async (languageCode: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
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
        
        setTranslations(mergedTranslations);
        console.log(`Successfully loaded ${result.length} translations for ${languageCode}`);
      } else {
        console.warn(`No translations found for language: ${languageCode}, using fallbacks`);
        setTranslations(FALLBACK_TRANSLATIONS[languageCode] || FALLBACK_TRANSLATIONS.en);
      }
    } catch (error) {
      console.error('Error loading translations:', error);
      
      // Use fallback translations on error
      const fallbackTranslations = FALLBACK_TRANSLATIONS[languageCode] || FALLBACK_TRANSLATIONS.en;
      setTranslations(fallbackTranslations);
      
      // Set user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
          setError('Unable to load translations due to network issues. Using default language.');
        } else {
          setError('Failed to load translations. Using default language.');
        }
      } else {
        setError('An unexpected error occurred while loading translations.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize language with better error handling
  const initializeLanguage = async () => {
    try {
      // Try to get saved language preference
      const savedLanguage = localStorage.getItem('preferred-language');
      
      if (savedLanguage && AVAILABLE_LANGUAGES.some(lang => lang.code === savedLanguage)) {
        setCurrentLanguage(savedLanguage);
        await loadTranslations(savedLanguage);
      } else {
        // Detect browser language
        const browserLanguage = navigator.language.split('-')[0];
        const supportedLanguage = AVAILABLE_LANGUAGES.find(lang => lang.code === browserLanguage);
        
        if (supportedLanguage) {
          setCurrentLanguage(supportedLanguage.code);
          await loadTranslations(supportedLanguage.code);
        } else {
          // Default to English
          setCurrentLanguage('en');
          await loadTranslations('en');
        }
      }
    } catch (error) {
      console.error('Error initializing language:', error);
      // Fallback to English with local translations
      setCurrentLanguage('en');
      setTranslations(FALLBACK_TRANSLATIONS.en);
      setError('Failed to initialize language system. Using English.');
      setIsLoading(false);
    }
  };

  // Change language function
  const setLanguage = async (languageCode: string) => {
    if (languageCode === currentLanguage) return;
    
    try {
      setCurrentLanguage(languageCode);
      localStorage.setItem('preferred-language', languageCode);
      await loadTranslations(languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
      setError('Failed to change language. Please try again.');
    }
  };

  // Translation function with fallback
  const t = (key: string, fallback?: string): string => {
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

  // Initialize on mount
  useEffect(() => {
    initializeLanguage();
  }, []);

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    isLoading,
    error,
    availableLanguages: AVAILABLE_LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Export for backward compatibility
export default useLanguage;