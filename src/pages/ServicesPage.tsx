import React, { useState, useEffect } from 'react';
import { Users, Award, Calendar, Phone, Mail, CheckCircle, Star, MapPin, Clock, Music, Utensils, Car, Video } from 'lucide-react';
import { supabase, CorporatePackage, AdditionalService, CorporateInquiry } from '../lib/supabase';

const ServicesPage = () => {
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
      <section className="relative py-20 bg-gradient-to-br from-blue-900 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif animate-fade-in">
            Corporate Services
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up">
            Create unforgettable corporate events on Lake Garda. 
            Professionally organized regattas to strengthen team spirit.
          </p>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors duration-300">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Corporate Regattas</h3>
              <p className="text-gray-600">Strengthen team spirit and create unforgettable memories</p>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors duration-300">
                <Award className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gift Certificates</h3>
              <p className="text-gray-600">Perfect gift for sailing enthusiasts</p>
            </div>
          </div>

          {/* Corporate Benefits */}
          <div className="bg-gradient-to-br from-blue-50 to-primary-50 rounded-2xl p-8 mb-16 animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Benefits of Corporate Regattas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Teamwork</h3>
                <p className="text-gray-700">Sailing requires coordinated teamwork. Perfect metaphor for business and excellent way to strengthen colleague bonds.</p>
              </div>
              <div className="text-center group">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Healthy Competition</h3>
                <p className="text-gray-700">Competitive element motivates employees and creates positive atmosphere. Winners receive awards and recognition.</p>
              </div>
              <div className="text-center group">
                <div className="bg-gold-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-8 w-8 text-gold-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Energy & Motivation</h3>
                <p className="text-gray-700">Active outdoor recreation energizes and increases motivation. Employees return to office inspired.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-serif">Corporate Client Reviews</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-gold-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Excellent organization of corporate event! Our team got unforgettable impressions. 
                Professional instructors, quality equipment and stunning views of Lake Garda."
              </p>
              <div className="flex items-center space-x-4">
                <img
                  src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                  alt="Corporate client"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">Michael Peterson</p>
                  <p className="text-sm text-gray-600">HR Director, TechCorp</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-gold-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Perfect place for team building! Employees still discuss this day. 
                We recommend to all companies that want to strengthen team spirit."
              </p>
              <div className="flex items-center space-x-4">
                <img
                  src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                  alt="Corporate client"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">Anna Smith</p>
                  <p className="text-sm text-gray-600">CEO, Digital Solutions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6 font-serif">Ready to organize a corporate event?</h2>
          <p className="text-xl text-white/90 mb-8">
            Contact us to discuss details and get a personalized offer
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+393456789012"
              className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105"
            >
              Call +39 345 678 9012
            </a>
            <a
              href="mailto:corporate@gardaracing.com"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300"
            >
              Send Email
            </a>
          </div>
        </div>
      </section>

      {/* Inquiry Form Modal */}
      {showInquiryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Corporate Package Inquiry</h2>
              
              <form onSubmit={handleSubmitInquiry} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Company Name *
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
                      Contact Person *
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Email *
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
                      Phone *
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Number of Participants *
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
                      Preferred Date
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
                    Additional Requests
                  </label>
                  <textarea
                    name="message"
                    value={inquiryForm.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
                    placeholder="Tell us about your event requirements..."
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowInquiryForm(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-all duration-300 disabled:opacity-50 hover:scale-105"
                  >
                    {formLoading ? 'Sending...' : 'Send Inquiry'}
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