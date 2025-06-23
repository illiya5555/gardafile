import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Award, Calendar, Phone, Mail, CheckCircle, Star, MapPin, Clock, Music, Utensils, Car, Video } from 'lucide-react';
import { supabase, CorporatePackage, AdditionalService, CorporateInquiry } from '../lib/supabase';
import { useTranslation } from '../context/LanguageContext';

const ServicesPage = () => {
  const { t } = useTranslation();
  const [packages, setPackages] = useState<CorporatePackage[]>([]);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [inquiryForm, setInquiryForm] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    participants_count: '',
    preferred_date: '',
    message: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [packagesResponse, servicesResponse] = await Promise.all([
        supabase.from('corporate_packages').select('*').order('price'),
        supabase.from('additional_services').select('*').order('name')
      ]);

      if (packagesResponse.error) throw packagesResponse.error;
      if (servicesResponse.error) throw servicesResponse.error;

      setPackages(packagesResponse.data || []);
      setAdditionalServices(servicesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback data
      setPackages([
        {
          id: '1',
          name: 'Team Spirit',
          description: 'Perfect for small teams looking to build stronger connections',
          price: 2400,
          participants_range: '12-24 people',
          duration: '4 hours',
          features: [
            'Professional skippers',
            'Safety briefing',
            'Team races',
            'Event photography',
            'Participant certificates',
            'Light lunch on shore'
          ],
          is_popular: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Corporate Challenge',
          description: 'Our most popular package for medium-sized corporate groups',
          price: 4800,
          participants_range: '24-48 people',
          duration: '6 hours',
          features: [
            'Everything from Team Spirit',
            'Professional videography',
            'Award ceremony',
            'Trophies and medals',
            'Italian cuisine banquet',
            'Hotel transfer',
            'Personal coordinator'
          ],
          is_popular: true,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Executive Regatta',
          description: 'Premium experience for large corporate events',
          price: 9600,
          participants_range: '48-96 people',
          duration: '8 hours',
          features: [
            'Everything from Corporate Challenge',
            'VIP area for executives',
            'Live music and entertainment',
            'Premium beverages',
            'Personalized gifts',
            'Professional host',
            'Additional activities organization'
          ],
          is_popular: false,
          created_at: new Date().toISOString()
        }
      ]);

      setAdditionalServices([
        {
          id: '1',
          name: 'Transfer',
          description: 'Comfortable buses from hotel',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Catering',
          description: 'Italian cuisine and beverages',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Entertainment',
          description: 'Live music and host',
          created_at: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Photo/Video',
          description: 'Professional filming',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInquiryForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    setShowInquiryForm(true);
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;

    setFormLoading(true);
    try {
      const inquiryData: Partial<CorporateInquiry> = {
        package_id: selectedPackage,
        company_name: inquiryForm.company_name,
        contact_person: inquiryForm.contact_person,
        email: inquiryForm.email,
        phone: inquiryForm.phone,
        participants_count: parseInt(inquiryForm.participants_count),
        preferred_date: inquiryForm.preferred_date || undefined,
        message: inquiryForm.message || undefined,
        status: 'pending'
      };

      const { error } = await supabase
        .from('corporate_inquiries')
        .insert(inquiryData);

      if (error) throw error;

      alert('Your inquiry has been sent! We will contact you shortly.');
      setShowInquiryForm(false);
      setSelectedPackage(null);
      setInquiryForm({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        participants_count: '',
        preferred_date: '',
        message: ''
      });
    } catch (error: any) {
      console.error('Error submitting inquiry:', error);
      alert('Error submitting inquiry: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 bg-gradient-to-br from-blue-900 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 font-serif animate-fade-in">
            {t('services.title', 'Corporate Services')}
          </h1>
          <p className="text-base md:text-xl text-white/90 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up">
            {t('services.subtitle', 'Create unforgettable corporate events on Lake Garda. Professionally organized regattas to strengthen team spirit.')}
          </p>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16">
            {/* Corporate Regattas Card */}
            <div className="flex flex-col rounded-2xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl group">
              <Link to="/corporate-sailing" className="block overflow-hidden">
                <div 
                  className="h-48 md:h-64 bg-cover bg-center relative transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: 'url(https://i.postimg.cc/JhjJ21S9/Boas-1775.jpg)' }}
                >
                  {/* Use picture element to provide different formats and sizes */}
                  <picture>
                    {/* WebP format for better compression */}
                    <source 
                      type="image/webp"
                      srcSet="
                        https://i.postimg.cc/JhjJ21S9/Boas-1775.jpg?format=webp&width=480 480w,
                        https://i.postimg.cc/JhjJ21S9/Boas-1775.jpg?format=webp&width=800 800w,
                        https://i.postimg.cc/JhjJ21S9/Boas-1775.jpg?format=webp&width=1200 1200w
                      "
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {/* Fallback JPEG */}
                    <img 
                      src="https://i.postimg.cc/JhjJ21S9/Boas-1775.jpg" 
                      srcSet="
                        https://i.postimg.cc/JhjJ21S9/Boas-1775.jpg?width=480 480w,
                        https://i.postimg.cc/JhjJ21S9/Boas-1775.jpg?width=800 800w,
                        https://i.postimg.cc/JhjJ21S9/Boas-1775.jpg?width=1200 1200w
                      "
                      sizes="(max-width: 768px) 100vw, 50vw"
                      alt="Corporate sailing regatta"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width="800"
                      height="400"
                    />
                  </picture>
                </div>
              </Link>
              <div className="p-4 md:p-6 bg-white flex-1 flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="bg-primary-100 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                    <Users className="h-5 w-5 md:h-6 md:w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">🧭 {t('services.corporate_regatta.title', 'Corporate Sailing Regatta')}</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4 text-sm md:text-base">
                  {t('services.corporate_regatta.description', 'We offer a unique team-building program through participation in a real sailing regatta. Strengthen team spirit and create unforgettable memories on Lake Garda.')}
                </p>
                <Link 
                  to="/corporate-sailing"
                  className="mt-auto text-primary-600 hover:text-primary-700 font-medium inline-flex items-center transition-colors duration-300 text-sm md:text-base"
                >
                  <span>{t('services.corporate_regatta.learn_more', 'Learn more →')}</span>
                </Link>
              </div>
            </div>

            {/* Gift Certificates Card */}
            <div className="flex flex-col rounded-2xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl group">
              <Link to="/gift-certificates" className="block overflow-hidden">
                <div 
                  className="h-48 md:h-64 bg-cover bg-center relative transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: 'url(https://i.postimg.cc/1XvDrJbX/image.png)' }}
                >
                  {/* Use picture element for gift certificates image */}
                  <picture>
                    <source 
                      type="image/webp"
                      srcSet="
                        https://i.postimg.cc/1XvDrJbX/image.png?format=webp&width=480 480w,
                        https://i.postimg.cc/1XvDrJbX/image.png?format=webp&width=800 800w,
                        https://i.postimg.cc/1XvDrJbX/image.png?format=webp&width=1200 1200w
                      "
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <img 
                      src="https://i.postimg.cc/1XvDrJbX/image.png" 
                      srcSet="
                        https://i.postimg.cc/1XvDrJbX/image.png?width=480 480w,
                        https://i.postimg.cc/1XvDrJbX/image.png?width=800 800w,
                        https://i.postimg.cc/1XvDrJbX/image.png?width=1200 1200w
                      "
                      sizes="(max-width: 768px) 100vw, 50vw"
                      alt="Gift certificates"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width="800"
                      height="400"
                    />
                  </picture>
                </div>
              </Link>
              <div className="p-4 md:p-6 bg-white flex-1 flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="bg-primary-100 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                    <Award className="h-5 w-5 md:h-6 md:w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">🎁 {t('services.gift_certificates.title', 'Gift Certificates')}</h3>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4 text-sm md:text-base">
                  {t('services.gift_certificates.description', 'Perfect gift for sailing enthusiasts. Give the gift of an unforgettable yacht racing experience on beautiful Lake Garda.')}
                </p>
                <Link 
                  to="/gift-certificates"
                  className="mt-auto text-primary-600 hover:text-primary-700 font-medium inline-flex items-center transition-colors duration-300 text-sm md:text-base"
                >
                  <span>{t('services.gift_certificates.learn_more', 'Learn more →')}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form Modal */}
      {showInquiryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('services.inquiry.title', 'Corporate Package Inquiry')}</h2>
              
              <form onSubmit={handleSubmitInquiry} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {t('services.inquiry.company_name', 'Company Name *')}
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={inquiryForm.company_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {t('contact.form.name', 'Contact Person *')}
                    </label>
                    <input
                      type="text"
                      name="contact_person"
                      value={inquiryForm.contact_person}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {t('form.email', 'Email *')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={inquiryForm.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {t('form.phone', 'Phone *')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={inquiryForm.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {t('services.inquiry.participants_count', 'Number of Participants *')}
                    </label>
                    <input
                      type="number"
                      name="participants_count"
                      value={inquiryForm.participants_count}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {t('services.inquiry.preferred_date', 'Preferred Date')}
                    </label>
                    <input
                      type="date"
                      name="preferred_date"
                      value={inquiryForm.preferred_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    {t('services.inquiry.additional_requests', 'Additional Requests')}
                  </label>
                  <textarea
                    name="message"
                    value={inquiryForm.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                    placeholder={t('services.inquiry.additional_requests_placeholder', 'Tell us about your event requirements...')}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowInquiryForm(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-300"
                  >
                    {t('services.inquiry.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-all duration-300 disabled:opacity-50 hover:scale-105"
                  >
                    {formLoading ? t('services.inquiry.sending', 'Sending...') : t('services.inquiry.send', 'Send Inquiry')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;