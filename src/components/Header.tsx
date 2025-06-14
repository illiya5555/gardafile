import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, Calendar, Facebook, Instagram, Youtube } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('EN');
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const languages = ['EN', 'DE', 'IT', 'RU'];

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Events', href: '/events' },
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20' 
        : 'bg-white/70 backdrop-blur-sm'
    }`}>
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
              <h1 className={`font-bold text-gray-900 transition-all duration-300 ${
                scrolled ? 'text-lg' : 'text-xl'
              }`}>
                Garda Racing
              </h1>
              <p className={`text-gray-600 transition-all duration-300 ${
                scrolled ? 'text-xs' : 'text-sm'
              }`}>
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
                className={`font-medium transition-all duration-300 hover:scale-105 ${
                  location.pathname === item.href
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-700 hover:text-primary-600'
                } pb-1`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language Selector */}
            <div className="relative group">
              <button className="flex items-center space-x-1 px-2 py-1 rounded-lg text-gray-700 hover:bg-white/50 transition-all duration-300">
                <Globe className="h-3 w-3" />
                <span className="text-xs font-medium">{currentLang}</span>
              </button>
              <div className="absolute right-0 mt-2 w-20 bg-white/90 backdrop-blur-md rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setCurrentLang(lang)}
                    className="block w-full text-left px-2 py-1 text-xs text-gray-700 hover:bg-white/70 first:rounded-t-lg last:rounded-b-lg"
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
            >
              <Calendar className="h-3 w-3" />
              <span>Book Now</span>
            </Link>

            {/* Social Media Icons */}
            <div className="flex items-center space-x-1 ml-2">
              <a 
                href="#" 
                className="p-1 text-gray-600 hover:text-primary-600 transition-colors duration-300 hover:scale-110"
                title="Facebook"
              >
                <Facebook className="h-3 w-3" />
              </a>
              <a 
                href="https://www.instagram.com/garda_racing_yacht_club"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-gray-600 hover:text-primary-600 transition-colors duration-300 hover:scale-110"
                title="Instagram"
              >
                <Instagram className="h-3 w-3" />
              </a>
              <a 
                href="#" 
                className="p-1 text-gray-600 hover:text-primary-600 transition-colors duration-300 hover:scale-110"
                title="YouTube"
              >
                <Youtube className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-white/50 transition-colors duration-300"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/90 backdrop-blur-md rounded-lg shadow-lg mb-4 animate-slide-up">
            <div className="px-4 py-6 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2 font-medium transition-colors duration-300 ${
                    location.pathname === item.href
                      ? 'text-primary-600 border-l-4 border-primary-600 pl-4'
                      : 'text-gray-700 hover:text-primary-600 hover:pl-2'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-gray-200">
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
                    <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors duration-300">
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a 
                      href="https://www.instagram.com/garda_racing_yacht_club"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-primary-600 transition-colors duration-300"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-gray-600 hover:text-primary-600 transition-colors duration-300">
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
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
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