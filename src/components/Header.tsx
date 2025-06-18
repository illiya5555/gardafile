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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-500 ease-in-out
        border-b border-gray-200/50
        ${scrolled
          ? 'bg-white/60 shadow-2xl backdrop-blur-xl py-1'
          : 'bg-white/90 shadow-md backdrop-blur-sm py-2'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Логотип */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img
                src="/gardalogo.png"
                alt="Garda Racing Yacht Club"
                className="h-16 w-16 object-contain group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900">Garda Racing</h1>
              <p className="text-sm text-gray-600">Yacht Club</p>
            </div>
          </Link>

          {/* Навигация — desktop */}
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

          {/* Действия справа */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Языки */}
            <div className="relative group">
              <button className="flex items-center space-x-1 px-3 py-1 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-300">
                <Globe className="h-4 w-4" />
                <span className="text-sm">{currentLang}</span>
              </button>
              <div className="absolute right-0 mt-2 w-24 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setCurrentLang(lang)}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Кнопка "Book Now" */}
            <Link
              to="/booking"
              className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow"
            >
              <Calendar className="h-4 w-4" />
              <span>Book Now</span>
            </Link>

            {/* Соцсети */}
            <div className="flex items-center space-x-2 ml-4">
              <a href="#" className="p-2 text-gray-600 hover:text-primary-600 transition duration-300 hover:scale-110">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://www.instagram.com/garda_racing_yacht_club" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-600 hover:text-primary-600 transition duration-300 hover:scale-110">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 text-gray-600 hover:text-primary-600 transition duration-300 hover:scale-110">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Кнопка меню — mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Мобильное меню */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md rounded-lg shadow-lg mt-2 animate-slide-up">
            <div className="px-4 py-6 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block py-2 font-medium ${
                    location.pathname === item.href
                      ? 'text-primary-600 border-l-4 border-primary-600 pl-4'
                      : 'text-gray-700 hover:text-primary-600 hover:pl-2'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              <div className="pt-4 border-t border-gray-200">
                <Link
                  to="/booking"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </Link>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex space-x-4">
                    <a href="#" className="text-gray-600 hover:text-primary-600">
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a href="https://www.instagram.com/garda_racing_yacht_club" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary-600">
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a href="#" className="text-gray-600 hover:text-primary-600">
                      <Youtube className="h-5 w-5" />
                    </a>
                  </div>

                  <div className="flex space-x-2">
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setCurrentLang(lang)}
                        className={`px-3 py-1 text-sm rounded ${
                          currentLang === lang ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
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
