import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { updatePageSEO } from '../utils/seo';

const SEOHead: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Определяем ключ страницы на основе pathname
    let pageKey = 'home';
    
    switch (location.pathname) {
      case '/':
        pageKey = 'home';
        break;
      case '/experience':
        pageKey = 'experience';
        break;
      case '/booking':
        pageKey = 'booking';
        break;
      default:
        pageKey = 'home';
    }

    // Обновляем SEO данные
    updatePageSEO(pageKey);
  }, [location.pathname]);

  return null; // Этот компонент не рендерит ничего видимого
};

export default SEOHead;