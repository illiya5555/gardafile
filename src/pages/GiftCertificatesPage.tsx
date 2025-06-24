import React, { useState } from 'react';
import { Gift, Heart, Calendar, Users, Star, Download } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const GiftCertificatesPage = () => {
  const { t } = useTranslation();
  const [selectedAmount] = useState<number>(195);
  const [recipientInfo, setRecipientInfo] = useState({
    recipientName: '',
    recipientEmail: '',
    purchaserName: '',
    purchaserEmail: '',
    message: ''
  });

  const predefinedAmounts = [195];

  const handleInputChange = (field: string, value: string) => {
    setRecipientInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePurchase = () => {
    // Handle gift certificate purchase
    console.log('Purchase gift certificate:', {
      amount: selectedAmount,
      recipient: recipientInfo
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
            <Gift className="h-8 w-8 md:h-10 md:w-10" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
            {t('gift.title', 'Gift Certificates')}
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-primary-100 max-w-3xl mx-auto">
            {t('gift.subtitle', 'Give the gift of adventure! Our yacht racing experiences on Lake Garda make perfect gifts for sailing enthusiasts and adventure seekers.')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Gift Certificate Form */}
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">
                {t('gift.form.title', 'Create Your Gift Certificate')}
              </h2>

              {/* Amount Selection */}
              <div className="mb-4 md:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">
                  {t('gift.form.amount', 'Select Amount')}
                </label>
                <div className="mb-4">
                  <button
                    className="w-full p-3 rounded-lg border-2 border-primary-500 bg-primary-50 text-primary-700 transition-colors text-base md:text-lg"
                  >
                    €195
                  </button>
                </div>
              </div>

              {/* Recipient Information */}
              <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">
                  {t('gift.form.recipient', 'Recipient Information')}
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('gift.form.recipient_name', 'Recipient Name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientInfo.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('gift.form.recipient_email', 'Recipient Email')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={recipientInfo.recipientEmail}
                    onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Purchaser Information */}
              <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">
                  {t('gift.form.purchaser', 'Your Information')}
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('gift.form.your_name', 'Your Name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientInfo.purchaserName}
                    onChange={(e) => handleInputChange('purchaserName', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('gift.form.your_email', 'Your Email')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={recipientInfo.purchaserEmail}
                    onChange={(e) => handleInputChange('purchaserEmail', e.target.value)}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Personal Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('gift.form.message', 'Personal Message')} ({t('gift.form.optional', 'Optional')})
                </label>
                <textarea
                  rows={3}
                  value={recipientInfo.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder={t('gift.form.message_placeholder', 'Add a personal message to your gift...')}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Purchase Button */}
              <button
                onClick={handlePurchase}
                className="w-full bg-primary-600 text-white py-2 md:py-3 px-4 md:px-6 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm md:text-base hover:scale-105 active:scale-95"
              >
                <Gift className="h-4 md:h-5 w-4 md:w-5" />
                <span>{t('gift.form.purchase', 'Purchase Gift Certificate')} - €{selectedAmount}</span>
              </button>
            </div>

            {/* Features & Benefits */}
            <div className="space-y-6 md:space-y-8">
              <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                  {t('gift.features.title', 'Perfect Gift for Any Occasion')}
                </h3>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center space-x-3">
                    <Heart className="h-5 w-5 md:h-6 md:w-6 text-red-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm md:text-base">{t('gift.features.romantic', 'Romantic getaways')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Gift className="h-5 w-5 md:h-6 md:w-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm md:text-base">{t('gift.features.birthdays', 'Birthdays & celebrations')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm md:text-base">{t('gift.features.family', 'Family adventures')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 md:h-6 md:w-6 text-yellow-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm md:text-base">{t('gift.features.special', 'Special achievements')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
                  {t('gift.how_it_works.title', 'How It Works')}
                </h3>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary-600 text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                        {t('gift.how_it_works.step1', 'Purchase Certificate')}
                      </h4>
                      <p className="text-gray-600 text-xs md:text-sm">
                        {t('gift.how_it_works.step1_desc', 'Choose amount and recipient details')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary-600 text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                        {t('gift.how_it_works.step2', 'Receive Certificate')}
                      </h4>
                      <p className="text-gray-600 text-xs md:text-sm">
                        {t('gift.how_it_works.step2_desc', 'Digital certificate sent via email')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary-600 text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                        {t('gift.how_it_works.step3', 'Book Experience')}
                      </h4>
                      <p className="text-gray-600 text-xs md:text-sm">
                        {t('gift.how_it_works.step3_desc', 'Recipient books their sailing adventure')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary-50 rounded-lg p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-primary-900 mb-2">
                  {t('gift.validity.title', 'Certificate Validity')}
                </h3>
                <p className="text-primary-700 text-xs md:text-sm mb-1 md:mb-2">
                  {t('gift.validity.duration', 'Valid for 2 months from purchase date')}
                </p>
                <p className="text-primary-700 text-xs md:text-sm">
                  {t('gift.validity.flexible', 'Flexible booking - no blackout dates')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCertificatesPage;