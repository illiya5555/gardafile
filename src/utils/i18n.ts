import { useTranslation } from '../context/LanguageContext';

/**
 * Enhanced translation function that ensures consistent behavior across the application
 * - Simplifies usage of translations
 * - Provides type safety for translation keys
 * - Supports interpolation of variables
 * - Automatically handles fallbacks
 * - Provides runtime warnings for missing translations in development mode
 */

// Define a function type for translation
export type TranslateFunction = (key: string, fallback?: string, variables?: Record<string, string | number>) => string;

// Export the hook for use in components
export const useI18n = (): { 
  t: TranslateFunction;
  currentLanguage: string;
  isRTL: boolean;
} => {
  const { t, currentLanguage, isRTL } = useTranslation();
  
  // Enhanced translation function with variable interpolation
  const enhancedTranslate: TranslateFunction = (key, fallback, variables) => {
    // Get the base translation
    let translation = t(key, fallback);
    
    // Handle variable interpolation
    if (variables && Object.keys(variables).length > 0) {
      Object.entries(variables).forEach(([varName, value]) => {
        const regex = new RegExp(`\\{\\{\\s*${varName}\\s*\\}\\}`, 'g');
        translation = translation.replace(regex, String(value));
      });
    }
    
    // In development, warn about missing translations
    if (process.env.NODE_ENV === 'development') {
      if (translation === key && !fallback) {
        console.warn(`[i18n] Missing translation for key: ${key} in language: ${currentLanguage}`);
      }
    }
    
    return translation;
  };
  
  return {
    t: enhancedTranslate,
    currentLanguage,
    isRTL
  };
};

// Helper functions for working with translations

/**
 * Formats a date according to the current locale
 * @param date The date to format
 * @param options Formatting options
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  const { currentLanguage } = useTranslation();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(
    currentLanguage, 
    options || { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
  );
};

/**
 * Formats a price in the appropriate currency
 * @param amount The amount to format
 * @param currencyCode The currency code (default: EUR)
 * @returns Formatted price string
 */
export const formatPrice = (
  amount: number, 
  currencyCode: string = 'EUR'
): string => {
  const { currentLanguage } = useTranslation();
  return new Intl.NumberFormat(
    currentLanguage, 
    { 
      style: 'currency', 
      currency: currencyCode 
    }
  ).format(amount);
};

/**
 * Returns plural form of a word based on count
 * @param count The count
 * @param singular Singular form
 * @param plural Plural form
 * @returns The appropriate form based on count
 */
export const pluralize = (count: number, singular: string, plural: string): string => {
  return count === 1 ? singular : plural;
};

export default useI18n;