import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Anchor, Globe, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import UserMenu from './UserMenu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentLang, setCurrentLang] = useState('EN');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const location = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languages = ['EN', 'DE', 'IT', 'RU'];

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Experience', href: '/experience' },
    { name: 'Booking', href: '/booking' },
  ];

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <>
      <header className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Anchor className={`h-8 w-8 transition-colors duration-300 ${
                  isScrolled ? 'text-primary-600' : 'text-white'
                } group-hover:text-primary-500`} />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold-400 rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className={`text-xl font-bold transition-colors duration-300 ${
                  isScrolled ? 'text-gray-900' : 'text-white'
                }`}>
                  Garda Racing
                </h1>
                <p className={`text-sm transition-colors duration-300 ${
                  isScrolled ? 'text-gray-600' : 'text-white/80'
                }`}>
                  Yacht Club
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`font-medium transition-all duration-300 hover:scale-105 ${
                    location.pathname === item.href
                      ? isScrolled ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gold-300 border-b-2 border-gold-300'
                      : isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white hover:text-gold-300'
                  } pb-1`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative group">
                <button className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
                }`}>
                  <Globe className="h-4 w-4" />
                  <span className="text-sm font-medium">{currentLang}</span>
                </button>
                <div className="absolute right-0 mt-2 w-24 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setCurrentLang(lang)}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auth Section */}
              {loading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : user ? (
                <UserMenu />
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAuthClick('signin')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      isScrolled 
                        ? 'text-gray-700 hover:bg-gray-100' 
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                      isScrolled 
                        ? 'bg-primary-600 text-white hover:bg-primary-700' 
                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              )}
              
              {/* Contact */}
              <a
                href="tel:+393456789012"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                  isScrolled 
                    ? 'bg-primary-600 text-white hover:bg-primary-700' 
                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                }`}
              >
                <Phone className="h-4 w-4" />
                <span className="hidden lg:inline">Call Now</span>
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors duration-300 ${
                isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
              }`}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white/95 backdrop-blur-md rounded-lg shadow-lg mb-4 animate-slide-up">
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
                  {user ? (
                    <UserMenu />
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAuthClick('signin')}
                        className="flex-1 bg-gray-100 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-300"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => handleAuthClick('signup')}
                        className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-300"
                      >
                        Sign Up
                      </button>
                    </div>
                  )}
                  
                  <div className="mt-4 flex items-center justify-between">
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
                    <a
                      href="tel:+393456789012"
                      className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors duration-300"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Call</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default Header;