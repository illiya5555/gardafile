import React, { useState } from 'react';
import { Users, Calendar, MapPin, Star, Check, ArrowRight } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

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
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t('corporate.title', 'Corporate Sailing Events')}
          </h1>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto mb-8">
            {t('corporate.subtitle', 'Create unforgettable team experiences on the beautiful waters of Lake Garda. Professional sailing instruction, team building activities, and premium service.')}
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>{t('corporate.overview.team_building', 'Team Building')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>{t('corporate.overview.premium_service', 'Premium Service')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>{t('corporate.overview.lake_garda', 'Lake Garda')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Section */}
      <div className="py-16 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('corporate.teambuilding.title', 'Yachting as Perfect Team Building')}
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
              {t('corporate.teambuilding.subtitle', 'Unique format, emotions that unite')}
            </p>
            
            <div className="flex justify-center mb-12">
              <Link 
                to="/contact" 
                className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-lg inline-flex items-center space-x-2"
              >
                <span>{t('corporate.teambuilding.cta', 'Submit Request')}</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            
            <div className="rounded-2xl overflow-hidden shadow-2xl mb-12 max-w-4xl mx-auto">
              <img 
                src="https://images.pexels.com/photos/273886/pexels-photo-273886.jpeg" 
                alt={t('corporate.teambuilding.image_alt', 'Team on a yacht')}
                className="w-full h-[500px] object-cover" 
              />
            </div>
          </div>

          {/* Почему яхтинг = идеальный тимбилдинг */}
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-gray-900 mb-10 text-center">
              {t('corporate.why_sailing.title', 'Why Sailing = Perfect Team Building?')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-bold text-primary-600 mb-4">🤝</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">{t('corporate.why_sailing.team.title', 'Team Interaction Development')}</h4>
                <p className="text-gray-600">{t('corporate.why_sailing.team.description', 'Joint yacht management requires cohesion and clear role distribution')}</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-bold text-primary-600 mb-4">🧭</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">{t('corporate.why_sailing.leadership.title', 'Leadership and Responsibility')}</h4>
                <p className="text-gray-600">{t('corporate.why_sailing.leadership.description', 'Decision-making in real conditions where everyone impacts the overall result')}</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-bold text-primary-600 mb-4">🧘</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">{t('corporate.why_sailing.stress.title', 'Stress Relief and Reset')}</h4>
                <p className="text-gray-600">{t('corporate.why_sailing.stress.description', 'Nature, fresh air, and new experiences – the perfect environment for a reset')}</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-bold text-primary-600 mb-4">🌊</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">{t('corporate.why_sailing.emotions.title', 'Emotional Charge and Trust')}</h4>
                <p className="text-gray-600">{t('corporate.why_sailing.emotions.description', 'Vibrant emotions and jointly overcoming challenges bring the team closer together')}</p>
              </div>
            </div>
          </div>
          
          {/* Как проходит тимбилдинг */}
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-gray-900 mb-10 text-center">
              {t('corporate.how_it_works.title', 'How Does the Team Building Work?')}
            </h3>
            
            <div className="max-w-3xl mx-auto">
              <div className="space-y-12">
                <div className="flex items-center space-x-6">
                  <div className="bg-primary-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{t('corporate.how_it_works.step1.title', 'Briefing and Instruction')}</h4>
                    <p className="text-gray-600">{t('corporate.how_it_works.step1.description', 'Introduction to the yacht, basic control principles, safety techniques')}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="bg-primary-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{t('corporate.how_it_works.step2.title', 'Team Division')}</h4>
                    <p className="text-gray-600">{t('corporate.how_it_works.step2.description', 'Forming crews, distributing roles and responsibilities')}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="bg-primary-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{t('corporate.how_it_works.step3.title', 'Yacht Races with Judging')}</h4>
                    <p className="text-gray-600">{t('corporate.how_it_works.step3.description', 'Competitions between teams along a set route, with professional evaluation')}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="bg-primary-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">4</div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{t('corporate.how_it_works.step4.title', 'Team Tasks on Water')}</h4>
                    <p className="text-gray-600">{t('corporate.how_it_works.step4.description', 'Special exercises aimed at developing communication and trust')}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="bg-primary-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">5</div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{t('corporate.how_it_works.step5.title', 'Awards and Afterparty')}</h4>
                    <p className="text-gray-600">{t('corporate.how_it_works.step5.description', 'Ceremonial wrap-up, award presentation and celebration dinner')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white relative" id="benefits-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('corporate.why_sailing.title', 'Why Sailing = Perfect Team Building?')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl font-bold text-primary-600 mb-4">🤝</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">{t('corporate.why_sailing.team.title', 'Team Interaction Development')}</h4>
              <p className="text-gray-600">
                {t('corporate.why_sailing.team.description', 'Joint yacht management requires cohesion and clear role distribution')}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl font-bold text-primary-600 mb-4">🧭</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">{t('corporate.why_sailing.leadership.title', 'Leadership and Responsibility')}</h4>
              <p className="text-gray-600">
                {t('corporate.why_sailing.leadership.description', 'Decision-making in real conditions where everyone impacts the overall result')}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl font-bold text-primary-600 mb-4">🧘</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">{t('corporate.why_sailing.stress.title', 'Stress Relief and Reset')}</h4>
              <p className="text-gray-600">
                {t('corporate.why_sailing.stress.description', 'Nature, fresh air, and new experiences – the perfect environment for a reset')}
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl font-bold text-primary-600 mb-4">🌊</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">{t('corporate.why_sailing.emotions.title', 'Emotional Charge and Trust')}</h4>
              <p className="text-gray-600">
                {t('corporate.why_sailing.emotions.description', 'Vibrant emotions and jointly overcoming challenges bring the team closer together')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {t('corporate.inquiry.title', 'Ready to Unite Your Team on a Wave of Emotions?')}
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            {t('corporate.inquiry.subtitle', 'Leave a request — we will offer a solution tailored to your goals and budget')}
          </p>
          
          <div className="bg-white shadow-xl rounded-2xl p-8 max-w-xl mx-auto border border-gray-100">
            <form className="space-y-6">
              <div>
                <input 
                  type="text" 
                  placeholder={t('corporate.inquiry.form.name', 'Name')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <input 
                  type="tel" 
                  placeholder={t('corporate.inquiry.form.phone', 'Phone')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <input 
                  type="text" 
                  placeholder={t('corporate.inquiry.form.company', 'Company')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <input 
                  type="number" 
                  placeholder={t('corporate.inquiry.form.participants', 'Number of participants')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-lg inline-flex items-center justify-center space-x-2"
              >
                <span>{t('corporate.inquiry.form.submit', 'Submit Request')}</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateSailingPage;