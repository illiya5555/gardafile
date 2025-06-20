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
    'corporate.cta.subtitle': 'Contact our team to discuss your requirements and create a customized sailing experience for your group.',
    'home.experience.step3.title': 'Cérémonie des Médailles',
    'corporate.cta.call': 'Call +39 344 777 00 77',
    'corporate.teambuilding.title': 'Yachting as Perfect Team Building',
    'corporate.teambuilding.subtitle': 'Unique format, emotions that unite',
    'corporate.teambuilding.cta': 'Submit Request',
    'corporate.teambuilding.image_alt': 'Team on a yacht',
    'corporate.why_sailing.title': 'Why Sailing = Perfect Team Building?',
    'corporate.why_sailing.team.title': 'Team Interaction Development',
    'corporate.why_sailing.team.description': 'Joint yacht management requires cohesion and clear role distribution',
    'corporate.why_sailing.leadership.title': 'Leadership and Responsibility',
    'corporate.why_sailing.leadership.description': 'Decision-making in real conditions where everyone impacts the overall result',
    'corporate.why_sailing.stress.title': 'Stress Relief and Reset',
    'corporate.why_sailing.stress.description': 'Nature, fresh air, and new experiences – the perfect environment for a reset',
    'corporate.why_sailing.emotions.title': 'Emotional Charge and Trust',
    'corporate.why_sailing.emotions.description': 'Vibrant emotions and jointly overcoming challenges bring the team closer together',
    'corporate.how_it_works.title': 'How Does the Team Building Work?',
    'corporate.how_it_works.step1.title': 'Briefing and Instruction',
    'corporate.how_it_works.step1.description': 'Introduction to the yacht, basic control principles, safety techniques',
    'corporate.how_it_works.step2.title': 'Team Division',
    'corporate.how_it_works.step2.description': 'Forming crews, distributing roles and responsibilities',
    'corporate.how_it_works.step3.title': 'Yacht Races with Judging',
    'corporate.how_it_works.step3.description': 'Competitions between teams along a set route, with professional evaluation',
    'corporate.how_it_works.step4.title': 'Team Tasks on Water',
    'corporate.how_it_works.step4.description': 'Special exercises aimed at developing communication and trust',
    'corporate.how_it_works.step5.title': 'Awards and Afterparty',
    'corporate.how_it_works.step5.description': 'Ceremonial wrap-up, award presentation and celebration dinner',
    'corporate.inquiry.title': 'Ready to Unite Your Team on a Wave of Emotions?',
    'corporate.inquiry.subtitle': 'Leave a request — we will offer a solution tailored to your goals and budget',
    'corporate.inquiry.form.name': 'Name',
    'corporate.inquiry.form.phone': 'Phone',
    'corporate.inquiry.form.company': 'Company',
    'corporate.inquiry.form.participants': 'Number of participants',
    'corporate.inquiry.form.submit': 'Submit Request'
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
    'home.features.item1.description': 'Authentique régate de yacht avec dynamique d\'équipe, médailles et vraie compétition.',
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
    'home.experience.step3.description': 'Celebre su logro con una ceremonia oficial de medallas y reciba su certificado de regata personalizado.',
    'corporate.teambuilding.title': 'El yachting como team building perfecto',
    'corporate.teambuilding.subtitle': 'Formato único, emociones que unen',
    'corporate.teambuilding.cta': 'Enviar solicitud',
    'corporate.teambuilding.image_alt': 'Equipo en un yate',
    'corporate.why_sailing.title': '¿Por qué la navegación = team building perfecto?',
    'corporate.why_sailing.team.title': 'Desarrollo de la interacción en equipo',
    'corporate.why_sailing.team.description': 'La gestión conjunta del yate requiere cohesión y una clara distribución de roles',
    'corporate.why_sailing.leadership.title': 'Liderazgo y responsabilidad',
    'corporate.why_sailing.leadership.description': 'Toma de decisiones en condiciones reales donde cada uno impacta en el resultado general',
    'corporate.why_sailing.stress.title': 'Alivio del estrés y reset',
    'corporate.why_sailing.stress.description': 'Naturaleza, aire fresco y nuevas experiencias – el entorno perfecto para un reset',
    'corporate.why_sailing.emotions.title': 'Carga emocional y confianza',
    'corporate.why_sailing.emotions.description': 'Las emociones vibrantes y la superación conjunta de desafíos unen al equipo',
    'corporate.how_it_works.title': '¿Cómo funciona el team building?',
    'corporate.how_it_works.step1.title': 'Briefing e instrucción',
    'corporate.how_it_works.step1.description': 'Introducción al yate, principios básicos de control, técnicas de seguridad',
    'corporate.how_it_works.step2.title': 'División de equipos',
    'corporate.how_it_works.step2.description': 'Formación de tripulaciones, distribución de roles y responsabilidades',
    'corporate.how_it_works.step3.title': 'Regatas con jurado',
    'corporate.how_it_works.step3.description': 'Competiciones entre equipos a lo largo de una ruta establecida, con evaluación profesional',
    'corporate.how_it_works.step4.title': 'Tareas de equipo en el agua',
    'corporate.how_it_works.step4.description': 'Ejercicios especiales dirigidos a desarrollar la comunicación y la confianza',
    'corporate.how_it_works.step5.title': 'Premios y celebración',
    'corporate.how_it_works.step5.description': 'Cierre ceremonial, entrega de premios y cena de celebración',
    'corporate.inquiry.title': '¿Listo para unir a tu equipo en una ola de emociones?',
    'corporate.inquiry.subtitle': 'Deja una solicitud — te ofreceremos una solución adaptada a tus objetivos y presupuesto',
    'corporate.inquiry.form.name': 'Nombre',
    'corporate.inquiry.form.phone': 'Teléfono',
    'corporate.inquiry.form.company': 'Empresa',
    'corporate.inquiry.form.participants': 'Número de participantes',
    'corporate.inquiry.form.submit': 'Enviar solicitud'
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
    'corporate.teambuilding.title': 'Яхтинг как идеальный тимбилдинг',
    'corporate.teambuilding.subtitle': 'Нестандартный формат, эмоции, которые объединяют',
    'corporate.teambuilding.cta': 'Оставить заявку',
    'corporate.teambuilding.image_alt': 'Команда на яхте',
    'corporate.why_sailing.title': 'Почему яхтинг = идеальный тимбилдинг?',
    'corporate.why_sailing.team.title': 'Развитие командного взаимодействия',
    'corporate.why_sailing.team.description': 'Совместное управление яхтой требует слаженности и четкого распределения ролей',
    'corporate.why_sailing.leadership.title': 'Лидерство и ответственность',
    'corporate.why_sailing.leadership.description': 'Принятие решений в реальных условиях, когда от каждого зависит общий результат',
    'corporate.why_sailing.stress.title': 'Снятие стресса и перезагрузка',
    'corporate.why_sailing.stress.description': 'Природа, свежий воздух и новый опыт – идеальная среда для перезагрузки',
    'corporate.why_sailing.emotions.title': 'Эмоциональный заряд и доверие',
    'corporate.why_sailing.emotions.description': 'Яркие эмоции и совместное преодоление трудностей сближают команду',
    'corporate.how_it_works.title': 'Как проходит тимбилдинг?',
    'corporate.how_it_works.step1.title': 'Брифинг и инструктаж',
    'corporate.how_it_works.step1.description': 'Знакомство с яхтой, базовые принципы управления, техника безопасности',
    'corporate.how_it_works.step2.title': 'Разделение на команды',
    'corporate.how_it_works.step2.description': 'Формирование экипажей, распределение ролей и ответственности',
    'corporate.how_it_works.step3.title': 'Яхтенные гонки с судейством',
    'corporate.how_it_works.step3.description': 'Соревнования между командами по заданному маршруту, с профессиональной оценкой',
    'corporate.how_it_works.step4.title': 'Командные задания на воде',
    'corporate.how_it_works.step4.description': 'Выполнение специальных упражнений, направленных на развитие коммуникации и доверия',
    'corporate.how_it_works.step5.title': 'Награждение и афтепати',
    'corporate.how_it_works.step5.description': 'Торжественное подведение итогов, вручение наград и праздничный ужин',
    'corporate.inquiry.title': 'Готовы объединить команду на волне эмоций?',
    'corporate.inquiry.subtitle': 'Оставьте заявку — мы предложим решение под ваши цели и бюджет',
    'corporate.inquiry.form.name': 'Имя',
    'corporate.inquiry.form.phone': 'Телефон',
    'corporate.inquiry.form.company': 'Компания',
    'corporate.inquiry.form.participants': 'Количество участников',
    'corporate.inquiry.form.submit': 'Оставить заявку'
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