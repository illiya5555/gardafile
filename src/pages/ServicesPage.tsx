import React, { useState, useEffect } from 'react';
import { Users, Award, Camera, Phone, Mail, CheckCircle, Star, Calendar, MapPin, Clock, Music, Utensils, Car, Video } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, CorporatePackage, AdditionalService, CorporateInquiry } from '../lib/supabase';

const ServicesPage = () => {
  const [packages, setPackages] = useState<CorporatePackage[]>([]);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const { user, profile } = useAuth();

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
          participants_range: '12-24 человека',
          duration: '4 часа',
          features: [
            'Профессиональные шкиперы',
            'Инструктаж по безопасности',
            'Командные гонки',
            'Фотосъемка мероприятия',
            'Сертификаты участников',
            'Легкий обед на берегу'
          ],
          is_popular: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Corporate Challenge',
          description: 'Our most popular package for medium-sized corporate groups',
          price: 4800,
          participants_range: '24-48 человек',
          duration: '6 часов',
          features: [
            'Все из пакета Team Spirit',
            'Профессиональная видеосъемка',
            'Церемония награждения',
            'Кубки и медали',
            'Банкет с итальянской кухней',
            'Трансфер от отеля',
            'Персональный координатор'
          ],
          is_popular: true,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Executive Regatta',
          description: 'Premium experience for large corporate events',
          price: 9600,
          participants_range: '48-96 человек',
          duration: '8 часов',
          features: [
            'Все из пакета Corporate Challenge',
            'VIP-зона для руководства',
            'Живая музыка и развлечения',
            'Премиальные напитки',
            'Персонализированные подарки',
            'Профессиональный ведущий',
            'Организация дополнительных активностей'
          ],
          is_popular: false,
          created_at: new Date().toISOString()
        }
      ]);

      setAdditionalServices([
        {
          id: '1',
          name: 'Трансфер',
          description: 'Комфортабельные автобусы от отеля',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Кейтеринг',
          description: 'Итальянская кухня и напитки',
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Развлечения',
          description: 'Живая музыка и ведущий',
          created_at: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Фото/Видео',
          description: 'Профессиональная съемка',
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
    
    // Pre-fill form if user is logged in
    if (profile) {
      setInquiryForm(prev => ({
        ...prev,
        contact_person: `${profile.first_name} ${profile.last_name}`.trim(),
        email: profile.email,
        phone: profile.phone || ''
      }));
    }
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;

    setFormLoading(true);
    try {
      const inquiryData: Partial<CorporateInquiry> = {
        package_id: selectedPackage,
        user_id: user?.id,
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

      alert('Ваш запрос отправлен! Мы свяжемся с вами в ближайшее время.');
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
      alert('Ошибка при отправке запроса: ' + error.message);
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
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif">
            Корпоративные услуги
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Создайте незабываемые корпоративные мероприятия на озере Гарда. 
            Профессионально организованные регаты для укрепления командного духа.
          </p>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Корпоративные регаты</h3>
              <p className="text-gray-600">Укрепите командный дух и создайте незабываемые воспоминания</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Подарочные сертификаты</h3>
              <p className="text-gray-600">Идеальный подарок для любителей парусного спорта</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Частные мероприятия</h3>
              <p className="text-gray-600">Персонализированные события для особых случаев</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Обучение и курсы</h3>
              <p className="text-gray-600">Профессиональное обучение парусному спорту</p>
            </div>
          </div>

          {/* Corporate Benefits */}
          <div className="bg-gradient-to-br from-blue-50 to-primary-50 rounded-2xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Преимущества корпоративных регат</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Командная работа</h3>
                <p className="text-gray-700">Парусный спорт требует слаженной работы команды. Идеальная метафора для бизнеса и отличный способ укрепить связи между коллегами.</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Здоровая конкуренция</h3>
                <p className="text-gray-700">Соревновательный элемент мотивирует сотрудников и создает позитивную атмосферу. Победители получают награды и признание.</p>
              </div>
              <div className="text-center">
                <div className="bg-gold-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-gold-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Энергия и мотивация</h3>
                <p className="text-gray-700">Активный отдых на свежем воздухе заряжает энергией и повышает мотивацию. Сотрудники возвращаются в офис вдохновленными.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Packages */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-serif">Корпоративные пакеты</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Выберите пакет, который лучше всего подходит для вашей команды
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div key={pkg.id} className={`bg-white rounded-2xl shadow-lg overflow-hidden ${pkg.is_popular ? 'ring-2 ring-primary-600' : ''}`}>
                {pkg.is_popular && (
                  <div className="bg-primary-600 text-white text-center py-2 px-4">
                    <span className="font-semibold">Популярный</span>
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 mb-6">{pkg.description}</p>
                  
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-primary-600 mb-2">€{pkg.price}</div>
                    <div className="text-gray-600">
                      <p>{pkg.participants_range}</p>
                      <p>{pkg.duration}</p>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePackageSelect(pkg.id)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                      pkg.is_popular
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Заказать пакет
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-serif">Дополнительные услуги</h2>
            <p className="text-xl text-gray-600">Сделайте ваше мероприятие еще более особенным</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalServices.map((service, index) => {
              const icons = [Car, Utensils, Music, Video];
              const IconComponent = icons[index % icons.length];
              
              return (
                <div key={service.id} className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow duration-300">
                  <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-serif">Отзывы корпоративных клиентов</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-gold-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Отличная организация корпоративного мероприятия! Наша команда получила незабываемые впечатления. 
                Профессиональные инструкторы, качественное оборудование и потрясающие виды озера Гарда."
              </p>
              <div className="flex items-center space-x-4">
                <img
                  src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                  alt="Corporate client"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">Михаил Петров</p>
                  <p className="text-sm text-gray-600">HR Director, TechCorp</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-gold-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Идеальное место для team building! Сотрудники до сих пор обсуждают этот день. 
                Рекомендуем всем компаниям, которые хотят укрепить командный дух."
              </p>
              <div className="flex items-center space-x-4">
                <img
                  src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop"
                  alt="Corporate client"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">Анна Смирнова</p>
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
          <h2 className="text-4xl font-bold mb-6 font-serif">Готовы организовать корпоративное мероприятие?</h2>
          <p className="text-xl text-white/90 mb-8">
            Свяжитесь с нами для обсуждения деталей и получения персонального предложения
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+393456789012"
              className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors duration-300"
            >
              Позвонить +39 345 678 9012
            </a>
            <a
              href="mailto:corporate@gardaracing.com"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300"
            >
              Написать Email
            </a>
          </div>
        </div>
      </section>

      {/* Inquiry Form Modal */}
      {showInquiryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Запрос на корпоративный пакет</h2>
              
              <form onSubmit={handleSubmitInquiry} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Название компании *
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={inquiryForm.company_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Контактное лицо *
                    </label>
                    <input
                      type="text"
                      name="contact_person"
                      value={inquiryForm.contact_person}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={inquiryForm.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Количество участников *
                    </label>
                    <input
                      type="number"
                      name="participants_count"
                      value={inquiryForm.participants_count}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Предпочтительная дата
                    </label>
                    <input
                      type="date"
                      name="preferred_date"
                      value={inquiryForm.preferred_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Дополнительные пожелания
                  </label>
                  <textarea
                    name="message"
                    value={inquiryForm.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Расскажите о ваших пожеланиях к мероприятию..."
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowInquiryForm(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-300"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-300 disabled:opacity-50"
                  >
                    {formLoading ? 'Отправка...' : 'Отправить запрос'}
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