import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Anchor, MapPin, Phone, Mail, Award, Shield, Clock, Lock, User, Users, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AdminLogin from './AdminLogin';
import { useTranslation } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useTranslation();
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center space-x-3">
              <img
                src="https://i.postimg.cc/KcTTLWRR/gardalogo.png"
                alt={t("footer.logo.title", "Garda Racing Logo")}
                className="h-16 w-16 md:h-20 md:w-20 object-contain"
                loading="lazy"
              />
              <div>
                <h3 className="text-lg md:text-xl font-bold">{t("footer.logo.title", "Garda Racing")}</h3>
                <p className="text-xs md:text-sm text-gray-400">{t("footer.logo.subtitle", "Yacht Club")}</p>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed text-sm md:text-base">
              {t("footer.description", "Experience the thrill of yacht racing on the world-famous Lake Garda. Professional instruction, premium equipment, and unforgettable memories.")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="mt-4 sm:mt-0">
            <h4 className="text-base md:text-lg font-semibold mb-4 md:mb-6">{t("footer.quick_links.title", "Quick Links")}</h4>
            <ul className="space-y-2 md:space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-primary-500 transition-colors duration-300 text-sm md:text-base">
                  {t('nav.home', 'Home')}
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-gray-300 hover:text-primary-500 transition-colors duration-300 text-sm md:text-base">
                  {t('nav.events', 'Events')}
                </Link>
              </li>
              <li>
                <Link to="/booking" className="text-gray-300 hover:text-primary-500 transition-colors duration-300 text-sm md:text-base">
                  {t('nav.book_now', 'Book Now')}
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-primary-500 transition-colors duration-300 text-sm md:text-base">
                  {t('nav.services', 'Corporate Events')}
                </Link>
              </li>
              <li>
                <Link to="/gift-certificates" className="text-gray-300 hover:text-primary-500 transition-colors duration-300 text-sm md:text-base">
                  {t('gift.title', 'Gift Vouchers')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="mt-4 sm:mt-0">
            <h4 className="text-base md:text-lg font-semibold mb-4 md:mb-6">{t('footer.contact.title', 'Contact')}</h4>
            <ul className="space-y-2 md:space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm md:text-base">{t('footer.address.street', 'Viale Giancarlo Maroni 4')}</p>
                  <p className="text-gray-300 text-sm md:text-base">{t('footer.address.city', '38066 Riva del Garda TN')}</p>
                  <p className="text-gray-300 text-sm md:text-base">{t('footer.address.country', 'Italia')}</p>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-500 flex-shrink-0" />
                <a href="tel:+393447770077" className="text-gray-300 hover:text-primary-500 transition-colors duration-300 text-sm md:text-base">
                  {t('footer.phone', '+39 344 777 00 77')}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-500 flex-shrink-0" />
                <a href="mailto:info@gardaracing.com" className="text-gray-300 hover:text-primary-500 transition-colors duration-300 text-sm md:text-base">
                  {t('footer.email', 'info@gardaracing.com')}
                </a>
              </li>
            </ul>
          </div>

          {/* Certifications */}
          <div className="mt-4 sm:mt-0">
            <h4 className="text-base md:text-lg font-semibold mb-4 md:mb-6">{t('footer.certifications.title', 'Certifications')}</h4>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm md:text-base">{t('footer.certifications.insured', 'Fully Insured')}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm md:text-base">{t('footer.certifications.support', '24/7 Support')}</span>
              </div>
            </div>
            <div className="mt-4 md:mt-6 p-4 bg-gray-800 rounded-lg">
              <p className="text-xs md:text-sm text-gray-300 mb-1 md:mb-2">{t('footer.operating_hours', 'Operating Hours:')}</p>
              <p className="text-xs md:text-sm text-white">{t('footer.daily_hours', 'Daily: 8:00 AM - 7:00 PM')}</p>
              <p className="text-xs md:text-sm text-gray-400">{t('footer.season', 'March - October')}</p>
            </div>
            
            {/* Dashboard Login Button */}
            <button
              onClick={() => setShowAdminLogin(true)}
              className="w-full mt-4 flex items-center justify-between px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition-all duration-300 text-sm"
              aria-label="Dashboard Login"
            >
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-primary-400" />
                <span>Dashboard Login</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap justify-center md:justify-start space-x-4 md:space-x-6 text-xs md:text-sm text-gray-400">
              <a href="#" className="hover:text-primary-500 transition-colors duration-300">{t('footer.links.privacy_policy', 'Privacy Policy')}</a>
              <a href="#" className="hover:text-primary-500 transition-colors duration-300">{t('footer.links.terms_conditions', 'Terms & Conditions')}</a>
              <a href="#" className="hover:text-primary-500 transition-colors duration-300">{t('footer.links.cancellation_policy', 'Cancellation Policy')}</a>
              <a href="#" className="hover:text-primary-500 transition-colors duration-300">{t('footer.links.gdpr', 'GDPR')}</a>
            </div>
            <p className="text-xs md:text-sm text-gray-400 text-center md:text-right">
              {t('footer.copyright', '© 2025 Garda Racing Yacht Club. All rights reserved.')}
             <br />
             Italia. P.IVA :02802120226, C.F. : TITOLARE: VYVDYT79A16Z138Y
            </p>
          </div>
        </div>
      </div>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin onClose={() => setShowAdminLogin(false)} />
      )}
    </footer>
  );
};

export default Footer;