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
  MapPin,
  Phone,
  Mail,
  Globe,
  MessageSquare,
  HelpCircle,
  Building,
  User,
  Navigation,
  Zap,
  Target,
  Send
} from 'lucide-react';

interface ContactInfo {
  id: string;
  type: 'address' | 'phone' | 'email' | 'hours' | 'social';
  icon: string;
  title: string;
  content: string[];
  link?: string;
  isVisible: boolean;
  order: number;
}

interface ContactForm {
  id: string;
  title: string;
  description: string;
  fields: ContactFormField[];
  submitText: string;
  successMessage: string;
  isVisible: boolean;
}

interface ContactFormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  name: string;
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[];
  validation?: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isVisible: boolean;
  order: number;
}

interface MapSettings {
  latitude: number;
  longitude: number;
  zoom: number;
  style: 'standard' | 'satellite' | 'terrain';
  showMarker: boolean;
  markerTitle: string;
  height: number;
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

const ContactContentEditor = () => {
  const [activeTab, setActiveTab] = useState('content');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isDraft, setIsDraft] = useState(true);
  const [loading, setLoading] = useState(false);

  // Contact information state
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([
    {
      id: 'address',
      type: 'address',
      icon: 'MapPin',
      title: 'Адрес',
      content: [
        'Via del Porto 15',
        '38066 Riva del Garda, TN',
        'Italy'
      ],
      isVisible: true,
      order: 1
    },
    {
      id: 'phone',
      type: 'phone',
      icon: 'Phone',
      title: 'Телефон',
      content: ['+39 345 678 9012'],
      link: 'tel:+393456789012',
      isVisible: true,
      order: 2
    },
    {
      id: 'email',
      type: 'email',
      icon: 'Mail',
      title: 'Email',
      content: [
        'info@gardaracing.com',
        'corporate@gardaracing.com'
      ],
      isVisible: true,
      order: 3
    },
    {
      id: 'hours',
      type: 'hours',
      icon: 'Clock',
      title: 'Часы работы',
      content: [
        'Ежедневно: 8:00 - 19:00',
        'Сезон: Март - Октябрь'
      ],
      isVisible: true,
      order: 4
    }
  ]);

  // Contact form state
  const [contactForm, setContactForm] = useState<ContactForm>({
    id: 'main-form',
    title: 'Отправить сообщение',
    description: 'Мы готовы ответить на все ваши вопросы',
    fields: [
      {
        id: 'name',
        type: 'text',
        name: 'name',
        label: 'Имя',
        placeholder: 'Ваше имя',
        required: true
      },
      {
        id: 'email',
        type: 'email',
        name: 'email',
        label: 'Email',
        placeholder: 'your@email.com',
        required: true
      },
      {
        id: 'phone',
        type: 'tel',
        name: 'phone',
        label: 'Телефон',
        placeholder: '+7 (999) 123-45-67',
        required: false
      },
      {
        id: 'subject',
        type: 'select',
        name: 'subject',
        label: 'Тема',
        placeholder: 'Выберите тему',
        required: true,
        options: [
          'Бронирование',
          'Корпоративные мероприятия',
          'Общие вопросы',
          'Партнерство',
          'Другое'
        ]
      },
      {
        id: 'message',
        type: 'textarea',
        name: 'message',
        label: 'Сообщение',
        placeholder: 'Расскажите нам о ваших вопросах...',
        required: true
      }
    ],
    submitText: 'Отправить сообщение',
    successMessage: 'Сообщение отправлено! Мы свяжемся с вами в ближайшее время.',
    isVisible: true
  });

