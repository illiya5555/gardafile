// SEO утилиты для динамических мета-тегов
import { useTranslation } from '../context/LanguageContext';

export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

// Мы используем ключи перевода вместо жестко закодированных строк
export const seoData: Record<string, SEOData> = {
  home: {
    title: "seo.home.title",
    description: "seo.home.description",
    keywords: "seo.home.keywords",
    ogImage: "/IMG_0967.webp"
  },
  events: {
    title: "seo.events.title",
    description: "seo.events.description",
    keywords: "seo.events.keywords",
    ogImage: "/IMG_0967.webp"
  },
  services: {
    title: "seo.services.title",
    description: "seo.services.description",
    keywords: "seo.services.keywords",
    ogImage: "/IMG_0967.webp"
  },
  contact: {
    title: "seo.contact.title",
    description: "seo.contact.description",
    keywords: "seo.contact.keywords",
    ogImage: "/IMG_0967.webp"
  },
  booking: {
    title: "seo.booking.title",
    description: "seo.booking.description",
    keywords: "seo.booking.keywords",
    ogImage: "/IMG_0967.webp"
  }
};

export const updatePageSEO = (pageKey: string) => {
  const seo = seoData[pageKey];
  if (!seo) return;

  // Get translation function - we need to use a pattern that works in a non-React context
  // For simplicity, let's assume we're passing fallbacks directly for now
  // In a real implementation, you would need to access translations from a singleton or global state
  let translatedTitle = "";
  let translatedDescription = "";
  let translatedKeywords = "";

  // Try to get from localStorage first (as simple solution)
  const lang = localStorage.getItem('preferred-language') || 'en';
  const translations = localStorage.getItem(`translations_${lang}`) || "{}";
  const translationsObj = JSON.parse(translations);

  // If we have translations, use them, otherwise fall back to hardcoded values
  translatedTitle = translationsObj[seo.title] || 
    (pageKey === "home" ? "Garda Racing Yacht Club - Premium Sailing Experiences on Lake Garda" : 
    pageKey === "events" ? "Yacht Racing Events - Complete Day Program | Garda Racing" : 
    pageKey === "services" ? "Corporate Services & Team Building | Garda Racing Yacht Club" :
    pageKey === "contact" ? "Contact Us - Garda Racing Yacht Club | Lake Garda Sailing" :
    "Book Your Yacht Racing Adventure | Garda Racing Yacht Club");

  translatedDescription = translationsObj[seo.description] || 
    (pageKey === "home" ? "Daily yacht racing experiences in world-famous Lake Garda. Professional skipper, racing medals, and unforgettable memories. Book your €195 sailing adventure today!" :
    pageKey === "events" ? "Discover our complete yacht racing program on Lake Garda. Professional instruction, authentic racing, medal ceremony, and professional photos included." :
    pageKey === "services" ? "Professional corporate sailing events and team building activities on Lake Garda. Custom packages for groups from 12 to 96 participants." :
    pageKey === "contact" ? "Get in touch with Garda Racing Yacht Club. Located in Riva del Garda, Italy. Phone: +39 345 678 9012. Professional sailing experiences since 2008." :
    "Book your yacht racing experience on Lake Garda. €195 per person includes professional skipper, equipment, racing medal, and photos. Easy online booking.");

  translatedKeywords = translationsObj[seo.keywords || ""] || 
    (pageKey === "home" ? "Lake Garda sailing, yacht racing, Riva del Garda, sailing experience, yacht charter, racing course" :
    pageKey === "events" ? "yacht racing program, sailing lessons Lake Garda, racing events, sailing instruction" :
    pageKey === "services" ? "corporate sailing, team building Lake Garda, corporate events, sailing team building" :
    pageKey === "contact" ? "contact Garda Racing, Riva del Garda sailing, yacht club contact, Lake Garda sailing contact" :
    "book yacht racing, Lake Garda booking, sailing reservation, yacht charter booking");

  // Обновляем title
  document.title = translatedTitle;

  // Обновляем meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', translatedDescription);
  }

  // Обновляем meta keywords
  if (translatedKeywords) {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', translatedKeywords);
  }

  // Обновляем Open Graph теги
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', translatedTitle);
  }

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute('content', translatedDescription);
  }

  // Обновляем Twitter Card теги
  const twitterTitle = document.querySelector('meta[property="twitter:title"]');
  if (twitterTitle) {
    twitterTitle.setAttribute('content', translatedTitle);
  }

  const twitterDescription = document.querySelector('meta[property="twitter:description"]');
  if (twitterDescription) {
    twitterDescription.setAttribute('content', translatedDescription);
  }

  // Добавляем canonical URL
  if (seo.canonical) {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', seo.canonical);
  }
};