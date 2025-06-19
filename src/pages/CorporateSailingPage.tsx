import React, { useState } from 'react';
import { Users, Calendar, MapPin, Star, Check, ArrowRight } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const CorporateSailingPage = () => {
  const { t } = useTranslation();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const packages = [
    {
      id: 'team-building',
      name: 'Team Building Experience',
      duration: '4 hours',
      participants: '8-15 people',
      price: 1200,
      description: 'Perfect for team building activities with competitive sailing challenges.',
      features: [
        'Professional sailing instruction',
        'Team-based sailing competitions',
        'Safety equipment included',
        'Post-sailing refreshments',
        'Team building activities on shore'
      ],
      popular: true
    },
    {
      id: 'executive-day',
      name: 'Executive Sailing Day',
      duration: '6 hours',
      participants: '6-12 people',
      price: 1800,
      description: 'Exclusive sailing experience for executives and VIP clients.',
      features: [
        'Premium yacht charter',
        'Personal sailing instructor',
        'Gourmet lunch on board',
        'Professional photography',
        'Champagne welcome',
        'Flexible itinerary'
      ],
      popular: false
    },
    {
      id: 'multi-day',
      name: 'Multi-Day Corporate Retreat',
      duration: '2-3 days',
      participants: '10-20 people',
      price: 3500,
      description: 'Comprehensive sailing retreat with accommodation and activities.',
      features: [
        'Multi-day sailing program',
        'Hotel accommodation',
        'All meals included',
        'Evening entertainment',
        'Meeting facilities',
        'Professional event coordination'
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-primary-900 text-white py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-primary-800 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            {t('corporate.title', 'Corporate Sailing Events')}
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto mb-8">
            {t('corporate.subtitle', 'Create unforgettable team experiences on the beautiful waters of Lake Garda. Professional sailing instruction, team building activities, and premium service.')}
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Team Building</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Premium Service</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Lake Garda</span>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('corporate.packages.title', 'Corporate Packages')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('corporate.packages.subtitle', 'Choose from our carefully designed corporate sailing packages, each tailored to different group sizes and objectives.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-white rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl ${
                  pkg.popular ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 mb-4">{pkg.description}</p>
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    €{pkg.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {pkg.duration} • {pkg.participants}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setSelectedPackage(pkg.id)}
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Request Quote</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('corporate.benefits.title', 'Why Choose Corporate Sailing?')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Building</h3>
              <p className="text-gray-600">
                Strengthen team bonds through collaborative sailing challenges and shared experiences on the water.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Service</h3>
              <p className="text-gray-600">
                Expert instructors, premium equipment, and dedicated event coordination for a seamless experience.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Stunning Location</h3>
              <p className="text-gray-600">
                Lake Garda's beautiful waters and mountain scenery provide the perfect backdrop for corporate events.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-primary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('corporate.cta.title', 'Ready to Plan Your Corporate Event?')}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {t('corporate.cta.subtitle', 'Contact our team to discuss your requirements and create a customized sailing experience for your group.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors">
              {t('corporate.cta.contact', 'Contact Us')}
            </button>
            <a
              href="tel:+393447770077"
              className="border border-primary-600 text-primary-600 px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors"
            >
              {t('corporate.cta.call', 'Call +39 344 777 00 77')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateSailingPage;