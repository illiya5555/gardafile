import React, { useState, useEffect } from 'react';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  interval?: number;
  height?: string;
  className?: string;
}

/**
 * Accessible image carousel component
 * Auto-rotates through images with aria attributes for screen readers
 */
const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  alt,
  interval = 5000,
  height = 'h-96',
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);
    
    return () => clearInterval(timer);
  }, [images.length, interval]);
  
  const handleImageSelect = (index: number) => {
    setCurrentIndex(index);
  };
  
  return (
    <div className={`relative rounded-2xl shadow-xl overflow-hidden ${className}`} role="region" aria-label={alt}>
      {/* Visually hidden heading for screen readers */}
      <h3 className="sr-only">{alt}</h3>
      
      {images.map((image, index) => {
        // Generate srcset variations for better performance
        const imageUrl = new URL(image);
        const srcSet = [
          `${imageUrl.href} 800w`,
          `${imageUrl.href}?width=400 400w`,
          `${imageUrl.href}?width=800 800w`,
          `${imageUrl.href}?width=1200 1200w`
        ].join(', ');
        
        return (
          <div
            key={index}
            className={`transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 absolute inset-0 z-0'
            }`}
            aria-hidden={index !== currentIndex}
          >
            <img
              src={image}
              srcSet={srcSet}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw"
              alt={`${alt} - image ${index + 1} of ${images.length}`}
              className={`w-full ${height} object-cover`}
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        );
      })}
      
      {/* Navigation dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => handleImageSelect(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`View image ${index + 1}`}
            aria-current={index === currentIndex ? 'true' : 'false'}
          />
        ))}
      </div>
      
      {/* Visually hidden but accessible status */}
      <div className="sr-only" aria-live="polite">
        Showing image {currentIndex + 1} of {images.length}
      </div>
    </div>
  );
};

export default ImageCarousel;