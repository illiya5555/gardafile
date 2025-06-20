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
  nativeName: string;
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
import { safeQuery } from '../lib/supabase';

const AVAILABLE_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
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
    'nav.book_now': 'Book Now',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'form.name': 'Name',
    'form.email': 'Email',
    'form.phone': 'Phone',
    'form.message': 'Message',
    'form.submit': 'Send Message',
  },
  it: {
    'nav.home': 'Home',
    'nav.services': 'Servizi',
    'nav.events': 'Eventi',
    'nav.contact': 'Contatti',
    'nav.book_now': 'Prenota Ora',
    'common.loading': 'Caricamento...',
    'common.error': 'Errore',
    'common.retry': 'Riprova',
    'form.name': 'Nome',
    'form.email': 'Email',
    'form.phone': 'Telefono',
    'form.message': 'Messaggio',
    'form.submit': 'Invia Messaggio',
  },
  de: {
    'nav.home': 'Startseite',
    'nav.services': 'Dienstleistungen',
    'nav.events': 'Veranstaltungen',
    'nav.contact': 'Kontakt',
    'nav.book_now': 'Jetzt Buchen',
    'common.loading': 'Laden...',
    'common.error': 'Fehler',
    'common.retry': 'Wiederholen',
    'form.name': 'Name',
    'form.email': 'E-Mail',
    'form.phone': 'Telefon',
    'form.message': 'Nachricht',
    'form.submit': 'Nachricht Senden',
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.services': 'Services',
    'nav.events': 'Événements',
    'nav.contact': 'Contact',
    'nav.book_now': 'Réserver',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.retry': 'Réessayer',
    'form.name': 'Nom',
    'form.email': 'E-mail',
    'form.phone': 'Téléphone',
    'form.message': 'Message',
    'form.submit': 'Envoyer le Message',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.services': 'Servicios',
    'nav.events': 'Eventos',
    'nav.contact': 'Contacto',
    'nav.book_now': 'Reservar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.retry': 'Reintentar',
    'form.name': 'Nombre',
    'form.email': 'Correo electrónico',
    'form.phone': 'Teléfono',
    'form.message': 'Mensaje',
    'form.submit': 'Enviar Mensaje',
  },
  ru: {
    'nav.home': 'Главная',
    'nav.services': 'Услуги',
    'nav.events': 'События',
    'nav.contact': 'Контакты',
    'nav.book_now': 'Забронировать',
    'common.loading': 'Загрузка...',
    'common.error': 'Ошибка',
    'common.retry': 'Повторить',
    'home.hero.price_description': 'на человека • Опыт на целый день',
    'form.name': 'Имя',
    'form.email': 'Электронная почта',
    'form.phone': 'Телефон',
    'form.message': 'Сообщение',
    'form.submit': 'Отправить Сообщение',
  },
};

// Load translations with enhanced error handling and retry logic
export const loadTranslations = async (languageCode: string) => {
  try {
    console.log(`Loading translations for language: ${languageCode}`);
    
    const { data, error, isOffline } = await safeQuery(
      () => supabase
        .from('translations')
        .select('key, text')
        .eq('language_code', languageCode),
      []
    );
    
    // Get fallback translations
    const fallbackTranslations = FALLBACK_TRANSLATIONS[languageCode] || FALLBACK_TRANSLATIONS.en;
    
    if (data && data.length > 0 && !isOffline) {
      const translationMap = data.reduce((acc: Record<string, string>, item: Translation) => {
        acc[item.key] = item.text;
        return acc;
      }, {});
      
      // Merge with fallback translations
      const mergedTranslations = { ...fallbackTranslations, ...translationMap };
      
      console.log(`Successfully loaded ${data.length} translations for ${languageCode}`);
      return mergedTranslations;
    } else {
      if (isOffline) {
        console.log(`Working offline - using fallback translations for ${languageCode}`);
      } else {
        console.log(`No translations found for language: ${languageCode}, using fallbacks`);
      }
      return fallbackTranslations;
    }
  } catch (error) {
    console.warn('Error loading translations, using fallbacks:', error);
    
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
        console.warn('Failed to initialize language, using fallbacks:', err);
        setError(null); // Don't show error for offline mode
        
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
      console.warn('Failed to change language, using fallbacks:', err);
      
      // Still switch to the requested language using fallbacks
      const fallbackTranslations = FALLBACK_TRANSLATIONS[languageCode] || FALLBACK_TRANSLATIONS.en;
      setCurrentLanguage(languageCode);
      setTranslations(fallbackTranslations);
      localStorage.setItem('preferred-language', languageCode);
      
      setError(null); // Don't show error for offline mode
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