  // FAQ state
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: '1',
      question: 'Как забронировать?',
      answer: 'Вы можете забронировать через наш сайт, позвонить нам или написать на email. Мы подтвердим бронирование в течение 24 часов.',
      category: 'Бронирование',
      isVisible: true,
      order: 1
    },
    {
      id: '2',
      question: 'Какая погода подходит для парусного спорта?',
      answer: 'Мы выходим в море при ветре от 5 до 25 узлов. При неблагоприятных условиях мы предложим перенос или полный возврат средств.',
      category: 'Погода',
      isVisible: true,
      order: 2
    },
    {
      id: '3',
      question: 'Нужен ли опыт парусного спорта?',
      answer: 'Нет, опыт не требуется. Наши профессиональные инструкторы научат вас всему необходимому и обеспечат безопасность на воде.',
      category: 'Обучение',
      isVisible: true,
      order: 3
    },
    {
      id: '4',
      question: 'Что включено в стоимость?',
      answer: 'В стоимость включены: профессиональный шкипер, все оборудование, инструктаж, медаль участника и профессиональные фотографии.',
      category: 'Цены',
      isVisible: true,
      order: 4
    }
  ]);

  // Map settings state
  const [mapSettings, setMapSettings] = useState<MapSettings>({
    latitude: 45.8838,
    longitude: 10.8406,
    zoom: 15,
    style: 'standard',
    showMarker: true,
    markerTitle: 'Garda Racing Yacht Club',
    height: 300
  });

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
    title: 'Свяжитесь с нами - Garda Racing Yacht Club | Lake Garda Sailing',
    description: 'Свяжитесь с Garda Racing Yacht Club. Расположены в Рива-дель-Гарда, Италия. Телефон: +39 345 678 9012. Профессиональные парусные приключения с 2008 года.',
    keywords: 'контакты Garda Racing, Рива-дель-Гарда парусный спорт, контакты яхт-клуба, контакты парусного спорта озера Гарда',
    ogImage: '/IMG_0967.webp',
    canonical: 'https://gardaracing.com/contact'
  });

  // Media library state
  const [mediaLibrary, setMediaLibrary] = useState([
    { id: '1', url: '/IMG_0967.webp', name: 'Hero Image', type: 'image' },
    { id: '2', url: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg', name: 'Contact', type: 'image' },
    { id: '3', url: 'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg', name: 'Office', type: 'image' }
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

  const updateContactInfo = (id: string, updates: Partial<ContactInfo>) => {
    setContactInfo(prev => 
      prev.map(info => 
        info.id === id ? { ...info, ...updates } : info
      )
    );
  };

  const addContactInfo = () => {
    const newInfo: ContactInfo = {
      id: `info-${Date.now()}`,
      type: 'phone',
      icon: 'Phone',
      title: 'Новый контакт',
      content: [''],
      isVisible: true,
      order: contactInfo.length + 1
    };
    setContactInfo(prev => [...prev, newInfo]);
  };

  const deleteContactInfo = (id: string) => {
    if (confirm('Удалить этот контакт?')) {
      setContactInfo(prev => prev.filter(info => info.id !== id));
    }
  };

  const updateFormField = (fieldId: string, updates: Partial<ContactFormField>) => {
    setContactForm(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const addFormField = () => {
    const newField: ContactFormField = {
      id: `field-${Date.now()}`,
      type: 'text',
      name: 'new_field',
      label: 'Новое поле',
      placeholder: 'Введите значение',
      required: false
    };
    setContactForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const deleteFormField = (fieldId: string) => {
    if (confirm('Удалить это поле?')) {
      setContactForm(prev => ({
        ...prev,
        fields: prev.fields.filter(field => field.id !== fieldId)
      }));
    }
  };

  const updateFAQ = (id: string, updates: Partial<FAQ>) => {
    setFaqs(prev => 
      prev.map(faq => 
        faq.id === id ? { ...faq, ...updates } : faq
      )
    );
  };

  const addFAQ = () => {
    const newFAQ: FAQ = {
      id: `faq-${Date.now()}`,
      question: 'Новый вопрос',
      answer: 'Ответ на вопрос',
      category: 'Общие',
      isVisible: true,
      order: faqs.length + 1
    };
    setFaqs(prev => [...prev, newFAQ]);
  };

  const deleteFAQ = (id: string) => {
    if (confirm('Удалить этот FAQ?')) {
      setFaqs(prev => prev.filter(faq => faq.id !== id));
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
    { id: 'contact-info', label: 'Контакты', icon: Phone },
    { id: 'form', label: 'Форма', icon: MessageSquare },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'map', label: 'Карта', icon: MapPin },
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
    { value: 'MapPin', label: 'Адрес', icon: MapPin },
    { value: 'Phone', label: 'Телефон', icon: Phone },
    { value: 'Mail', label: 'Email', icon: Mail },
    { value: 'Clock', label: 'Время', icon: Clock },
    { value: 'Globe', label: 'Сайт', icon: Globe },
    { value: 'MessageSquare', label: 'Чат', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Редактор страницы Contact</h1>
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
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Основной контент</h2>
                  
                  <div className="space-y-8">
                    {/* Hero Section */}
                    <div className="border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Hero секция</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Заголовок
                          </label>
                          <input
                            type="text"
                            defaultValue="Свяжитесь с нами"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Описание
                          </label>
                          <textarea
                            rows={3}
                            defaultValue="Мы готовы ответить на все ваши вопросы и помочь организовать незабываемое парусное приключение на озере Гарда"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Фоновое изображение
                          </label>
                          <input
                            type="text"
                            placeholder="URL изображения или выберите из медиа"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Текст кнопки "Позвонить"
                          </label>
                          <input
                            type="text"
                            defaultValue="Позвонить сейчас"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Текст кнопки "WhatsApp"
                          </label>
                          <input
                            type="text"
                            defaultValue="WhatsApp"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Info Tab */}
              {activeTab === 'contact-info' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Контактная информация</h2>
                    <button
                      onClick={addContactInfo}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Добавить контакт</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {contactInfo.map((info) => (
                      <div key={info.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-semibold text-gray-900">{info.title}</h3>
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={info.isVisible}
                                onChange={(e) => updateContactInfo(info.id, { isVisible: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-600">Видимый</span>
                            </label>
                            <button
                              onClick={() => deleteContactInfo(info.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Заголовок
                            </label>
                            <input
                              type="text"
                              value={info.title}
                              onChange={(e) => updateContactInfo(info.id, { title: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Иконка
                            </label>
                            <select
                              value={info.icon}
                              onChange={(e) => updateContactInfo(info.id, { icon: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {iconOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Содержимое (каждая строка отдельно)
                          </label>
                          <div className="space-y-2">
                            {info.content.map((line, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={line}
                                  onChange={(e) => {
                                    const newContent = [...info.content];
                                    newContent[index] = e.target.value;
                                    updateContactInfo(info.id, { content: newContent });
                                  }}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                  onClick={() => {
                                    const newContent = info.content.filter((_, i) => i !== index);
                                    updateContactInfo(info.id, { content: newContent });
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                const newContent = [...info.content, ''];
                                updateContactInfo(info.id, { content: newContent });
                              }}
                              className="flex items-center space-x-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 w-full"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Добавить строку</span>
                            </button>
                          </div>
                        </div>

                        {(info.type === 'phone' || info.type === 'email') && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ссылка (опционально)
                            </label>
                            <input
                              type="text"
                              value={info.link || ''}
                              onChange={(e) => updateContactInfo(info.id, { link: e.target.value })}
                              placeholder={info.type === 'phone' ? 'tel:+393456789012' : 'mailto:info@example.com'}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Tab */}
              {activeTab === 'form' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Настройки формы</h2>
                  
                  <div className="space-y-8">
                    {/* Form Settings */}
                    <div className="border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Основные настройки</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Заголовок формы
                          </label>
                          <input
                            type="text"
                            value={contactForm.title}
                            onChange={(e) => setContactForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Текст кнопки
                          </label>
                          <input
                            type="text"
                            value={contactForm.submitText}
                            onChange={(e) => setContactForm(prev => ({ ...prev, submitText: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Описание
                        </label>
                        <textarea
                          value={contactForm.description}
                          onChange={(e) => setContactForm(prev => ({ ...prev, description: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Сообщение об успехе
                        </label>
                        <textarea
                          value={contactForm.successMessage}
                          onChange={(e) => setContactForm(prev => ({ ...prev, successMessage: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="border border-gray-200 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Поля формы</h3>
                        <button
                          onClick={addFormField}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Добавить поле</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {contactForm.fields.map((field) => (
                          <div key={field.id} className="border border-gray-100 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-medium text-gray-900">{field.label}</h4>
                              <button
                                onClick={() => deleteFormField(field.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Тип поля
                                </label>
                                <select
                                  value={field.type}
                                  onChange={(e) => updateFormField(field.id, { type: e.target.value as any })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="text">Текст</option>
                                  <option value="email">Email</option>
                                  <option value="tel">Телефон</option>
                                  <option value="textarea">Многострочный текст</option>
                                  <option value="select">Выпадающий список</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Название поля
                                </label>
                                <input
                                  type="text"
                                  value={field.name}
                                  onChange={(e) => updateFormField(field.id, { name: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Метка
                                </label>
                                <input
                                  type="text"
                                  value={field.label}
                                  onChange={(e) => updateFormField(field.id, { label: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Placeholder
                                </label>
                                <input
                                  type="text"
                                  value={field.placeholder}
                                  onChange={(e) => updateFormField(field.id, { placeholder: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div className="flex items-center space-x-4 pt-6">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => updateFormField(field.id, { required: e.target.checked })}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">Обязательное</span>
                                </label>
                              </div>
                            </div>

                            {field.type === 'select' && (
                              <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Варианты (каждый с новой строки)
                                </label>
                                <textarea
                                  value={field.options?.join('\n') || ''}
                                  onChange={(e) => updateFormField(field.id, { 
                                    options: e.target.value.split('\n').filter(opt => opt.trim()) 
                                  })}
                                  rows={4}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Вариант 1&#10;Вариант 2&#10;Вариант 3"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* FAQ Tab */}
              {activeTab === 'faq' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Часто задаваемые вопросы</h2>
                    <button
                      onClick={addFAQ}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Добавить FAQ</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {faqs.map((faq) => (
                      <div key={faq.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={faq.isVisible}
                                onChange={(e) => updateFAQ(faq.id, { isVisible: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-600">Видимый</span>
                            </label>
                            <button
                              onClick={() => deleteFAQ(faq.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Вопрос
                            </label>
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => updateFAQ(faq.id, { question: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Категория
                            </label>
                            <input
                              type="text"
                              value={faq.category}
                              onChange={(e) => updateFAQ(faq.id, { category: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ответ
                          </label>
                          <textarea
                            value={faq.answer}
                            onChange={(e) => updateFAQ(faq.id, { answer: e.target.value })}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map Tab */}
              {activeTab === 'map' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Настройки карты</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Широта
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          value={mapSettings.latitude}
                          onChange={(e) => setMapSettings(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Долгота
                        </label>
                        <input
                          type="number"
                          step="0.000001"
                          value={mapSettings.longitude}
                          onChange={(e) => setMapSettings(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Масштаб
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={mapSettings.zoom}
                          onChange={(e) => setMapSettings(prev => ({ ...prev, zoom: parseInt(e.target.value) }))}
                          className="w-full"
                        />
                        <span className="text-sm text-gray-600">{mapSettings.zoom}</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Стиль карты
                        </label>
                        <select
                          value={mapSettings.style}
                          onChange={(e) => setMapSettings(prev => ({ ...prev, style: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="standard">Стандартная</option>
                          <option value="satellite">Спутник</option>
                          <option value="terrain">Рельеф</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Высота карты (px)
                        </label>
                        <input
                          type="number"
                          value={mapSettings.height}
                          onChange={(e) => setMapSettings(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={mapSettings.showMarker}
                          onChange={(e) => setMapSettings(prev => ({ ...prev, showMarker: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Показать маркер</span>
                      </label>
                    </div>

                    {mapSettings.showMarker && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Название маркера
                        </label>
                        <input
                          type="text"
                          value={mapSettings.markerTitle}
                          onChange={(e) => setMapSettings(prev => ({ ...prev, markerTitle: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    {/* Map Preview */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Превью карты</h3>
                      <div 
                        className="bg-gray-200 rounded-lg flex items-center justify-center"
                        style={{ height: `${mapSettings.height}px` }}
                      >
                        <div className="text-center text-gray-600">
                          <MapPin className="h-8 w-8 mx-auto mb-2" />
                          <p>Интерактивная карта</p>
                          <p className="text-sm">
                            {mapSettings.latitude.toFixed(6)}, {mapSettings.longitude.toFixed(6)}
                          </p>
                        </div>
                      </div>
                    </div>
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
                            Стиль форм
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="rounded">Скругленные</option>
                            <option value="square">Квадратные</option>
                            <option value="modern">Современные</option>
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
                        placeholder="https://gardaracing.com/contact"
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
                        onClick={() => window.open('/contact', '_blank')}
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
                          Свяжитесь с нами
                        </h1>
                        <p className="text-xl text-gray-600">
                          Мы готовы ответить на все ваши вопросы
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Contact Info Preview */}
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-6">Контактная информация</h2>
                          <div className="space-y-6">
                            {contactInfo.filter(info => info.isVisible).map((info) => (
                              <div key={info.id} className="flex items-start space-x-4">
                                <div className="bg-primary-100 p-3 rounded-lg">
                                  <MapPin className="h-6 w-6 text-primary-600" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                                  {info.content.map((line, index) => (
                                    <p key={index} className="text-gray-600">{line}</p>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Form Preview */}
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-6">{contactForm.title}</h2>
                          <p className="text-gray-600 mb-6">{contactForm.description}</p>
                          <div className="space-y-4">
                            {contactForm.fields.slice(0, 3).map((field) => (
                              <div key={field.id}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {field.label} {field.required && '*'}
                                </label>
                                {field.type === 'textarea' ? (
                                  <textarea
                                    placeholder={field.placeholder}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    disabled
                                  />
                                ) : field.type === 'select' ? (
                                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled>
                                    <option>{field.placeholder}</option>
                                  </select>
                                ) : (
                                  <input
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    disabled
                                  />
                                )}
                              </div>
                            ))}
                            <button 
                              className="w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-300"
                              style={{ backgroundColor: colorScheme.button, color: 'white' }}
                              disabled
                            >
                              {contactForm.submitText}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* FAQ Preview */}
                      <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Часто задаваемые вопросы</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {faqs.filter(faq => faq.isVisible).slice(0, 4).map((faq) => (
                            <div key={faq.id} className="bg-gray-50 p-6 rounded-xl">
                              <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                              <p className="text-gray-600 text-sm">{faq.answer.substring(0, 100)}...</p>
                            </div>
                          ))}
                        </div>
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

export default ContactContentEditor;