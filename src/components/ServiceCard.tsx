import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../context/LanguageContext';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  link: string;
  learnMoreText?: string;
}

/**
 * ServiceCard component with improved accessibility
 * Used for displaying services on the services page
 */
const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  description,
  icon,
  image,
  link,
  learnMoreText = 'Learn more →',
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col rounded-2xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl group">
      <Link to={link} className="block overflow-hidden relative">
        {/* Background image */}
        <div 
          className="h-64 bg-cover bg-center relative transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${image})` }}
          aria-hidden="true"
        />
        
        {/* Hidden actual image for screen readers */}
        <img 
          src={image} 
          alt={title}
          className="sr-only"
          role="presentation"
          aria-hidden="true"
        />
      </Link>
      <div className="p-6 bg-white flex-1 flex flex-col">
        <div className="flex items-center mb-4">
          <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
            {icon}
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-700 leading-relaxed mb-4">
          {description}
        </p>
        <Link 
          to={link}
          className="mt-auto text-primary-600 hover:text-primary-700 font-medium inline-flex items-center transition-colors duration-300"
          aria-label={`Learn more about ${title}`}
        >
          <span>{t(learnMoreText, 'Learn more →')}</span>
        </Link>
      </div>
    </div>
  );
};

export default ServiceCard;