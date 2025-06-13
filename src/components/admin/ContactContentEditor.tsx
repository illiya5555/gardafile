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
  Send,
  ExternalLink
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

interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
  placeholder: string;
  required: boolean;
  options?: string[];
  isVisible: boolean;
  order: number;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isVisible: boolean;
  order: number;
}

interface ContentBlock {
  id: string;
  type: 'hero' | 'contact-info' | 'contact-form' | 'map' | 'faq' | 'quick-contact' | 'cta';
  title: string;
  subtitle?: string;
  content: string;
  image?: string;
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

const ContactContentEditor = () => {
  const [activeTab, setActiveTab] = useState('content');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isDraft, setIsDraft] = useState(true);
  const [loading, setLoading] = useState(false);

  // Content blocks state
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    {
      id: 'hero',
      type: 'hero',
      title: 'Свяжитесь с нами',
      subtitle: 'Мы готовы ответить на все ваши вопросы',
      content: 'Мы готовы ответить на все ваши вопросы и помочь организовать незабываемое парусное приключение на озере Гарда',
      backgroundColor: 'linear-gradient(to bottom right, rgba(30, 58, 138, 1), rgba(185, 28, 28, 1))',
      textColor: '#ffffff',
      isVisible: true,
      order: 1
    },
    {
      id: 'contact-info',
      type: 'contact-info',
      title: 'Контактная информация',
      content: 'Наши контакты для связи',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      isVisible: true,
      order: 2
    },
    {
      id: 'contact-form',
      type: 'contact-form',
      title: 'Отправить сообщение',
      content: 'Заполните форму и мы свяжемся с вами',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      isVisible: true,
      order: 3
    }
  ]);

  // Contact info state
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([
    {
      id: '1',
      type: 'address',
      icon: 'MapPin',
      title: 'Адрес',
      content: ['Via del Porto 15', '38066 Riva del Garda, TN', 'Italy'],
      isVisible: true,
      order: 1
    },
    {
      id: '2',
      type: 'phone',
      icon: 'Phone',
      title: 'Телефон',
      content: ['+39 345 678 9012'],
      link: 'tel:+393456789012',
      isVisible: true,
      order: 2
    },
    {
      id: '3',
      type: 'email',
      icon: 'Mail',
      title: 'Email',
      content: ['info@gardaracing.com', 'corporate@gardaracing.com'],
      link: 'mailto:info@gardaracing.com',
      isVisible: true,
      order: 3
    },
    {
      id: '4',
      type: 'hours',
      icon: 'Clock',
      title: 'Часы работы',
      content: ['Ежедневно: 8:00 - 19:00', 'Сезон: Март - Октябрь'],
      isVisible: true,
      order: 4
    }
  ]);

  // Form fields state
  const [formFields, setFormFields] = useState<FormField[]>([
    {
      id: '1',
      name: 'name',
      label: 'Имя',
      type: 'text',
      placeholder: 'Ваше имя',
      required: true,
      isVisible: true,
      order: 1
    },
    {
      id: '2',
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'your@email.com',
      required: true,
      isVisible: true,
      order: 2
    },
    {
      id: '3',
      name: 'phone',
      label: 'Телефон',
      type: 'tel',
      placeholder: '+7 (999) 123-45-67',
      required: false,
      isVisible: true,
      order: 3
    },
    {
      id: '4',
      name: 'subject',
      label: 'Тема',
      type: 'select',
      placeholder: 'Выберите тему',
      required: true,
      options: ['Бронирование', 'Корпоративные мероприятия', 'Общие вопросы', 'Партнерство', 'Другое'],
      isVisible: true,
      order: 4
    },
    {
      id: '5',
      name: 'message',
      label: 'Сообщение',
      type: 'textarea',
      placeholder: 'Расскажите нам о ваших вопросах или пожеланиях...',
      required: true,
      isVisible: true,
      order: 5
    }
  ]);

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
      category: 'Опыт',
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
    title: 'Contact Us - Garda Racing Yacht Club | Lake Garda Sailing',
    description: 'Get in touch with Garda Racing Yacht Club. Located in Riva del Garda, Italy. Phone: +39 345 678 9012. Professional sailing experiences since 2008.',
    keywords: 'contact Garda Racing, Riva del Garda sailing, yacht club contact, Lake Garda sailing contact',
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

  const addContactInfo = () => {
    const newInfo: ContactInfo = {
      id: Date.now().toString(),
      type: 'phone',
      icon: 'Phone',
      title: 'Новый контакт',
      content: ['Информация'],
      isVisible: true,
      order: contactInfo.length + 1
    };
    setContactInfo(prev => [...prev, newInfo]);
  };

  const updateContactInfo = (id: string, updates: Partial<ContactInfo>) => {
    setContactInfo(prev => 
      prev.map(info => 
        info.id === id ? { ...info, ...updates } : info
      )
    );
  };

  const deleteContactInfo = (id: string) => {
    if (confirm('Удалить этот контакт?')) {
      setContactInfo(prev => prev.filter(info => info.id !== id));
    }
  };

  const addFormField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      name: 'new_field',
      label: 'Новое поле',
      type: 'text',
      placeholder: 'Введите значение',
      required: false,
      isVisible: true,
      order: formFields.length + 1
    };
    setFormFields(prev => [...prev, newField]);
  };

  const updateFormField = (id: string, updates: Partial<FormField>) => {
    setFormFields(prev => 
      prev.map(field => 
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const deleteFormField = (id: string) => {
    if (confirm('Удалить это поле?')) {
      setFormFields(prev => prev.filter(field => field.id !== id));
    }
  };

  const addFAQ = () => {
    const newFAQ: FAQ = {
      id: Date.now().toString(),
      question: 'Новый вопрос?',
      answer: 'Ответ на вопрос',
      category: 'Общие',
      isVisible: true,
      order: faqs.length + 1
    };
    setFaqs(prev => [...prev, newFAQ]);
  };

  const updateFAQ = (id: string, updates: Partial<FAQ>) => {
    setFaqs(prev => 
      prev.map(faq => 
        faq.id === id ? { ...faq, ...updates } : faq
      )
    );
  };

  const deleteFAQ = (id: string) => {
    if (confirm('Удалить этот вопрос?')) {
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
    { id: 'contact-info', label: 'Контакты', icon: MapPin },
    { id: 'form', label: 'Форма', icon: MessageSquare },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
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
    { value: 'Building', label: 'Офис', icon: Building }
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
                        <option value="contact-info">Контактная информация</option>
                        <option value="contact-form">Форма обратной связи</option>
                        <option value="map">Карта</option>
                        <option value="faq">FAQ</option>
                        <option value="quick-contact">Быстрая связь</option>
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
                    {contactInfo.map((info, index) => (
                      <div key={info.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{info.title}</h3>
                              <p className="text-sm text-gray-600 capitalize">{info.type}</p>
                            </div>
                          </div>
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Тип
                            </label>
                            <select
                              value={info.type}
                              onChange={(e) => updateContactInfo(info.id, { type: e.target.value as ContactInfo['type'] })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="address">Адрес</option>
                              <option value="phone">Телефон</option>
                              <option value="email">Email</option>
                              <option value="hours">Часы работы</option>
                              <option value="social">Социальные сети</option>
                            </select>
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
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Содержимое (по одной строке)
                          </label>
                          <div className="space-y-2">
                            {info.content.map((line, lineIndex) => (
                              <div key={lineIndex} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={line}
                                  onChange={(e) => {
                                    const newContent = [...info.content];
                                    newContent[lineIndex] = e.target.value;
                                    updateContactInfo(info.id, { content: newContent });
                                  }}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                  onClick={() => {
                                    const newContent = info.content.filter((_, i) => i !== lineIndex);
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
                                const newContent = [...info.content, 'Новая строка'];
                                updateContactInfo(info.id, { content: newContent });
                              }}
                              className="flex items-center space-x-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 w-full"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Добавить строку</span>
                            </button>
                          </div>
                        </div>

                        {(info.type === 'phone' || info.type === 'email' || info.type === 'social') && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Ссылка (опционально)
                            </label>
                            <input
                              type="text"
                              value={info.link || ''}
                              onChange={(e) => updateContactInfo(info.id, { link: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="tel:+123456789 или mailto:email@example.com"
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
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Поля формы обратной связи</h2>
                    <button
                      onClick={addFormField}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Добавить поле</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {formFields.map((field, index) => (
                      <div key={field.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{field.label}</h3>
                              <p className="text-sm text-gray-600">{field.name} ({field.type})</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={field.isVisible}
                                onChange={(e) => updateFormField(field.id, { isVisible: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-600">Видимое</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateFormField(field.id, { required: e.target.checked })}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                              />
                              <span className="text-sm text-gray-600">Обязательное</span>
                            </label>
                            <button
                              onClick={() => deleteFormField(field.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Подпись
                            </label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => updateFormField(field.id, { label: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Тип поля
                            </label>
                            <select
                              value={field.type}
                              onChange={(e) => updateFormField(field.id, { type: e.target.value as FormField['type'] })}
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Placeholder
                            </label>
                            <input
                              type="text"
                              value={field.placeholder}
                              onChange={(e) => updateFormField(field.id, { placeholder: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        {field.type === 'select' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Варианты выбора (по одному на строку)
                            </label>
                            <div className="space-y-2">
                              {(field.options || []).map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...(field.options || [])];
                                      newOptions[optionIndex] = e.target.value;
                                      updateFormField(field.id, { options: newOptions });
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                  <button
                                    onClick={() => {
                                      const newOptions = (field.options || []).filter((_, i) => i !== optionIndex);
                                      updateFormField(field.id, { options: newOptions });
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const newOptions = [...(field.options || []), 'Новый вариант'];
                                  updateFormField(field.id, { options: newOptions });
                                }}
                                className="flex items-center space-x-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 w-full"
                              >
                                <Plus className="h-4 w-4" />
                                <span>Добавить вариант</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
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
                      <span>Добавить вопрос</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {faqs.map((faq, index) => (
                      <div key={faq.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                              <p className="text-sm text-gray-600">{faq.category}</p>
                            </div>
                          </div>
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
                        <ExternalLink className="h-4 w-4" />
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Contact Info Preview */}
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-6">Контактная информация</h2>
                          <div className="space-y-4">
                            {contactInfo.filter(info => info.isVisible).slice(0, 3).map((info) => (
                              <div key={info.id} className="flex items-start space-x-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                  <MapPin className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{info.title}</h3>
                                  {info.content.map((line, index) => (
                                    <p key={index} className="text-gray-600 text-sm">{line}</p>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Form Preview */}
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-6">Отправить сообщение</h2>
                          <div className="space-y-4">
                            {formFields.filter(field => field.isVisible).slice(0, 3).map((field) => (
                              <div key={field.id}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  {field.label} {field.required && '*'}
                                </label>
                                {field.type === 'textarea' ? (
                                  <textarea
                                    placeholder={field.placeholder}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    rows={3}
                                    disabled
                                  />
                                ) : field.type === 'select' ? (
                                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" disabled>
                                    <option>{field.placeholder}</option>
                                  </select>
                                ) : (
                                  <input
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    disabled
                                  />
                                )}
                              </div>
                            ))}
                            <button 
                              className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold"
                              style={{ backgroundColor: colorScheme.button }}
                              disabled
                            >
                              Отправить сообщение
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* FAQ Preview */}
                      {faqs.filter(faq => faq.isVisible).length > 0 && (
                        <div className="mt-12">
                          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Часто задаваемые вопросы</h2>
                          <div className="space-y-4">
                            {faqs.filter(faq => faq.isVisible).slice(0, 2).map((faq) => (
                              <div key={faq.id} className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                                <p className="text-gray-600 text-sm">{faq.answer}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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