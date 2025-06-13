import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Eye, 
  Upload, 
  Image, 
  Type, 
  Palette, 
  Settings, 
  Monitor,
  Smartphone,
  Tablet,
  Plus,
  Trash2,
  Edit3,
  Link,
  DollarSign,
  Calendar,
  Star,
  Users,
  Award,
  Camera,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Copy,
  Building,
  Package,
  Briefcase,
  Target,
  TrendingUp,
  Gift,
  Phone,
  Mail,
  MapPin,
  Globe,
  Zap,
  Heart,
  ThumbsUp
} from 'lucide-react';

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  participantsRange: string;
  duration: string;
  features: string[];
  isPopular: boolean;
  buttonText: string;
  buttonAction: string;
  buttonStyle: string;
  backgroundColor: string;
  textColor: string;
  isVisible: boolean;
  order: number;
}

interface AdditionalService {
  id: string;
  name: string;
  description: string;
  icon: string;
  price?: number;
  currency?: string;
  isVisible: boolean;
  order: number;
}

interface ServiceTestimonial {
  id: string;
  clientName: string;
  clientPosition: string;
  clientCompany: string;
  clientImage: string;
  rating: number;
  text: string;
  isVisible: boolean;
  order: number;
}

interface ContentBlock {
  id: string;
  type: 'hero' | 'overview' | 'packages' | 'additional-services' | 'benefits' | 'testimonials' | 'process' | 'cta';
  title: string;
  subtitle?: string;
  content: string;
  image?: string;
  video?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonText?: string;
  buttonAction?: string;
  buttonStyle?: string;
  isVisible: boolean;
  order: number;
}

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  background: string;
  button: string;
  buttonHover: string;
  link: string;
}

interface SEOSettings {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  canonical: string;
}

