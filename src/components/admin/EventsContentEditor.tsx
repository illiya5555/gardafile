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
  Play,
  MapPin,
  Wind,
  Anchor,
  Music,
  Video,
  FileText,
  Globe
} from 'lucide-react';

interface EventContentBlock {
  id: string;
  type: 'hero' | 'overview' | 'schedule' | 'gallery' | 'weather' | 'equipment' | 'faq' | 'cta';
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
  schedule?: ScheduleItem[];
  faqItems?: FAQItem[];
  galleryImages?: GalleryImage[];
  weatherData?: WeatherCondition[];
  equipmentList?: string[];
  isVisible: boolean;
  order: number;
}

interface ScheduleItem {
  id: string;
  time: string;
  activity: string;
  description: string;
  duration?: string;
  location?: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  alt: string;
}

interface WeatherCondition {
  id: string;
  condition: string;
  value: string;
  icon: string;
  description?: string;
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

const EventsContentEditor = () => {
  const [activeTab, setActiveTab] = useState('content');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isDraft, setIsDraft] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Content blocks state
  const [contentBlocks, setContentBlocks] = useState<EventContentBlock[]>([
    {
      id: 'hero',
      type: 'hero',
      title: 'The Complete Racing Experience',
      subtitle: 'From beginner to champion in one day',
      content: 'Experience authentic yacht racing on Lake Garda with professional instruction, competitive races, and official recognition of your achievement.',
      image: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg',
      backgroundColor: 'linear-gradient(to bottom right, rgba(30, 58, 138, 0.7), rgba(185, 28, 28, 0.5))',
      textColor: '#ffffff',
      buttonText: 'Book Your Experience - €199',
      buttonAction: '/booking',
      buttonStyle: 'primary',
      price: {
        current: 199,
        currency: '€'
      },
      features: [
        '8.5 hours full experience',
        '6-8 people per yacht',
        'Medal and certificate included',
        'Professional photography'
      ],
      isVisible: true,
      order: 1
    },
    {
      id: 'overview',
      type: 'overview',
      title: 'What Makes Our Experience Special',
      subtitle: 'Professional instruction, authentic racing, and unforgettable memories',
      content: 'Our yacht racing experience combines professional sailing instruction with authentic competitive racing on the beautiful waters of Lake Garda.',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      features: [
        'Professional certified instructors',
        'Authentic yacht racing format',
        'High-quality photo and video documentation',
        'Official medals and certificates'
      ],
      isVisible: true,
      order: 2
    },
    {
      id: 'schedule',
      type: 'schedule',
      title: 'Daily Schedule',
      subtitle: 'Your complete racing day timeline',
      content: 'A carefully planned day that takes you from sailing basics to competitive racing.',
      backgroundColor: '#f9fafb',
      textColor: '#1f2937',
      schedule: [
        {
          id: '1',
          time: '08:30',
          activity: 'Welcome & Registration',
          description: 'Meet your skipper and fellow sailors',
          duration: '30 min',
          location: 'Marina Office'
        },
        {
          id: '2',
          time: '09:00',
          activity: 'Safety Briefing',
          description: 'Essential safety procedures and equipment overview',
          duration: '30 min',
          location: 'Yacht'
        },
        {
          id: '3',
          time: '09:30',
          activity: 'Sailing Basics',
          description: 'Learn fundamental sailing techniques',
          duration: '60 min',
          location: 'Lake Garda'
        },
        {
          id: '4',
          time: '10:30',
          activity: 'First Race',
          description: 'Practice race to get comfortable',
          duration: '90 min',
          location: 'Racing Area'
        },
        {
          id: '5',
          time: '12:00',
          activity: 'Lunch Break',
          description: 'Enjoy local cuisine at the marina',
          duration: '90 min',
          location: 'Marina Restaurant'
        },
        {
          id: '6',
          time: '13:30',
          activity: 'Championship Race',
          description: 'The main racing event',
          duration: '120 min',
          location: 'Racing Area'
        },
        {
          id: '7',
          time: '15:30',
          activity: 'Final Race',
          description: 'Last chance to improve your position',
          duration: '60 min',
          location: 'Racing Area'
        },
        {
          id: '8',
          time: '16:30',
          activity: 'Medal Ceremony',
          description: 'Awards and certificate presentation',
          duration: '30 min',
          location: 'Marina'
        },
        {
          id: '9',
          time: '17:00',
          activity: 'Photo Session',
          description: 'Professional photos with your medals',
          duration: '30 min',
          location: 'Marina'
        }
      ],
      isVisible: true,
      order: 3
    },
    {
      id: 'gallery',
      type: 'gallery',
      title: 'Experience Gallery',
      subtitle: 'See the magic of Lake Garda racing',
      content: 'Professional photos and videos from our racing experiences.',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      galleryImages: [
        {
          id: '1',
          url: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg',
          caption: 'Racing on Lake Garda',
          alt: 'Yacht racing on beautiful Lake Garda'
        },
        {
          id: '2',
          url: 'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg',
          caption: 'Riva del Garda Harbor',
          alt: 'Beautiful harbor in Riva del Garda'
        },
        {
          id: '3',
          url: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg',
          caption: 'Professional Instruction',
          alt: 'Professional sailing instruction'
        },
        {
          id: '4',
          url: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg',
          caption: 'Medal Ceremony',
          alt: 'Medal ceremony for racing participants'
        }
      ],
      isVisible: true,
      order: 4
    },
    {
      id: 'weather',
      type: 'weather',
      title: 'Weather Conditions',
      subtitle: 'Perfect sailing conditions on Lake Garda',
      content: 'Lake Garda offers ideal sailing conditions with consistent winds and protected waters.',
      backgroundColor: '#f3f4f6',
      textColor: '#1f2937',
      weatherData: [
        {
          id: '1',
          condition: 'Wind Speed',
          value: '8-15 knots',
          icon: 'wind',
          description: 'Consistent thermal winds'
        },
        {
          id: '2',
          condition: 'Temperature',
          value: '18-28°C',
          icon: 'clock',
          description: 'Comfortable sailing weather'
        },
        {
          id: '3',
          condition: 'Visibility',
          value: 'Excellent',
          icon: 'star',
          description: 'Clear mountain views'
        },
        {
          id: '4',
          condition: 'Water Temp',
          value: '16-24°C',
          icon: 'anchor',
          description: 'Pleasant water temperature'
        }
      ],
      isVisible: true,
      order: 5
    },
    {
      id: 'equipment',
      type: 'equipment',
      title: 'Equipment Provided',
      subtitle: 'Professional sailing equipment included',
      content: 'We provide all necessary equipment for a safe and enjoyable sailing experience.',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      equipmentList: [
        'Professional racing yacht (Bavaria 34 or similar)',
        'All safety equipment (life jackets, harnesses)',
        'Professional sailing gear',
        'Racing flags and timing equipment',
        'First aid kit and emergency equipment',
        'Waterproof bags for personal items'
      ],
      isVisible: true,
      order: 6
    },
    {
      id: 'faq',
      type: 'faq',
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know',
      content: 'Common questions about our yacht racing experience.',
      backgroundColor: '#f9fafb',
      textColor: '#1f2937',
      faqItems: [
        {
          id: '1',
          question: 'Do I need sailing experience?',
          answer: 'No sailing experience is required! Our professional skippers will teach you everything you need to know.',
          category: 'Experience'
        },
        {
          id: '2',
          question: 'What should I bring?',
          answer: 'Bring comfortable clothes, sunscreen, a hat, and a change of clothes. We provide all sailing equipment.',
          category: 'Preparation'
        },
        {
          id: '3',
          question: 'What if the weather is bad?',
          answer: 'Safety is our priority. If conditions are unsafe, we\'ll reschedule at no extra cost.',
          category: 'Weather'
        },
        {
          id: '4',
          question: 'How many people per boat?',
          answer: 'Each yacht accommodates 6-8 participants plus the professional skipper.',
          category: 'Group Size'
        }
      ],
      isVisible: true,
      order: 7
    },
    {
      id: 'cta',
      type: 'cta',
      title: 'Ready to Start Racing?',
      subtitle: 'Book your yacht racing experience today',
      content: 'Create memories that will last a lifetime with our professional yacht racing experience.',
      backgroundColor: '#dc2626',
      textColor: '#ffffff',
      buttonText: 'Book Now - €199 per person',
      buttonAction: '/booking',
      buttonStyle: 'secondary',
      isVisible: true,
      order: 8
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
    title: 'Yacht Racing Events - Complete Day Program | Garda Racing',
    description: 'Discover our complete yacht racing program on Lake Garda. Professional instruction, authentic racing, medal ceremony, and professional photos included.',
    keywords: 'yacht racing program, sailing lessons Lake Garda, racing events, sailing instruction',
    ogImage: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg',
    canonical: 'https://gardaracing.com/events'
  });

  // Media library state
  const [mediaLibrary, setMediaLibrary] = useState([
    { id: '1', url: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg', name: 'Racing Action', type: 'image' },
    { id: '2', url: 'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg', name: 'Harbor View', type: 'image' },
    { id: '3', url: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg', name: 'Instruction', type: 'image' },
    { id: '4', url: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg', name: 'Medal Ceremony', type: 'image' }
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

  const updateContentBlock = (id: string, updates: Partial<EventContentBlock>) => {
    setContentBlocks(prev => 
      prev.map(block => 
        block.id === id ? { ...block, ...updates } : block
      )
    );
  };

  const addContentBlock = (type: EventContentBlock['type']) => {
    const newBlock: EventContentBlock = {
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
      const newMedia = {
        id: Date.now().toString(),
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'video'
      };
      setMediaLibrary(prev => [...prev, newMedia]);
    }
  };

  // Schedule management functions
  const addScheduleItem = (blockId: string) => {
    const newItem: ScheduleItem = {
      id: Date.now().toString(),
      time: '09:00',
      activity: 'Новое мероприятие',
      description: 'Описание мероприятия',
      duration: '30 min',
      location: 'Место проведения'
    };
    
    updateContentBlock(blockId, {
      schedule: [...(contentBlocks.find(b => b.id === blockId)?.schedule || []), newItem]
    });
  };

  const updateScheduleItem = (blockId: string, itemId: string, updates: Partial<ScheduleItem>) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block?.schedule) {
      const updatedSchedule = block.schedule.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      );
      updateContentBlock(blockId, { schedule: updatedSchedule });
    }
  };

  const deleteScheduleItem = (blockId: string, itemId: string) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block?.schedule) {
      const updatedSchedule = block.schedule.filter(item => item.id !== itemId);
      updateContentBlock(blockId, { schedule: updatedSchedule });
    }
  };

  // FAQ management functions
  const addFAQItem = (blockId: string) => {
    const newItem: FAQItem = {
      id: Date.now().toString(),
      question: 'Новый вопрос?',
      answer: 'Ответ на вопрос',
      category: 'Общие'
    };
    
    updateContentBlock(blockId, {
      faqItems: [...(contentBlocks.find(b => b.id === blockId)?.faqItems || []), newItem]
    });
  };

  const updateFAQItem = (blockId: string, itemId: string, updates: Partial<FAQItem>) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block?.faqItems) {
      const updatedFAQ = block.faqItems.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      );
      updateContentBlock(blockId, { faqItems: updatedFAQ });
    }
  };

  const deleteFAQItem = (blockId: string, itemId: string) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block?.faqItems) {
      const updatedFAQ = block.faqItems.filter(item => item.id !== itemId);
      updateContentBlock(blockId, { faqItems: updatedFAQ });
    }
  };

  // Gallery management functions
  const addGalleryImage = (blockId: string) => {
    const newImage: GalleryImage = {
      id: Date.now().toString(),
      url: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg',
      caption: 'Новое изображение',
      alt: 'Описание изображения'
    };
    
    updateContentBlock(blockId, {
      galleryImages: [...(contentBlocks.find(b => b.id === blockId)?.galleryImages || []), newImage]
    });
  };

  const updateGalleryImage = (blockId: string, imageId: string, updates: Partial<GalleryImage>) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block?.galleryImages) {
      const updatedGallery = block.galleryImages.map(image =>
        image.id === imageId ? { ...image, ...updates } : image
      );
      updateContentBlock(blockId, { galleryImages: updatedGallery });
    }
  };

  const deleteGalleryImage = (blockId: string, imageId: string) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block?.galleryImages) {
      const updatedGallery = block.galleryImages.filter(image => image.id !== imageId);
      updateContentBlock(blockId, { galleryImages: updatedGallery });
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
              <h1 className="text-2xl font-bold text-gray-900">Редактор страницы Events</h1>
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
                        onChange={(e) => addContentBlock(e.target.value as EventContentBlock['type'])}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue=""
                      >
                        <option value="" disabled>Добавить блок</option>
                        <option value="hero">Главный баннер</option>
                        <option value="overview">Обзор</option>
                        <option value="schedule">Расписание</option>
                        <option value="gallery">Галерея</option>
                        <option value="weather">Погода</option>
                        <option value="equipment">Оборудование</option>
                        <option value="faq">FAQ</option>
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

                        {/* Basic Content Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                        <div className="mb-4">
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

                        {/* Schedule Block */}
                        {block.type === 'schedule' && (
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-4">
                              <label className="block text-sm font-medium text-gray-700">
                                Расписание мероприятий
                              </label>
                              <button
                                onClick={() => addScheduleItem(block.id)}
                                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                              >
                                <Plus className="h-4 w-4" />
                                <span>Добавить</span>
                              </button>
                            </div>
                            <div className="space-y-4">
                              {block.schedule?.map((item) => (
                                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Время</label>
                                      <input
                                        type="time"
                                        value={item.time}
                                        onChange={(e) => updateScheduleItem(block.id, item.id, { time: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Мероприятие</label>
                                      <input
                                        type="text"
                                        value={item.activity}
                                        onChange={(e) => updateScheduleItem(block.id, item.id, { activity: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Длительность</label>
                                      <input
                                        type="text"
                                        value={item.duration || ''}
                                        onChange={(e) => updateScheduleItem(block.id, item.id, { duration: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="30 min"
                                      />
                                    </div>
                                    <div className="flex items-end">
                                      <button
                                        onClick={() => deleteScheduleItem(block.id, item.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Описание</label>
                                    <textarea
                                      value={item.description}
                                      onChange={(e) => updateScheduleItem(block.id, item.id, { description: e.target.value })}
                                      rows={2}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* FAQ Block */}
                        {block.type === 'faq' && (
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-4">
                              <label className="block text-sm font-medium text-gray-700">
                                Вопросы и ответы
                              </label>
                              <button
                                onClick={() => addFAQItem(block.id)}
                                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                              >
                                <Plus className="h-4 w-4" />
                                <span>Добавить</span>
                              </button>
                            </div>
                            <div className="space-y-4">
                              {block.faqItems?.map((item) => (
                                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 mr-4">
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Вопрос</label>
                                      <input
                                        type="text"
                                        value={item.question}
                                        onChange={(e) => updateFAQItem(block.id, item.id, { question: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>
                                    <button
                                      onClick={() => deleteFAQItem(block.id, item.id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Ответ</label>
                                    <textarea
                                      value={item.answer}
                                      onChange={(e) => updateFAQItem(block.id, item.id, { answer: e.target.value })}
                                      rows={3}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Gallery Block */}
                        {block.type === 'gallery' && (
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-4">
                              <label className="block text-sm font-medium text-gray-700">
                                Галерея изображений
                              </label>
                              <button
                                onClick={() => addGalleryImage(block.id)}
                                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                              >
                                <Plus className="h-4 w-4" />
                                <span>Добавить</span>
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {block.galleryImages?.map((image) => (
                                <div key={image.id} className="border border-gray-200 rounded-lg p-4">
                                  <div className="mb-2">
                                    <img
                                      src={image.url}
                                      alt={image.alt}
                                      className="w-full h-32 object-cover rounded-lg"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">URL изображения</label>
                                      <input
                                        type="url"
                                        value={image.url}
                                        onChange={(e) => updateGalleryImage(block.id, image.id, { url: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">Подпись</label>
                                      <input
                                        type="text"
                                        value={image.caption}
                                        onChange={(e) => updateGalleryImage(block.id, image.id, { caption: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      />
                                    </div>
                                    <div className="flex justify-end">
                                      <button
                                        onClick={() => deleteGalleryImage(block.id, image.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Equipment List */}
                        {block.type === 'equipment' && block.equipmentList && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Список оборудования
                            </label>
                            <div className="space-y-2">
                              {block.equipmentList.map((item, itemIndex) => (
                                <div key={itemIndex} className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => {
                                      const newList = [...block.equipmentList!];
                                      newList[itemIndex] = e.target.value;
                                      updateContentBlock(block.id, { equipmentList: newList });
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                  <button
                                    onClick={() => {
                                      const newList = block.equipmentList!.filter((_, i) => i !== itemIndex);
                                      updateContentBlock(block.id, { equipmentList: newList });
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const newList = [...block.equipmentList!, 'Новый элемент оборудования'];
                                  updateContentBlock(block.id, { equipmentList: newList });
                                }}
                                className="flex items-center space-x-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 w-full"
                              >
                                <Plus className="h-4 w-4" />
                                <span>Добавить элемент</span>
                              </button>
                            </div>
                          </div>
                        )}

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
                            <Video className="h-8 w-8 text-gray-400" />
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
                        placeholder="https://gardaracing.com/events"
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
                        onClick={() => window.open('/events', '_blank')}
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

export default EventsContentEditor;