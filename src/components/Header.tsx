import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, Calendar, Facebook, Instagram, Youtube } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('EN');
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const location = useLocation();

  const languages = ['EN', 'DE', 'IT', 'RU'];

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Events', href: '/events' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
  ];

  // Handle scroll effect with dynamic transparency
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setScrolled(currentScrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate dynamic background opacity based on scroll position
  const getBackgroundOpacity = () => {
    if (scrollY === 0) return 0.4; // Very transparent at top
    if (scrollY < 100) return 0.4 + (scrollY / 100) * 0.3; // Gradually increase to 0.7
    return Math.min(0.85, 0.7 + (scrollY - 100) / 500 * 0.15); // Max 0.85 opacity
  };

  // Calculate blur intensity
  const getBlurIntensity = () => {
    if (scrollY === 0) return 8; // Light blur at top
    if (scrollY < 100) return 8 + (scrollY / 100) * 8; // Increase to 16px
    return Math.min(20, 16 + (scrollY - 100) / 300 * 4); // Max 20px blur
  };

  const backgroundOpacity = getBackgroundOpacity();
  const blurIntensity = getBlurIntensity();

  return (
    <header 
      className="fixed w-full z-50 transition-all duration-500"
      style={{
        background: `rgba(255, 255, 255, ${backgroundOpacity})`,
        backdropFilter: `blur(${blurIntensity}px)`,
        WebkitBackdropFilter: `blur(${blurIntensity}px)`,
        borderBottom: scrolled ? `1px solid rgba(255, 255, 255, ${Math.min(0.3, backgroundOpacity * 0.5)})` : 'none',
        boxShadow: scrolled ? `0 4px 32px rgba(0, 0, 0, ${Math.min(0.1, scrollY / 1000)})` : 'none'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-300 ${
          scrolled ? 'py-2' : 'py-3'
        }`}>
          {/* Logo - уменьшенный размер */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <img
                src="/gardalogo.png"
                alt="Garda Racing Yacht Club"
                className={`object-contain group-hover:scale-110 transition-transform duration-300 ${
                  scrolled ? 'h-12 w-12' : 'h-16 w-16'
                }`}
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold-400 rounded-full animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className={`font-bold transition-all duration-300 ${
                scrolled ? 'text-lg' : 'text-xl'
              }`}
              style={{
                color: `rgba(17, 24, 39, ${Math.max(0.8, 1 - scrollY / 500)})`
              }}>
                Garda Racing
              </h1>
              <p className={`transition-all duration-300 ${
                scrolled ? 'text-xs' : 'text-sm'
              }`}
              style={{
                color: `rgba(75, 85, 99, ${Math.max(0.7, 1 - scrollY / 400)})`
              }}>
                Yacht Club
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`font-medium transition-all duration-300 hover:scale-105 pb-1 ${
                  location.pathname === item.href
                    ? 'border-b-2 border-primary-600'
                    : 'hover:text-primary-600'
                }`}
                style={{
                  color: location.pathname === item.href 
                    ? 'rgb(220, 38, 38)' 
                    : `rgba(55, 65, 81, ${Math.max(0.8, 1 - scrollY / 600)})`
                }}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language Selector */}
            <div className="relative group">
              <button 
                className="flex items-center space-x-1 px-2 py-1 rounded-lg transition-all duration-300"
                style={{
                  color: `rgba(55, 65, 81, ${Math.max(0.8, 1 - scrollY / 600)})`,
                  backgroundColor: `rgba(255, 255, 255, ${Math.min(0.5, scrollY / 200)})`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `rgba(255, 255, 255, ${Math.min(0.7, 0.3 + scrollY / 200)})`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `rgba(255, 255, 255, ${Math.min(0.5, scrollY / 200)})`;
                }}
              >
                <Globe className="h-3 w-3" />
                <span className="text-xs font-medium">{currentLang}</span>
              </button>
              <div 
                className="absolute right-0 mt-2 w-20 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300"
                style={{
                  backgroundColor: `rgba(255, 255, 255, ${Math.max(0.9, 0.85 + scrollY / 1000)})`,
                  backdropFilter: `blur(${Math.max(12, blurIntensity)}px)`,
                  WebkitBackdropFilter: `blur(${Math.max(12, blurIntensity)}px)`
                }}
              >
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setCurrentLang(lang)}
                    className="block w-full text-left px-2 py-1 text-xs transition-colors duration-300 first:rounded-t-lg last:rounded-b-lg"
                    style={{
                      color: `rgba(55, 65, 81, ${Math.max(0.8, 1 - scrollY / 600)})`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `rgba(255, 255, 255, 0.7)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Book Now Button */}
            <Link
              to="/booking"
              className={`flex items-center space-x-1 rounded-lg font-medium bg-primary-600 text-white hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-lg ${
                scrolled ? 'px-4 py-1 text-sm' : 'px-5 py-2 text-sm'
              }`}
              style={{
                boxShadow: `0 4px 16px rgba(220, 38, 38, ${Math.min(0.3, 0.1 + scrollY / 500)})`
              }}
            >
              <Calendar className="h-3 w-3" />
              <span>Book Now</span>
            </Link>

            {/* Social Media Icons */}
            <div className="flex items-center space-x-1 ml-2">
              <a 
                href="#" 
                className="p-1 transition-all duration-300 hover:scale-110"
                style={{
                  color: `rgba(75, 85, 99, ${Math.max(0.7, 1 - scrollY / 500)})`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'rgb(220, 38, 38)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = `rgba(75, 85, 99, ${Math.max(0.7, 1 - scrollY / 500)})`;
                }}
                title="Facebook"
              >
                <Facebook className="h-3 w-3" />
              </a>
              <a 
                href="https://www.instagram.com/garda_racing_yacht_club"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 transition-all duration-300 hover:scale-110"
                style={{
                  color: `rgba(75, 85, 99, ${Math.max(0.7, 1 - scrollY / 500)})`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'rgb(220, 38, 38)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = `rgba(75, 85, 99, ${Math.max(0.7, 1 - scrollY / 500)})`;
                }}
                title="Instagram"
              >
                <Instagram className="h-3 w-3" />
              </a>
              <a 
                href="#" 
                className="p-1 transition-all duration-300 hover:scale-110"
                style={{
                  color: `rgba(75, 85, 99, ${Math.max(0.7, 1 - scrollY / 500)})`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'rgb(220, 38, 38)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = `rgba(75, 85, 99, ${Math.max(0.7, 1 - scrollY / 500)})`;
                }}
                title="YouTube"
              >
                <Youtube className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-all duration-300"
            style={{
              color: `rgba(55, 65, 81, ${Math.max(0.8, 1 - scrollY / 600)})`,
              backgroundColor: `rgba(255, 255, 255, ${Math.min(0.5, scrollY / 200)})`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `rgba(255, 255, 255, ${Math.min(0.7, 0.3 + scrollY / 200)})`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = `rgba(255, 255, 255, ${Math.min(0.5, scrollY / 200)})`;
            }}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div 
            className="md:hidden rounded-lg shadow-lg mb-4 animate-slide-up"
            style={{
              backgroundColor: `rgba(255, 255, 255, ${Math.max(0.9, 0.85 + scrollY / 1000)})`,
              backdropFilter: `blur(${Math.max(16, blurIntensity + 4)}px)`,
              WebkitBackdropFilter: `blur(${Math.max(16, blurIntensity + 4)}px)`
            }}
          >
            <div className="px-4 py-6 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2 font-medium transition-all duration-300 ${
                    location.pathname === item.href
                      ? 'text-primary-600 border-l-4 border-primary-600 pl-4'
                      : 'hover:text-primary-600 hover:pl-2'
                  }`}
                  style={{
                    color: location.pathname === item.href 
                      ? 'rgb(220, 38, 38)' 
                      : `rgba(55, 65, 81, ${Math.max(0.8, 1 - scrollY / 600)})`
                  }}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t" style={{ borderColor: `rgba(229, 231, 235, ${Math.max(0.3, 0.2 + scrollY / 1000)})` }}>
                {/* Mobile Book Now Button */}
                <Link
                  to="/booking"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center space-x-2 w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-300 mb-4"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Book Now</span>
                </Link>

                {/* Mobile Social Icons and Language */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <a 
                      href="#" 
                      className="transition-colors duration-300"
                      style={{
                        color: `rgba(75, 85, 99, ${Math.max(0.7, 1 - scrollY / 500)})`
                      }}
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a 
                      href="https://www.instagram.com/garda_racing_yacht_club"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors duration-300"
                      style={{
                        color: `rgba(75, 85, 99, ${Math.max(0.7, 1 - scrollY / 500)})`
                      }}
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a 
                      href="#" 
                      className="transition-colors duration-300"
                      style={{
                        color: `rgba(75, 85, 99, ${Math.max(0.7, 1 - scrollY / 500)})`
                      }}
                    >
                      <Youtube className="h-5 w-5" />
                    </a>
                  </div>
                  
                  <div className="flex space-x-2">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setCurrentLang(lang)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-300 ${
                          currentLang === lang
                            ? 'bg-primary-600 text-white'
                            : 'hover:bg-gray-100'
                        }`}
                        style={{
                          color: currentLang === lang 
                            ? 'white' 
                            : `rgba(75, 85, 99, ${Math.max(0.7, 1 - scrollY / 500)})`
                        }}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;