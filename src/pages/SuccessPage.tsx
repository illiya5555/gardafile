import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Calendar, Mail, Phone, ArrowRight, Check } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

// Google Ads conversion tracking function
const trackGoogleConversion = (transaction_id) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: 'AW-17237804462/WJ2PCMqk7ZIZEL33x5Q9',
      value: 195.0,
      currency: 'EUR',
      transaction_id: transaction_id
    });
    console.log('Google Ads conversion tracked successfully');
  }
};

// Meta Pixel (Facebook) conversion tracking function
const trackFbPixelConversion = (transaction_id) => {
  // Check if the fbq function is available
  if (typeof window !== 'undefined' && window.fbq) {
    // Fire the 'Purchase' event for tracking a successful transaction
    window.fbq('track', 'Purchase', {
      value: 195.0,
      currency: 'EUR',
      content_ids: [transaction_id], // Use the transaction_id for deduplication
      content_type: 'product'
    });
    console.log('Meta Pixel conversion (Purchase) tracked successfully');
  }
};


const SuccessPage = () => {
  const { t } = useTranslation();
  
  // Create a single, unique transaction ID when the component mounts
  const transactionId = React.useMemo(() => Date.now().toString(), []);

  // Track conversions when the component mounts
  React.useEffect(() => {
    // Pass the same transaction ID to both tracking systems for consistency
    trackGoogleConversion(transactionId);
    trackFbPixelConversion(transactionId);
  }, [transactionId]); // This effect runs once when the component mounts

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
            <Check className="h-16 w-16 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('success.title', 'Booking Confirmed!')}
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            {t('success.subtitle', 'Thank you for choosing Garda Racing. Your yacht racing experience has been successfully booked.')}
          </p>

          {/* Conversion badge */}
          <div className="bg-green-50 p-2 rounded-lg text-center text-xs text-green-700 font-semibold mt-2">
            <CheckCircle className="h-3 w-3 inline-block mr-1" /> 
            {t('success.conversion_tracked', 'Payment successfully recorded')}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t('success.next_steps', 'What happens next?')}
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">
                    {t('success.email_confirmation', 'Email Confirmation')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t('success.email_description', 'You will receive a confirmation email with all the details within 5 minutes.')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">
                    {t('success.contact_call', 'We\'ll Call You')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t('success.contact_description', 'Our team will contact you within 24 hours to confirm details and answer any questions.')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">
                    {t('success.prepare_experience', 'Prepare for Your Experience')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {t('success.prepare_description', 'We\'ll send you a preparation guide with everything you need to know.')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary-50 rounded-lg p-4 mb-8">
            <p className="text-sm text-primary-800">
              <strong>{t('success.booking_reference', 'Booking Reference:')}</strong> GR-{transactionId.slice(-6)}
            </p>
            <p className="text-sm text-primary-700 mt-1">
              {t('success.reference_note', 'Please keep this reference for your records.')}
            </p>
          </div>

          <div className="space-y-4">
            <Link
              to="/dashboard"
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>{t('success.view_booking', 'View My Bookings')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            <Link
              to="/"
              className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              {t('success.back_home', 'Back to Home')}
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              {t('success.questions', 'Questions or need to make changes?')}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <a
                href="tel:+393447770077"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                {t('success.call_us', 'Call us: +39 344 777 00 77')}
              </a>
              <span className="hidden sm:inline text-gray-400">|</span>
              <a
                href="mailto:info@gardaracing.com"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                {t('success.email_us', 'Email: info@gardaracing.com')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;