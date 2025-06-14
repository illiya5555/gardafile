import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        throw new Error('Please fill in all required fields');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Check if Supabase URL is available
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Configuration error: Supabase URL not found');
      }

      console.log('Sending contact inquiry to:', `${supabaseUrl}/functions/v1/send-contact-inquiry`);

      // Send data to Supabase Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/send-contact-inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Server returned invalid response format');
      }

      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 404) {
          throw new Error('Contact service is temporarily unavailable. Please try calling us directly at +39 344 777 00 77');
        } else if (response.status === 500) {
          throw new Error('Server error occurred. Your message was not sent. Please try again or contact us directly.');
        } else {
          throw new Error(data.error || `Server error (${response.status}). Please try again or contact us directly.`);
        }
      }

      // Success - show confirmation and reset form
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

      console.log('Contact inquiry sent successfully');
    } catch (error: any) {
      console.error('Contact form submission error:', error);
      
      // Set user-friendly error message
      if (error.message) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred. Please try again or contact us directly at +39 344 777 00 77');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-900 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif">
            Contact Us
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            We are ready to answer all your questions and help organize 
            an unforgettable sailing adventure on Lake Garda
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Contact Information</h2>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Address</h3>
                  <p className="text-gray-600">
                    Viale Giancarlo Maroni 4<br />
                    38066 Riva del Garda TN<br />
                    Italia
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Phone className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Phone</h3>
                  <a 
                    href="tel:+393447770077" 
                    className="text-primary-600 hover:text-primary-700 transition-colors duration-300"
                  >
                    +39 344 777 00 77
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Mail className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Email</h3>
                  <div className="space-y-1">
                    <a 
                      href="mailto:info@gardaracing.com" 
                      className="block text-primary-600 hover:text-primary-700 transition-colors duration-300"
                    >
                      info@gardaracing.com
                    </a>
                    <a 
                      href="mailto:corporate@gardaracing.com" 
                      className="block text-primary-600 hover:text-primary-700 transition-colors duration-300"
                    >
                      corporate@gardaracing.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Operating Hours</h3>
                  <div className="text-gray-600">
                    <p>Daily: 8:00 AM - 7:00 PM</p>
                    <p>Season: March - October</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="mt-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">How to find us</h3>
              <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center">
                <p className="text-gray-600">Interactive map</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-white rounded-2xl shadow-card p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Send a message</h2>
              
              {submitted ? (
                <div className="text-center py-8">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Message sent!</h3>
                  <p className="text-gray-600">We will contact you shortly.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-primary-600 hover:text-primary-700 transition-colors duration-300"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-red-600 text-sm">
                          <p className="font-medium mb-1">Unable to send message</p>
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        aria-required="false"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Subject *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                        aria-required="true"
                      >
                        <option value="">Select subject</option>
                        <option value="booking">Booking</option>
                        <option value="corporate">Corporate Events</option>
                        <option value="general">General Questions</option>
                        <option value="partnership">Partnership</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Tell us about your questions or wishes..."
                      required
                      aria-required="true"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-card disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    aria-label="Send message"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Send message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Quick Contact */}
            <div className="mt-8 bg-primary-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Need quick help?</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://t.me/VETER_ITA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors duration-300 bg-telegram-500 text-white hover:bg-telegram-600"
                  aria-label="Contact us on Telegram"
                >
                  <span>💬</span>
                  <span>Telegram</span>
                </a>
                <a
                  href="https://wa.me/393447770077"
                  className="flex items-center justify-center space-x-2 bg-whatsapp-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-whatsapp-600 transition-colors duration-300"
                  aria-label="Contact us on WhatsApp"
                >
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently asked questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-card border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How to book?</h3>
              <p className="text-gray-600">
                You can book through our website, call us, or email us. 
                We will confirm your booking within 24 hours.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-card border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What weather is suitable for sailing?</h3>
              <p className="text-gray-600">
                We go to sea with winds from 5 to 25 knots. In adverse conditions, 
                we will offer a reschedule or a full refund.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-card border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Is sailing experience required?</h3>
              <p className="text-gray-600">
                No, experience is not required. Our professional instructors will teach you everything you need 
                and ensure safety on the water.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-card border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What is included in the price?</h3>
              <p className="text-gray-600">
                The price includes: professional skipper, all equipment, instruction, 
                participant medal, and professional photos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;