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
    'home.hero.price_description': 'par personne • Expérience journée complète',
    'home.hero.feature1': 'Format de régate réel',
    'home.hero.feature2': 'Skipper professionnel sur chaque bateau',
    'home.hero.feature3': 'Ouvert à tous les niveaux - aucune expérience nécessaire',
    'home.hero.feature4': 'Photos et vidéos professionnelles de la course',
    'home.hero.feature5': 'Tout l\'équipement fourni',
    'home.features.item1.title': 'Format de Régate Réel',
    'home.features.item1.description': 'Authentique régate de yacht avec dynamique d\'équipe, médailles et vraie compétition.',
    'home.features.item2.title': 'Skipper Professionnel',
    'home.features.item2.description': 'Capitaines de voile certifiés et expérimentés sur chaque bateau.',
    'home.features.item3.title': 'Photo & Vidéo',
    'home.features.item3.description': 'Photos et vidéos professionnelles de votre journée de course à retenir et à partager.',
    'home.features.item4.title': 'Entièrement Assuré',
    'home.features.item4.description': 'Couverture de sécurité complète et équipement moderne inclus.',
    'home.features.item5.title': 'Accessible et Premium',
    'home.features.item5.description': 'Une expérience de régate de haut niveau ouverte à tous - aucune expérience nécessaire.',
    'home.experience.step1.title': 'Briefing du Matin',
    'home.experience.step1.description': 'Rencontrez votre skipper professionnel et apprenez les bases de la course de yacht dans un environnement détendu et amical.',
    'home.experience.step2.title': 'Expérience de Course',
    'home.experience.step2.description': 'Participez à d'authentiques courses de yacht avec d'autres bateaux, en vivant le frisson de la compétition sur le magnifique lac de Garde.',
    'home.experience.step3.title': 'Cérémonie des Médailles',
    'home.experience.step3.description': 'Célébrez votre réussite avec une cérémonie officielle de remise des médailles et recevez votre certificat de course personnalisé.'
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
    'home.hero.price_description': 'por persona • Experiencia de día completo',
    'home.hero.feature1': 'Formato de regata real',
    'home.hero.feature2': 'Patrón profesional en cada barco',
    'home.hero.feature3': 'Abierto a todos los niveles - no se necesita experiencia',
    'home.hero.feature4': 'Fotos y videos profesionales de la regata',
    'home.hero.feature5': 'Todo el equipamiento incluido',
    'home.features.item1.title': 'Formato de Regata Real',
    'home.features.item1.description': 'Auténtica regata de yates con dinámica de equipo, medallas y verdadera competición.',
    'home.features.item2.title': 'Patrón Profesional',
    'home.features.item2.description': 'Capitanes de vela certificados y experimentados en cada barco.',
    'home.features.item3.title': 'Foto y Video',
    'home.features.item3.description': 'Fotos y videos profesionales de su día de regata para recordar y compartir.',
    'home.features.item4.title': 'Totalmente Asegurado',
    'home.features.item4.description': 'Cobertura de seguridad completa y equipo moderno incluido.',
    'home.features.item5.title': 'Accesible y Premium',
    'home.features.item5.description': 'Una experiencia de regata de alto nivel abierta a todos - no se necesita experiencia.',
    'home.experience.step1.title': 'Briefing Matutino',
    'home.experience.step1.description': 'Conozca a su patrón profesional y aprenda los conceptos básicos de las regatas de yates en un ambiente relajado y amigable.',
    'home.experience.step2.title': 'Experiencia de Regata',
    'home.experience.step2.description': 'Participe en auténticas regatas de yates con otros barcos, experimentando la emoción de la competición en el hermoso lago de Garda.',
    'home.experience.step3.title': 'Ceremonia de Medallas',
    'home.experience.step3.description': 'Celebre su logro con una ceremonia oficial de medallas y reciba su certificado de regata personalizado.'
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
    'home.hero.feature1': 'Настоящий формат гонки на яхтах',
    'home.hero.feature2': 'Профессиональный шкипер на каждой лодке',
    'home.hero.feature3': 'Открыто для всех уровней навыков – опыт не требуется',
    'home.hero.feature4': 'Профессиональные фото и видео с гонки',
    'home.hero.feature5': 'Всё оборудование предоставляется',
    'home.features.item1.title': 'Настоящий Формат Гонки',
    'home.features.item1.description': 'Настоящая яхтенная регата с командной динамикой, медалями и настоящим соревнованием.',
    'home.features.item2.title': 'Профессиональный Шкипер',
    'home.features.item2.description': 'Сертифицированные и опытные капитаны на каждой лодке.',
    'home.features.item3.title': 'Фото и Видео',
    'home.features.item3.description': 'Профессиональные фото и видео с вашего гоночного дня, чтобы запомнить и поделиться.',
    'home.features.item4.title': 'Полностью Застраховано',
    'home.features.item4.description': 'Полное покрытие безопасности и современное оборудование включены.',
    'home.experience.step1.description': 'Познакомьтесь с вашим профессиональным шкипером и изучите основы яхтенных гонок в непринужденной, дружелюбной обстановке.',
    'home.experience.step2.description': 'Участвуйте в настоящих яхтенных гонках с другими лодками, испытывая острые ощущения от соревнований на прекрасном озере Гарда.',
    'home.experience.step3.description': 'Отпразднуйте свое достижение официальной церемонией награждения медалями и получите персонализированный гоночный сертификат.',
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