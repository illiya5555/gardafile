import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

export const supportedLanguages: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', rtl: true },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' }
];

// Country to language mapping
const countryLanguageMap: Record<string, string> = {
  'IT': 'it', // Italy
  'DE': 'de', // Germany
  'AT': 'de', // Austria
  'FR': 'fr', // France
  'CH': 'de', // Switzerland (German as primary)
  'ES': 'es', // Spain
  'PL': 'pl', // Poland
  'IL': 'he', // Israel
  'US': 'en', // USA
  'GB': 'en', // United Kingdom
  'NL': 'en', // Netherlands
  'CA': 'en', // Canada
  'AU': 'en', // Australia
  'UA': 'ru', // Ukraine
  'RU': 'ru', // Russia
  'BY': 'ru', // Belarus
  'KZ': 'ru', // Kazakhstan
};

interface UserLocation {
  country: string;
  countryCode: string;
  ip: string;
}

interface UseLanguageReturn {
  currentLanguage: string;
  translations: Record<string, string>;
  loading: boolean;
  error: string | null;
  changeLanguage: (languageCode: string) => Promise<void>;
  t: (key: string, fallback?: string) => string;
  isRTL: boolean;
  supportedLanguages: LanguageConfig[];
}

export const useLanguage = (): UseLanguageReturn => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detect user location via IP
  const detectUserLocation = async (): Promise<UserLocation | null> => {
    try {
      // Try ipapi.co first
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        return {
          country: data.country_name,
          countryCode: data.country_code,
          ip: data.ip
        };
      }
    } catch (error) {
      console.warn('Failed to detect location via ipapi.co:', error);
    }

    try {
      // Fallback to ipinfo.io
      const response = await fetch('https://ipinfo.io/json');
      if (response.ok) {
        const data = await response.json();
        return {
          country: data.country,
          countryCode: data.country,
          ip: data.ip
        };
      }
    } catch (error) {
      console.warn('Failed to detect location via ipinfo.io:', error);
    }

    return null;
  };

  // Detect language based on location and browser
  const detectLanguage = async (): Promise<string> => {
    try {
      // First, try to get user's saved preference
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: preference } = await supabase
          .from('user_preferences')
          .select('language_code')
          .eq('user_id', user.id)
          .single();
        
        if (preference?.language_code) {
          return preference.language_code;
        }
      }

      // Check localStorage for guest preference
      const savedLanguage = localStorage.getItem('preferred_language');
      if (savedLanguage && supportedLanguages.some(lang => lang.code === savedLanguage)) {
        return savedLanguage;
      }

      // Try to detect by IP location
      const location = await detectUserLocation();
      if (location?.countryCode) {
        const languageByCountry = countryLanguageMap[location.countryCode];
        if (languageByCountry) {
          // Save the auto-detected preference
          await saveLanguagePreference(languageByCountry, location.countryCode, true);
          return languageByCountry;
        }
      }

      // Fallback to browser language
      const browserLang = navigator.language.split('-')[0];
      if (supportedLanguages.some(lang => lang.code === browserLang)) {
        await saveLanguagePreference(browserLang, null, true);
        return browserLang;
      }

      // Final fallback to English
      return 'en';
    } catch (error) {
      console.error('Error detecting language:', error);
      return 'en';
    }
  };

  // Save language preference
  const saveLanguagePreference = async (
    languageCode: string, 
    countryCode: string | null = null, 
    autoDetected: boolean = false
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Save to database for authenticated users
        const { error } = await supabase.rpc('update_user_language', {
          p_language_code: languageCode,
          p_country_code: countryCode,
          p_auto_detected: autoDetected
        });
        
        if (error) {
          console.error('Error saving language preference:', error);
        }
      } else {
        // Save to localStorage for guests
        localStorage.setItem('preferred_language', languageCode);
      }
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  // Load translations for a specific language
  const loadTranslations = async (languageCode: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('translations')
        .select('key, text')
        .eq('language_code', languageCode);

      if (error) {
        throw error;
      }

      const translationsMap: Record<string, string> = {};
      data?.forEach(item => {
        translationsMap[item.key] = item.text;
      });

      setTranslations(translationsMap);
    } catch (error: any) {
      console.error('Error loading translations:', error);
      setError(error.message);
      
      // Fallback to English if current language fails
      if (languageCode !== 'en') {
        await loadTranslations('en');
      }
    } finally {
      setLoading(false);
    }
  };

  // Change language
  const changeLanguage = useCallback(async (languageCode: string) => {
    if (!supportedLanguages.some(lang => lang.code === languageCode)) {
      console.error('Unsupported language:', languageCode);
      return;
    }

    setCurrentLanguage(languageCode);
    await loadTranslations(languageCode);
    await saveLanguagePreference(languageCode, null, false);

    // Update document direction for RTL languages
    const language = supportedLanguages.find(lang => lang.code === languageCode);
    document.documentElement.dir = language?.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = languageCode;
  }, []);

  // Translation function
  const t = useCallback((key: string, fallback?: string): string => {
    return translations[key] || fallback || key;
  }, [translations]);

  // Get current language config
  const currentLanguageConfig = supportedLanguages.find(lang => lang.code === currentLanguage);
  const isRTL = currentLanguageConfig?.rtl || false;

  // Initialize language on mount
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        const detectedLanguage = await detectLanguage();
        setCurrentLanguage(detectedLanguage);
        await loadTranslations(detectedLanguage);

        // Set document direction and language
        const language = supportedLanguages.find(lang => lang.code === detectedLanguage);
        document.documentElement.dir = language?.rtl ? 'rtl' : 'ltr';
        document.documentElement.lang = detectedLanguage;
      } catch (error) {
        console.error('Error initializing language:', error);
        setError('Failed to initialize language system');
        setLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  return {
    currentLanguage,
    translations,
    loading,
    error,
    changeLanguage,
    t,
    isRTL,
    supportedLanguages
  };
};