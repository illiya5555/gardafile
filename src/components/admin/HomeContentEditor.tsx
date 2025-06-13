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
  Copy
} from 'lucide-react';

interface ContentBlock {
  id: string;
  type: 'hero' | 'features' | 'experience' | 'testimonials' | 'location' | 'partners' | 'cta';
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
  price?: {
    current: number;
    old?: number;
    currency: string;
  };
  features?: string[];
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

const HomeContentEditor = () => {
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
      title: 'Experience the Thrill of Yacht Racing',
      subtitle: 'Daily yacht racing experiences in world-famous Lake Garda',
      content: 'Daily yacht racing experiences in world-famous Lake Garda with professional skippers, racing medals, and unforgettable memories',
      image: '/IMG_0967.webp',
      backgroundColor: 'linear-gradient(to right, rgba(30, 58, 138, 0.7), rgba(30, 64, 175, 0.5), transparent)',
      textColor: '#ffffff',
      buttonText: 'Book Your Adventure',
      buttonAction: '/booking',
      buttonStyle: 'primary',
      price: {
        current: 199,
        currency: '€'
      },
      features: [
        'Professional skipper included',
        'Racing medal & certificate',
        'Professional photos & videos',
        'All equipment provided'
      ],
      isVisible: true,
      order: 1
    },
    {
      id: 'features',
      type: 'features',
      title: 'Why Choose Garda Racing?',
      subtitle: 'We provide the complete yacht racing experience',
      content: 'Professional guidance, premium equipment, and memories that last a lifetime.',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
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
    title: 'Garda Racing Yacht Club - Premium Sailing Experiences on Lake Garda',
    description: 'Daily yacht racing experiences in world-famous Lake Garda. Professional skipper, racing medals, and unforgettable memories. Book your €199 sailing adventure today!',
    keywords: 'Lake Garda sailing, yacht racing, Riva del Garda, sailing experience, yacht charter, racing course',
    ogImage: '/IMG_0967.webp',
    canonical: 'https://gardaracing.com/'
  });

  // Media library state
  const [mediaLibrary, setMediaLibrary] = useState([
    { id: '1', url: '/IMG_0967.webp', name: 'Hero Image', type: 'image' },
    { id: '2', url: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg', name: 'Racing', type: 'image' },
    { id: '3', url: 'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg', name: 'Harbor', type: 'image' }
  ]);

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      // Simulate saving to database
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
      // Simulate publishing
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

  const uploadMedia = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file upload
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Редактор главной страницы</h1>
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
                        <option value="features">Преимущества</option>
                        <option value="experience">Опыт</option>
                        <option value="testimonials">Отзывы</option>
                        <option value="location">Локация</option>
                        <option value="partners">Партнеры</option>
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
                                placeholder="/booking или https://..."
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

                        {/* Price Settings */}
                        {block.price && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Текущая цена
                              </label>
                              <input
                                type="number"
                                value={block.price.current}
                                onChange={(e) => updateContentBlock(block.id, { 
                                  price: { ...block.price, current: parseFloat(e.target.value) }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Старая цена (опционально)
                              </label>
                              <input
                                type="number"
                                value={block.price.old || ''}
                                onChange={(e) => updateContentBlock(block.id, { 
                                  price: { ...block.price, old: e.target.value ? parseFloat(e.target.value) : undefined }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Валюта
                              </label>
                              <select
                                value={block.price.currency}
                                onChange={(e) => updateContentBlock(block.id, { 
                                  price: { ...block.price, currency: e.target.value }
                                })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="€">EUR (€)</option>
                                <option value="$">USD ($)</option>
                                <option value="₽">RUB (₽)</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Features List */}
                        {block.features && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Список преимуществ
                            </label>
                            <div className="space-y-2">
                              {block.features.map((feature, featureIndex) => (
                                <div key={featureIndex} className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={feature}
                                    onChange={(e) => {
                                      const newFeatures = [...block.features!];
                                      newFeatures[featureIndex] = e.target.value;
                                      updateContentBlock(block.id, { features: newFeatures });
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                  <button
                                    onClick={() => {
                                      const newFeatures = block.features!.filter((_, i) => i !== featureIndex);
                                      updateContentBlock(block.id, { features: newFeatures });
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const newFeatures = [...block.features!, 'Новое преимущество'];
                                  updateContentBlock(block.id, { features: newFeatures });
                                }}
                                className="flex items-center space-x-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 w-full"
                              >
                                <Plus className="h-4 w-4" />
                                <span>Добавить преимущество</span>
                              </button>
                            </div>
                          </div>
                        )}
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
                            Стиль кнопок
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="rounded">Скругленные</option>
                            <option value="square">Квадратные</option>
                            <option value="pill">Капсула</option>
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
                        placeholder="https://gardaracing.com/"
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
                        onClick={() => window.open('/', '_blank')}
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
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
                          {contentBlocks.find(b => b.type === 'hero')?.title}
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                          {contentBlocks.find(b => b.type === 'hero')?.content}
                        </p>
                        <div className="space-y-4">
                          {contentBlocks.find(b => b.type === 'hero')?.features?.map((feature, index) => (
                            <div key={index} className="flex items-center justify-center space-x-2">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                        <button 
                          className="mt-8 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-300"
                          style={{ backgroundColor: colorScheme.button }}
                        >
                          {contentBlocks.find(b => b.type === 'hero')?.buttonText}
                        </button>
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

export default HomeContentEditor;