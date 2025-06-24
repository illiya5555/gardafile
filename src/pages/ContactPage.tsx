import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const ContactPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    type: 'contact'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const inquiry = {
        type: 'contact',
        status: 'new',
        priority: 'normal',
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        subject: 'Website Contact Form',
        message: formData.message,
        source: 'website'
      };
      
      const { error } = await supabase
        .from('inquiries')
        .insert([inquiry]);
        
      if (error) throw error;
      
      // Success
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error submitting your form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
    
    // Simulate form submission
    // await new Promise(resolve => setTimeout(resolve, 2000));
    
    // setIsSubmitting(false);
    // setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              {t('contact.success.title', 'Message Sent!')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('contact.success.message', 'Thank you for contacting us. We will get back to you soon.')}
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
            >
              {t('contact.success.send_another', 'Send Another Message')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            {t('contact.title', 'Contact Us')}
          </h1>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('contact.subtitle', 'Get in touch with our team for any questions about yacht racing experiences on Lake Garda')}
          </p>
        </div>

        {/* Google Map */}
        <div className="mt-10 md:mt-16">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 text-center">
            {t('contact.map.title', 'Our Location')}
          </h2>
          <div className="w-full h-[300px] md:h-[450px] rounded-lg overflow-hidden shadow-lg">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2777.3711841622!2d10.844166699999999!3d45.883888899999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47821727e0319b4d%3A0xe35bcd19dae63816!2sFraglia%20Vela%20Riva!5e0!3m2!1sru!2sil!4v1750415746957!5m2!1sru!2sil" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Garda Racing Yacht Club Location"
            ></iframe>
          </div>
          <div className="mt-3 md:mt-4 flex justify-center">
            <a 
              href="https://maps.google.com/?q=Fraglia+Vela+Riva,+Viale+Giancarlo+Maroni+4,+38066+Riva+del+Garda+TN,+Italia" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors text-sm md:text-base"
            >
              <span>{t('contact.map.get_directions', 'Get Directions')}</span>
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 mt-12">
          {/* Contact Information */}
          <div className="space-y-6 md:space-y-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                {t('contact.info.title', 'Get in Touch')}
              </h2>
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {t('contact.info.address.title', 'Address')}
                    </h3>
                    <p className="text-gray-600">
                      Viale Giancarlo Maroni 4<br />
                      38066 Riva del Garda TN<br />
                      Italia
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Phone className="h-5 w-5 md:h-6 md:w-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {t('contact.info.phone.title', 'Phone')}
                    </h3>
                    <a href="tel:+393447770077" className="text-primary-600 hover:text-primary-700">
                      +39 344 777 00 77
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Mail className="h-5 w-5 md:h-6 md:w-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {t('contact.info.email.title', 'Email')}
                    </h3>
                    <a href="mailto:info@gardaracing.com" className="text-primary-600 hover:text-primary-700">
                      info@gardaracing.com
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Clock className="h-5 w-5 md:h-6 md:w-6 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {t('contact.info.hours.title', 'Operating Hours')}
                    </h3>
                    <p className="text-gray-600">
                      {t('contact.info.hours.daily', 'Daily: 8:00 AM - 7:00 PM')}<br />
                      {t('contact.info.hours.season', 'March - October')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
              {t('contact.form.title', 'Send us a Message')}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  {t('contact.form.name', 'Full Name')} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t('contact.form.name_placeholder', 'Your full name')}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  {t('contact.form.email', 'Email Address')} *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t('contact.form.email_placeholder', 'your@email.com')}
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  {t('contact.form.phone', 'Phone Number')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t('contact.form.phone_placeholder', 'Your phone number')}
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  {t('contact.form.message', 'Message')} *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t('contact.form.message_placeholder', 'Tell us how we can help you...')}
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary-600 text-white py-2 md:py-3 px-6 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{t('contact.form.sending', 'Sending...')}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>{t('contact.form.send', 'Send Message')}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;