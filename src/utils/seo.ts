// SEO утилиты для динамических мета-тегов
export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

export const seoData: Record<string, SEOData> = {
  home: {
    title: "Garda Racing Yacht Club - Premium Sailing Experiences on Lake Garda",
    description: "Daily yacht racing experiences in world-famous Lake Garda. Professional skipper, racing medals, and unforgettable memories. Book your €195 sailing adventure today!",
    keywords: "Lake Garda sailing, yacht racing, Riva del Garda, sailing experience, yacht charter, racing course",
    ogImage: "/IMG_0967.webp"
  },
  events: {
    title: "Yacht Racing Events - Complete Day Program | Garda Racing",
    description: "Discover our complete yacht racing program on Lake Garda. Professional instruction, authentic racing, medal ceremony, and professional photos included.",
    keywords: "yacht racing program, sailing lessons Lake Garda, racing events, sailing instruction",
    ogImage: "/IMG_0967.webp"
  },
  services: {
    title: "Corporate Services & Team Building | Garda Racing Yacht Club",
    description: "Professional corporate sailing events and team building activities on Lake Garda. Custom packages for groups from 12 to 96 participants.",
    keywords: "corporate sailing, team building Lake Garda, corporate events, sailing team building",
    ogImage: "/IMG_0967.webp"
  },
  contact: {
    title: "Contact Us - Garda Racing Yacht Club | Lake Garda Sailing",
    description: "Get in touch with Garda Racing Yacht Club. Located in Riva del Garda, Italy. Phone: +39 345 678 9012. Professional sailing experiences since 2008.",
    keywords: "contact Garda Racing, Riva del Garda sailing, yacht club contact, Lake Garda sailing contact",
    ogImage: "/IMG_0967.webp"
  },
  booking: {
    title: "Book Your Yacht Racing Adventure | Garda Racing Yacht Club",
    description: "Book your yacht racing experience on Lake Garda. €195 per person includes professional skipper, equipment, racing medal, and photos. Easy online booking.",
    keywords: "book yacht racing, Lake Garda booking, sailing reservation, yacht charter booking",
    ogImage: "/IMG_0967.webp"
  }
};

export const updatePageSEO = (pageKey: string) => {
  const seo = seoData[pageKey];
  if (!seo) return;

  // Обновляем title
  document.title = seo.title;

  // Обновляем meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', seo.description);
  }

  // Обновляем meta keywords
  if (seo.keywords) {
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', seo.keywords);
  }

  // Обновляем Open Graph теги
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', seo.title);
  }

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute('content', seo.description);
  }

  // Обновляем Twitter Card теги
  const twitterTitle = document.querySelector('meta[property="twitter:title"]');
  if (twitterTitle) {
    twitterTitle.setAttribute('content', seo.title);
  }

  const twitterDescription = document.querySelector('meta[property="twitter:description"]');
  if (twitterDescription) {
    twitterDescription.setAttribute('content', seo.description);
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