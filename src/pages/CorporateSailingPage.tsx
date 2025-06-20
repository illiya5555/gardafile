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
      <div className="py-16 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Яхтинг как идеальный тимбилдинг
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
              Нестандартный формат, эмоции, которые объединяют
            </p>
            
            <div className="flex justify-center mb-12">
              <Link 
                to="/contact" 
                className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-lg inline-flex items-center space-x-2"
              >
                <span>Оставить заявку</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            
            <div className="rounded-2xl overflow-hidden shadow-2xl mb-12 max-w-4xl mx-auto">
              <img 
                src="https://images.pexels.com/photos/273886/pexels-photo-273886.jpeg" 
                alt="Команда на яхте" 
                className="w-full h-[500px] object-cover" 
              />
            </div>
          </div>

          {/* Почему яхтинг = идеальный тимбилдинг */}
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-gray-900 mb-10 text-center">
              Почему яхтинг = идеальный тимбилдинг?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-bold text-primary-600 mb-4">🤝</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Развитие командного взаимодействия</h4>
                <p className="text-gray-600">Совместное управление яхтой требует слаженности и четкого распределения ролей</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-bold text-primary-600 mb-4">🧭</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Лидерство и ответственность</h4>
                <p className="text-gray-600">Принятие решений в реальных условиях, когда от каждого зависит общий результат</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-bold text-primary-600 mb-4">🧘</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Снятие стресса и перезагрузка</h4>
                <p className="text-gray-600">Природа, свежий воздух и новый опыт – идеальная среда для перезагрузки</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-4xl font-bold text-primary-600 mb-4">🌊</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Эмоциональный заряд и доверие</h4>
                <p className="text-gray-600">Яркие эмоции и совместное преодоление трудностей сближают команду</p>
              </div>
            </div>
          </div>
          
          {/* Как проходит тимбилдинг */}
          <div className="mb-20">
            <h3 className="text-3xl font-bold text-gray-900 mb-10 text-center">
              Как проходит тимбилдинг?
            </h3>
            
            <div className="max-w-3xl mx-auto">
              <div className="space-y-12">
                <div className="flex items-center space-x-6">
                  <div className="bg-primary-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Брифинг и инструктаж</h4>
                    <p className="text-gray-600">Знакомство с яхтой, базовые принципы управления, техника безопасности</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="bg-primary-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Разделение на команды</h4>
                    <p className="text-gray-600">Формирование экипажей, распределение ролей и ответственности</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="bg-primary-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Яхтенные гонки с судейством</h4>
                    <p className="text-gray-600">Соревнования между командами по заданному маршруту, с профессиональной оценкой</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="bg-primary-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">4</div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Командные задания на воде</h4>
                    <p className="text-gray-600">Выполнение специальных упражнений, направленных на развитие коммуникации и доверия</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="bg-primary-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0">5</div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Награждение и афтепати</h4>
                    <p className="text-gray-600">Торжественное подведение итогов, вручение наград и праздничный ужин</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Почему яхтинг = идеальный тимбилдинг?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl font-bold text-primary-600 mb-4">🤝</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Развитие командного взаимодействия</h4>
              <p className="text-gray-600">
                Совместное управление яхтой требует слаженности и четкого распределения ролей
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl font-bold text-primary-600 mb-4">🧭</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Лидерство и ответственность</h4>
              <p className="text-gray-600">
                Принятие решений в реальных условиях, когда от каждого зависит общий результат
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl font-bold text-primary-600 mb-4">🧘</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Снятие стресса и перезагрузка</h4>
              <p className="text-gray-600">
                Природа, свежий воздух и новый опыт – идеальная среда для перезагрузки
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl font-bold text-primary-600 mb-4">🌊</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Эмоциональный заряд и доверие</h4>
              <p className="text-gray-600">
                Яркие эмоции и совместное преодоление трудностей сближают команду
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Готовы объединить команду на волне эмоций?
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            Оставьте заявку — мы предложим решение под ваши цели и бюджет
          </p>
          
          <div className="bg-white shadow-xl rounded-2xl p-8 max-w-xl mx-auto border border-gray-100">
            <form className="space-y-6">
              <div>
                <input 
                  type="text" 
                  placeholder="Имя" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <input 
                  type="tel" 
                  placeholder="Телефон" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <input 
                  type="text" 
                  placeholder="Компания" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <input 
                  type="number" 
                  placeholder="Количество участников" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-lg inline-flex items-center justify-center space-x-2"
              >
                <span>Оставить заявку</span>
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