const ServicesContentEditor = () => {
  const [activeTab, setActiveTab] = useState('content');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isDraft, setIsDraft] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Content blocks state
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    {
      id: 'hero',
      type: 'hero',
      title: 'Corporate Services',
      subtitle: 'Create unforgettable corporate events on Lake Garda',
      content: 'Professionally organized regattas to strengthen team spirit and create lasting memories for your team.',
      image: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg',
      backgroundColor: 'linear-gradient(to bottom right, rgba(30, 58, 138, 0.9), rgba(220, 38, 38, 0.9))',
      textColor: '#ffffff',
      buttonText: 'View Packages',
      buttonAction: '#packages',
      buttonStyle: 'primary',
      isVisible: true,
      order: 1
    },
    {
      id: 'overview',
      type: 'overview',
      title: 'Why Choose Our Corporate Services',
      subtitle: 'Professional team building experiences',
      content: 'Transform your team dynamics with our expertly crafted corporate sailing experiences.',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      isVisible: true,
      order: 2
    }
  ]);

  // Service packages state
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([
    {
      id: 'team-spirit',
      name: 'Team Spirit',
      description: 'Perfect for small teams looking to build stronger connections',
      price: 2400,
      currency: '€',
      participantsRange: '12-24 people',
      duration: '4 hours',
      features: [
        'Professional skippers',
        'Safety briefing',
        'Team races',
        'Event photography',
        'Participant certificates',
        'Light lunch on shore'
      ],
      isPopular: false,
      buttonText: 'Select Package',
      buttonAction: '/contact',
      buttonStyle: 'secondary',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      isVisible: true,
      order: 1
    },
    {
      id: 'corporate-challenge',
      name: 'Corporate Challenge',
      description: 'Our most popular package for medium-sized corporate groups',
      price: 4800,
      currency: '€',
      participantsRange: '24-48 people',
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
      isPopular: true,
      buttonText: 'Most Popular',
      buttonAction: '/contact',
      buttonStyle: 'primary',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      isVisible: true,
      order: 2
    },
    {
      id: 'executive-regatta',
      name: 'Executive Regatta',
      description: 'Premium experience for large corporate events',
      price: 9600,
      currency: '€',
      participantsRange: '48-96 people',
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
      isPopular: false,
      buttonText: 'Premium Package',
      buttonAction: '/contact',
      buttonStyle: 'accent',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      isVisible: true,
      order: 3
    }
  ]);

  // Additional services state
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([
    {
      id: 'transfer',
      name: 'Transfer',
      description: 'Comfortable buses from hotel',
      icon: 'car',
      isVisible: true,
      order: 1
    },
    {
      id: 'catering',
      name: 'Catering',
      description: 'Italian cuisine and beverages',
      icon: 'utensils',
      isVisible: true,
      order: 2
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      description: 'Live music and host',
      icon: 'music',
      isVisible: true,
      order: 3
    },
    {
      id: 'photo-video',
      name: 'Photo/Video',
      description: 'Professional filming',
      icon: 'camera',
      isVisible: true,
      order: 4
    }
  ]);

  // Testimonials state
  const [serviceTestimonials, setServiceTestimonials] = useState<ServiceTestimonial[]>([
    {
      id: 'testimonial-1',
      clientName: 'Michael Peterson',
      clientPosition: 'HR Director',
      clientCompany: 'TechCorp',
      clientImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      rating: 5,
      text: 'Excellent organization of corporate event! Our team got unforgettable impressions. Professional instructors, quality equipment and stunning views of Lake Garda.',
      isVisible: true,
      order: 1
    },
    {
      id: 'testimonial-2',
      clientName: 'Anna Smith',
      clientPosition: 'CEO',
      clientCompany: 'Digital Solutions',
      clientImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
      rating: 5,
      text: 'Perfect place for team building! Employees still discuss this day. We recommend to all companies that want to strengthen team spirit.',
      isVisible: true,
      order: 2
    }
  ]);

  // Color scheme state
  const [colorScheme, setColorScheme] = useState<ColorScheme>({
    primary: '#dc2626',
    secondary: '#2563eb',
    accent: '#f59e0b',
    text: '#1f2937',
    background: '#ffffff',
    button: '#dc2626',
    buttonHover: '#b91c1c',
    link: '#2563eb'
  });

  // SEO settings state
  const [seoSettings, setSeoSettings] = useState<SEOSettings>({
    title: 'Corporate Services & Team Building | Garda Racing Yacht Club',
    description: 'Professional corporate sailing events and team building activities on Lake Garda. Custom packages for groups from 12 to 96 participants.',
    keywords: 'corporate sailing, team building Lake Garda, corporate events, sailing team building',
    ogImage: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg',
    canonical: 'https://gardaracing.com/services'
  });

  // Media library state
  const [mediaLibrary, setMediaLibrary] = useState([
    { id: '1', url: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg', name: 'Corporate Sailing', type: 'image' },
    { id: '2', url: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg', name: 'Team Building', type: 'image' },
    { id: '3', url: 'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg', name: 'Lake Garda', type: 'image' },
    { id: '4', url: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg', name: 'Award Ceremony', type: 'image' }
  ]);

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsDraft(true);
      alert('Черновик сохранен!');
    } catch (error) {
      alert('Ошибка сохранения черновика');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsDraft(false);
      alert('Изменения опубликованы!');
    } catch (error) {
      alert('Ошибка публикации');
    } finally {
      setLoading(false);
    }
  };

  const updateContentBlock = (id: string, updates: Partial<ContentBlock>) => {
    setContentBlocks(prev => 
      prev.map(block => 
        block.id === id ? { ...block, ...updates } : block
      )
    );
  };

  const addContentBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      title: 'Новый блок',
      content: 'Содержимое блока',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      isVisible: true,
      order: contentBlocks.length + 1
    };
    setContentBlocks(prev => [...prev, newBlock]);
  };

  const deleteContentBlock = (id: string) => {
    if (confirm('Удалить этот блок?')) {
      setContentBlocks(prev => prev.filter(block => block.id !== id));
    }
  };

  const updateServicePackage = (id: string, updates: Partial<ServicePackage>) => {
    setServicePackages(prev => 
      prev.map(pkg => 
        pkg.id === id ? { ...pkg, ...updates } : pkg
      )
    );
  };

  const addServicePackage = () => {
    const newPackage: ServicePackage = {
      id: `package-${Date.now()}`,
      name: 'Новый пакет',
      description: 'Описание пакета',
      price: 1000,
      currency: '€',
      participantsRange: '10-20 people',
      duration: '4 hours',
      features: ['Новая функция'],
      isPopular: false,
      buttonText: 'Выбрать пакет',
      buttonAction: '/contact',
      buttonStyle: 'primary',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      isVisible: true,
      order: servicePackages.length + 1
    };
    setServicePackages(prev => [...prev, newPackage]);
  };

  const deleteServicePackage = (id: string) => {
    if (confirm('Удалить этот пакет?')) {
      setServicePackages(prev => prev.filter(pkg => pkg.id !== id));
    }
  };

  const updateAdditionalService = (id: string, updates: Partial<AdditionalService>) => {
    setAdditionalServices(prev => 
      prev.map(service => 
        service.id === id ? { ...service, ...updates } : service
      )
    );
  };

  const addAdditionalService = () => {
    const newService: AdditionalService = {
      id: `service-${Date.now()}`,
      name: 'Новая услуга',
      description: 'Описание услуги',
      icon: 'star',
      isVisible: true,
      order: additionalServices.length + 1
    };
    setAdditionalServices(prev => [...prev, newService]);
  };

  const deleteAdditionalService = (id: string) => {
    if (confirm('Удалить эту услугу?')) {
      setAdditionalServices(prev => prev.filter(service => service.id !== id));
    }
  };

  const updateTestimonial = (id: string, updates: Partial<ServiceTestimonial>) => {
    setServiceTestimonials(prev => 
      prev.map(testimonial => 
        testimonial.id === id ? { ...testimonial, ...updates } : testimonial
      )
    );
  };

  const addTestimonial = () => {
    const newTestimonial: ServiceTestimonial = {
      id: `testimonial-${Date.now()}`,
      clientName: 'Новый клиент',
      clientPosition: 'Должность',
      clientCompany: 'Компания',
      clientImage: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
      rating: 5,
      text: 'Отзыв клиента',
      isVisible: true,
      order: serviceTestimonials.length + 1
    };
    setServiceTestimonials(prev => [...prev, newTestimonial]);
  };

  const deleteTestimonial = (id: string) => {
    if (confirm('Удалить этот отзыв?')) {
      setServiceTestimonials(prev => prev.filter(testimonial => testimonial.id !== id));
    }
  };

  const uploadMedia = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newMedia = {
        id: Date.now().toString(),
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'video'
      };
      setMediaLibrary(prev => [...prev, newMedia]);
    }
  };

  const tabs = [
    { id: 'content', label: 'Контент', icon: Edit3 },
    { id: 'packages', label: 'Пакеты услуг', icon: Package },
    { id: 'additional', label: 'Доп. услуги', icon: Plus },
    { id: 'testimonials', label: 'Отзывы', icon: Star },
    { id: 'design', label: 'Дизайн', icon: Palette },
    { id: 'media', label: 'Медиа', icon: Image },
    { id: 'seo', label: 'SEO', icon: Settings },
    { id: 'preview', label: 'Превью', icon: Eye }
  ];

  const previewModes = [
    { id: 'desktop', label: 'Десктоп', icon: Monitor },
    { id: 'tablet', label: 'Планшет', icon: Tablet },
    { id: 'mobile', label: 'Мобильный', icon: Smartphone }
  ];

  const iconOptions = [
    { value: 'car', label: 'Автомобиль', icon: '🚗' },
    { value: 'utensils', label: 'Питание', icon: '🍽️' },
    { value: 'music', label: 'Музыка', icon: '🎵' },
    { value: 'camera', label: 'Камера', icon: '📷' },
    { value: 'star', label: 'Звезда', icon: '⭐' },
    { value: 'gift', label: 'Подарок', icon: '🎁' },
    { value: 'shield', label: 'Защита', icon: '🛡️' },
    { value: 'clock', label: 'Время', icon: '⏰' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Редактор страницы Services</h1>
              <p className="text-gray-600">
                {isDraft ? (
                  <span className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span>Есть несохраненные изменения</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Опубликовано</span>
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Preview Mode Selector */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                {previewModes.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setPreviewMode(mode.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                      previewMode === mode.id
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <mode.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{mode.label}</span>
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <button
                onClick={handleSaveDraft}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>Сохранить</span>
              </button>
              
              <button
                onClick={handlePublish}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <span>Опубликовать</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              
              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Блоки контента</h2>
                    <div className="flex items-center space-x-2">
                      <select
                        onChange={(e) => addContentBlock(e.target.value as ContentBlock['type'])}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue=""
                      >
                        <option value="" disabled>Добавить блок</option>
                        <option value="hero">Главный баннер</option>
                        <option value="overview">Обзор</option>
                        <option value="benefits">Преимущества</option>
                        <option value="process">Процесс</option>
                        <option value="cta">Призыв к действию</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {contentBlocks.map((block, index) => (
                      <div key={block.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{block.title}</h3>
                              <p className="text-sm text-gray-600 capitalize">{block.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={block.isVisible}
                                onChange={(e) => updateContentBlock(block.id, { isVisible: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-600">Видимый</span>
                            </label>
                            <button
                              onClick={() => deleteContentBlock(block.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Заголовок
                            </label>
                            <input
                              type="text"
                              value={block.title}
                              onChange={(e) => updateContentBlock(block.id, { title: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          {block.subtitle !== undefined && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Подзаголовок
                              </label>
                              <input
                                type="text"
                                value={block.subtitle || ''}
                                onChange={(e) => updateContentBlock(block.id, { subtitle: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          )}
                        </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Содержимое
                          </label>
                          <textarea
                            value={block.content}
                            onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Button Settings */}
                        {block.buttonText !== undefined && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Текст кнопки
                              </label>
                              <input
                                type="text"
                                value={block.buttonText || ''}
                                onChange={(e) => updateContentBlock(block.id, { buttonText: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ссылка
                              </label>
                              <input
                                type="text"
                                value={block.buttonAction || ''}
                                onChange={(e) => updateContentBlock(block.id, { buttonAction: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="/contact или https://..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Стиль кнопки
                              </label>
                              <select
                                value={block.buttonStyle || 'primary'}
                                onChange={(e) => updateContentBlock(block.id, { buttonStyle: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="primary">Основная</option>
                                <option value="secondary">Вторичная</option>
                                <option value="accent">Акцентная</option>
                                <option value="outline">Контурная</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Packages Tab */}
              {activeTab === 'packages' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Пакеты услуг</h2>
                    <button
                      onClick={addServicePackage}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Добавить пакет</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {servicePackages.map((pkg, index) => (
                      <div key={pkg.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <Package className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                              <p className="text-sm text-gray-600">{pkg.currency}{pkg.price}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={pkg.isPopular}
                                onChange={(e) => updateServicePackage(pkg.id, { isPopular: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-600">Популярный</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={pkg.isVisible}
                                onChange={(e) => updateServicePackage(pkg.id, { isVisible: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-600">Видимый</span>
                            </label>
                            <button
                              onClick={() => deleteServicePackage(pkg.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Название пакета
                            </label>
                            <input
                              type="text"
                              value={pkg.name}
                              onChange={(e) => updateServicePackage(pkg.id, { name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Цена
                            </label>
                            <div className="flex space-x-2">
                              <input
                                type="number"
                                value={pkg.price}
                                onChange={(e) => updateServicePackage(pkg.id, { price: parseFloat(e.target.value) })}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <select
                                value={pkg.currency}
                                onChange={(e) => updateServicePackage(pkg.id, { currency: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="€">EUR (€)</option>
                                <option value="$">USD ($)</option>
                                <option value="₽">RUB (₽)</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Количество участников
                            </label>
                            <input
                              type="text"
                              value={pkg.participantsRange}
                              onChange={(e) => updateServicePackage(pkg.id, { participantsRange: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="12-24 people"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Длительность
                            </label>
                            <input
                              type="text"
                              value={pkg.duration}
                              onChange={(e) => updateServicePackage(pkg.id, { duration: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="4 hours"
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Описание
                          </label>
                          <textarea
                            value={pkg.description}
                            onChange={(e) => updateServicePackage(pkg.id, { description: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        {/* Features List */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Включенные услуги
                          </label>
                          <div className="space-y-2">
                            {pkg.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={feature}
                                  onChange={(e) => {
                                    const newFeatures = [...pkg.features];
                                    newFeatures[featureIndex] = e.target.value;
                                    updateServicePackage(pkg.id, { features: newFeatures });
                                  }}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                  onClick={() => {
                                    const newFeatures = pkg.features.filter((_, i) => i !== featureIndex);
                                    updateServicePackage(pkg.id, { features: newFeatures });
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newFeatures = [...pkg.features, 'Новая услуга'];
                                updateServicePackage(pkg.id, { features: newFeatures });
                              }}
                              className="flex items-center space-x-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 w-full"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Добавить услугу</span>
                            </button>
                          </div>
                        </div>

                        {/* Button Settings */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Текст кнопки
                            </label>
                            <input
                              type="text"
                              value={pkg.buttonText}
                              onChange={(e) => updateServicePackage(pkg.id, { buttonText: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ссылка
                            </label>
                            <input
                              type="text"
                              value={pkg.buttonAction}
                              onChange={(e) => updateServicePackage(pkg.id, { buttonAction: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Стиль кнопки
                            </label>
                            <select
                              value={pkg.buttonStyle}
                              onChange={(e) => updateServicePackage(pkg.id, { buttonStyle: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="primary">Основная</option>
                              <option value="secondary">Вторичная</option>
                              <option value="accent">Акцентная</option>
                              <option value="outline">Контурная</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Services Tab */}
              {activeTab === 'additional' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Дополнительные услуги</h2>
                    <button
                      onClick={addAdditionalService}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Добавить услугу</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {additionalServices.map((service) => (
                      <div key={service.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <span className="text-lg">
                                {iconOptions.find(opt => opt.value === service.icon)?.icon || '⭐'}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{service.name}</h3>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={service.isVisible}
                                onChange={(e) => updateAdditionalService(service.id, { isVisible: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-600">Видимая</span>
                            </label>
                            <button
                              onClick={() => deleteAdditionalService(service.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Название услуги
                            </label>
                            <input
                              type="text"
                              value={service.name}
                              onChange={(e) => updateAdditionalService(service.id, { name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Описание
                            </label>
                            <textarea
                              value={service.description}
                              onChange={(e) => updateAdditionalService(service.id, { description: e.target.value })}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Иконка
                            </label>
                            <select
                              value={service.icon}
                              onChange={(e) => updateAdditionalService(service.id, { icon: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {iconOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.icon} {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {service.price && (
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Цена (опционально)
                                </label>
                                <input
                                  type="number"
                                  value={service.price || ''}
                                  onChange={(e) => updateAdditionalService(service.id, { price: e.target.value ? parseFloat(e.target.value) : undefined })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Валюта
                                </label>
                                <select
                                  value={service.currency || '€'}
                                  onChange={(e) => updateAdditionalService(service.id, { currency: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="€">EUR (€)</option>
                                  <option value="$">USD ($)</option>
                                  <option value="₽">RUB (₽)</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Testimonials Tab */}
              {activeTab === 'testimonials' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Отзывы клиентов</h2>
                    <button
                      onClick={addTestimonial}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Добавить отзыв</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {serviceTestimonials.map((testimonial) => (
                      <div key={testimonial.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={testimonial.clientImage}
                              alt={testimonial.clientName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900">{testimonial.clientName}</h3>
                              <p className="text-sm text-gray-600">{testimonial.clientPosition}, {testimonial.clientCompany}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={testimonial.isVisible}
                                onChange={(e) => updateTestimonial(testimonial.id, { isVisible: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-600">Видимый</span>
                            </label>
                            <button
                              onClick={() => deleteTestimonial(testimonial.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Имя клиента
                            </label>
                            <input
                              type="text"
                              value={testimonial.clientName}
                              onChange={(e) => updateTestimonial(testimonial.id, { clientName: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Должность
                            </label>
                            <input
                              type="text"
                              value={testimonial.clientPosition}
                              onChange={(e) => updateTestimonial(testimonial.id, { clientPosition: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Компания
                            </label>
                            <input
                              type="text"
                              value={testimonial.clientCompany}
                              onChange={(e) => updateTestimonial(testimonial.id, { clientCompany: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Рейтинг
                            </label>
                            <select
                              value={testimonial.rating}
                              onChange={(e) => updateTestimonial(testimonial.id, { rating: parseInt(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value={5}>5 звезд</option>
                              <option value={4}>4 звезды</option>
                              <option value={3}>3 звезды</option>
                              <option value={2}>2 звезды</option>
                              <option value={1}>1 звезда</option>
                            </select>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            URL фотографии клиента
                          </label>
                          <input
                            type="url"
                            value={testimonial.clientImage}
                            onChange={(e) => updateTestimonial(testimonial.id, { clientImage: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com/photo.jpg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Текст отзыва
                          </label>
                          <textarea
                            value={testimonial.text}
                            onChange={(e) => updateTestimonial(testimonial.id, { text: e.target.value })}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Design Tab */}
              {activeTab === 'design' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Настройки дизайна</h2>
                  
                  <div className="space-y-8">
                    {/* Color Scheme */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Цветовая схема</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(colorScheme).map(([key, value]) => (
                          <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                              {key === 'primary' ? 'Основной' :
                               key === 'secondary' ? 'Вторичный' :
                               key === 'accent' ? 'Акцент' :
                               key === 'text' ? 'Текст' :
                               key === 'background' ? 'Фон' :
                               key === 'button' ? 'Кнопка' :
                               key === 'buttonHover' ? 'Кнопка (hover)' :
                               key === 'link' ? 'Ссылка' : key}
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={value}
                                onChange={(e) => setColorScheme(prev => ({ ...prev, [key]: e.target.value }))}
                                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                              />
                              <input
                                type="text"
                                value={value}
                                onChange={(e) => setColorScheme(prev => ({ ...prev, [key]: e.target.value }))}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Typography */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Типографика</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Основной шрифт
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Inter">Inter (текущий)</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Lato">Lato</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Шрифт заголовков
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Playfair Display">Playfair Display (текущий)</option>
                            <option value="Merriweather">Merriweather</option>
                            <option value="Lora">Lora</option>
                            <option value="Crimson Text">Crimson Text</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Layout Settings */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Настройки макета</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Максимальная ширина контента
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="1280px">1280px (текущий)</option>
                            <option value="1200px">1200px</option>
                            <option value="1440px">1440px</option>
                            <option value="100%">Полная ширина</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Отступы секций
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="normal">Обычные</option>
                            <option value="compact">Компактные</option>
                            <option value="spacious">Просторные</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Стиль карточек
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="rounded">Скругленные</option>
                            <option value="square">Квадратные</option>
                            <option value="minimal">Минималистичные</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Media Tab */}
              {activeTab === 'media' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Медиа библиотека</h2>
                    <label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-300">
                      <Upload className="h-4 w-4" />
                      <span>Загрузить файл</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={uploadMedia}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mediaLibrary.map(media => (
                      <div key={media.id} className="group relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                        {media.type === 'image' ? (
                          <img
                            src={media.url}
                            alt={media.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => navigator.clipboard.writeText(media.url)}
                              className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                              title="Копировать URL"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = media.url;
                                link.download = media.name;
                                link.click();
                              }}
                              className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                              title="Скачать"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                          <p className="text-white text-xs truncate">{media.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SEO Tab */}
              {activeTab === 'seo' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">SEO настройки</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Заголовок страницы (Title)
                      </label>
                      <input
                        type="text"
                        value={seoSettings.title}
                        onChange={(e) => setSeoSettings(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={60}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {seoSettings.title.length}/60 символов
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Описание (Meta Description)
                      </label>
                      <textarea
                        value={seoSettings.description}
                        onChange={(e) => setSeoSettings(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={160}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {seoSettings.description.length}/160 символов
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ключевые слова
                      </label>
                      <input
                        type="text"
                        value={seoSettings.keywords}
                        onChange={(e) => setSeoSettings(prev => ({ ...prev, keywords: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ключевое слово, другое ключевое слово"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Open Graph изображение
                      </label>
                      <input
                        type="text"
                        value={seoSettings.ogImage}
                        onChange={(e) => setSeoSettings(prev => ({ ...prev, ogImage: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="/path/to/image.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Canonical URL
                      </label>
                      <input
                        type="url"
                        value={seoSettings.canonical}
                        onChange={(e) => setSeoSettings(prev => ({ ...prev, canonical: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://gardaracing.com/services"
                      />
                    </div>

                    {/* SEO Preview */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Превью в поисковой выдаче</h3>
                      <div className="bg-white p-4 rounded border">
                        <h4 className="text-blue-600 text-lg hover:underline cursor-pointer">
                          {seoSettings.title}
                        </h4>
                        <p className="text-green-600 text-sm">
                          {seoSettings.canonical}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                          {seoSettings.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Превью страницы</h2>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">Режим: {previewMode}</span>
                      <button
                        onClick={() => window.open('/services', '_blank')}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Открыть в новой вкладке</span>
                      </button>
                    </div>
                  </div>

                  <div className={`mx-auto bg-gray-100 rounded-lg overflow-hidden ${
                    previewMode === 'desktop' ? 'max-w-full' :
                    previewMode === 'tablet' ? 'max-w-2xl' :
                    'max-w-sm'
                  }`}>
                    <div className="bg-white min-h-96 p-8">
                      <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
                          {contentBlocks.find(b => b.type === 'hero')?.title}
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                          {contentBlocks.find(b => b.type === 'hero')?.content}
                        </p>
                      </div>

                      {/* Service Packages Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {servicePackages.filter(pkg => pkg.isVisible).slice(0, 3).map((pkg) => (
                          <div key={pkg.id} className={`bg-white rounded-xl shadow-sm border p-6 ${pkg.isPopular ? 'ring-2 ring-blue-600' : 'border-gray-200'}`}>
                            {pkg.isPopular && (
                              <div className="bg-blue-600 text-white text-center py-1 px-3 rounded-full text-sm font-semibold mb-4">
                                Most Popular
                              </div>
                            )}
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                            <p className="text-gray-600 mb-4">{pkg.description}</p>
                            <div className="text-center mb-4">
                              <div className="text-3xl font-bold text-blue-600">{pkg.currency}{pkg.price}</div>
                              <div className="text-sm text-gray-600">{pkg.participantsRange}</div>
                            </div>
                            <ul className="space-y-2 mb-6">
                              {pkg.features.slice(0, 3).map((feature, index) => (
                                <li key={index} className="flex items-center space-x-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                            <button 
                              className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors duration-300 ${
                                pkg.isPopular
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                              }`}
                              style={{ backgroundColor: pkg.isPopular ? colorScheme.primary : undefined }}
                            >
                              {pkg.buttonText}
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Additional Services Preview */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {additionalServices.filter(service => service.isVisible).map((service) => (
                          <div key={service.id} className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl mb-2">
                              {iconOptions.find(opt => opt.value === service.icon)?.icon || '⭐'}
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">{service.name}</h4>
                            <p className="text-sm text-gray-600">{service.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesContentEditor;