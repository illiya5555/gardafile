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
  Video,
  Globe,
  Search,
  Layers,
  MousePointer,
  Zap,
  Layout,
  PaintBucket,
  FileText,
  Hash,
  ExternalLink,
  Anchor,
  RotateCcw
} from 'lucide-react';

interface ContentBlock {
  id: string;
  type: 'hero' | 'steps' | 'calendar' | 'summary' | 'features' | 'testimonials' | 'cta';
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
  customCSS?: string;
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
  success: string;
  warning: string;
  error: string;
}

interface SEOSettings {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  canonical: string;
  altTags: { [key: string]: string };
}

interface ScheduleItem {
  time: string;
  title: string;
  description: string;
  icon?: string;
}

interface MediaItem {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video';
  alt?: string;
  size?: number;
}

const BookingContentEditor = () => {
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
      title: 'Book a Yacht',
      subtitle: 'Choose a date, time, and yacht for an unforgettable sailing adventure on Lake Garda',
      content: 'Experience the thrill of sailing on one of the world\'s most beautiful lakes with our professional crew and premium yachts.',
      image: '/IMG_0967.webp',
      backgroundColor: 'linear-gradient(to bottom right, rgba(59, 130, 246, 0.9), rgba(147, 197, 253, 0.8))',
      textColor: '#ffffff',
      buttonText: 'Start Booking',
      buttonAction: '#booking-form',
      buttonStyle: 'primary',
      isVisible: true,
      order: 1
    },
    {
      id: 'steps',
      type: 'steps',
      title: 'Simple Booking Process',
      subtitle: 'Book your yacht in just 4 easy steps',
      content: 'Our streamlined booking process makes it easy to reserve your perfect sailing experience.',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      isVisible: true,
      order: 2
    },
    {
      id: 'calendar',
      type: 'calendar',
      title: 'Select Your Date & Time',
      subtitle: 'Choose from available dates and time slots',
      content: 'Pick the perfect date and time for your sailing adventure. All times include professional skipper and equipment.',
      backgroundColor: '#f9fafb',
      textColor: '#1f2937',
      isVisible: true,
      order: 3
    },
    {
      id: 'summary',
      type: 'summary',
      title: 'Booking Summary',
      subtitle: 'Review your selection',
      content: 'Double-check your booking details before proceeding to payment.',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      price: {
        current: 199,
        currency: '€'
      },
      features: [
        'Professional skipper included',
        'All safety equipment',
        'Instruction and training',
        'Adventure photography',
        'Free cancellation 48 hours prior',
        'Full insurance included'
      ],
      isVisible: true,
      order: 4
    }
  ]);

  // Color scheme state
  const [colorScheme, setColorScheme] = useState<ColorScheme>({
    primary: '#2563eb',
    secondary: '#dc2626',
    accent: '#f59e0b',
    text: '#1f2937',
    background: '#ffffff',
    button: '#2563eb',
    buttonHover: '#1d4ed8',
    link: '#2563eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  });

  // SEO settings state
  const [seoSettings, setSeoSettings] = useState<SEOSettings>({
    title: 'Book Your Yacht Racing Adventure | Garda Racing Yacht Club',
    description: 'Book your yacht racing experience on Lake Garda. €199 per person includes professional skipper, equipment, racing medal, and photos. Easy online booking.',
    keywords: 'book yacht racing, Lake Garda booking, sailing reservation, yacht charter booking',
    ogImage: '/IMG_0967.webp',
    canonical: 'https://gardaracing.com/booking',
    altTags: {
      'hero-image': 'Lake Garda yacht booking interface',
      'calendar-image': 'Available booking dates and times',
      'yacht-image': 'Premium yacht for booking'
    }
  });

  // Schedule state
  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { time: 'Step 1', title: 'Select Date', description: 'Choose your preferred sailing date', icon: 'Calendar' },
    { time: 'Step 2', title: 'Time and Yacht', description: 'Pick time slot and yacht type', icon: 'Clock' },
    { time: 'Step 3', title: 'Details', description: 'Enter your contact information', icon: 'Users' },
    { time: 'Step 4', title: 'Payment', description: 'Secure payment processing', icon: 'CreditCard' }
  ]);

  // Media library state
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([
    { id: '1', url: '/IMG_0967.webp', name: 'Hero Background', type: 'image', alt: 'Lake Garda sailing' },
    { id: '2', url: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg', name: 'Yacht Racing', type: 'image', alt: 'Yacht racing on Lake Garda' },
    { id: '3', url: 'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg', name: 'Harbor View', type: 'image', alt: 'Riva del Garda harbor' },
    { id: '4', url: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg', name: 'Professional Instruction', type: 'image', alt: 'Sailing instruction' }
  ]);

  // Typography settings
  const [typography, setTypography] = useState({
    primaryFont: 'Inter',
    headingFont: 'Playfair Display',
    fontSize: {
      base: '16px',
      h1: '3rem',
      h2: '2.25rem',
      h3: '1.875rem',
      h4: '1.5rem'
    },
    lineHeight: {
      body: '1.6',
      heading: '1.2'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  });

  // Layout settings
  const [layoutSettings, setLayoutSettings] = useState({
    maxWidth: '1280px',
    padding: 'normal',
    borderRadius: 'rounded',
    shadows: 'medium',
    spacing: 'normal'
  });

  // Button styles
  const [buttonStyles, setButtonStyles] = useState({
    primary: {
      background: colorScheme.button,
      color: '#ffffff',
      border: 'none',
      borderRadius: '0.5rem',
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      hoverBackground: colorScheme.buttonHover,
      hoverTransform: 'scale(1.05)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    secondary: {
      background: 'transparent',
      color: colorScheme.button,
      border: `2px solid ${colorScheme.button}`,
      borderRadius: '0.5rem',
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      hoverBackground: colorScheme.button,
      hoverColor: '#ffffff',
      shadow: 'none'
    },
    outline: {
      background: 'transparent',
      color: colorScheme.text,
      border: `1px solid ${colorScheme.text}`,
      borderRadius: '0.5rem',
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      fontWeight: '500',
      hoverBackground: colorScheme.text,
      hoverColor: '#ffffff',
      shadow: 'none'
    }
  });

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      // Simulate saving to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsDraft(true);
      alert('Draft saved successfully!');
    } catch (error) {
      alert('Error saving draft');
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
      alert('Changes published successfully!');
    } catch (error) {
      alert('Error publishing changes');
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
      title: 'New Block',
      content: 'Block content',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      isVisible: true,
      order: contentBlocks.length + 1
    };
    setContentBlocks(prev => [...prev, newBlock]);
  };

  const deleteContentBlock = (id: string) => {
    if (confirm('Delete this block?')) {
      setContentBlocks(prev => prev.filter(block => block.id !== id));
    }
  };

  const uploadMedia = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newMedia: MediaItem = {
        id: Date.now().toString(),
        url: URL.createObjectURL(file),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        size: file.size
      };
      setMediaLibrary(prev => [...prev, newMedia]);
    }
  };

  const updateColorScheme = (key: keyof ColorScheme, value: string) => {
    setColorScheme(prev => ({ ...prev, [key]: value }));
    
    // Update button styles when colors change
    if (key === 'button' || key === 'buttonHover') {
      setButtonStyles(prev => ({
        ...prev,
        primary: {
          ...prev.primary,
          background: key === 'button' ? value : prev.primary.background,
          hoverBackground: key === 'buttonHover' ? value : prev.primary.hoverBackground
        }
      }));
    }
  };

  const resetToDefaults = () => {
    if (confirm('Reset all settings to defaults? This cannot be undone.')) {
      // Reset all states to default values
      setColorScheme({
        primary: '#2563eb',
        secondary: '#dc2626',
        accent: '#f59e0b',
        text: '#1f2937',
        background: '#ffffff',
        button: '#2563eb',
        buttonHover: '#1d4ed8',
        link: '#2563eb',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      });
      
      setTypography({
        primaryFont: 'Inter',
        headingFont: 'Playfair Display',
        fontSize: {
          base: '16px',
          h1: '3rem',
          h2: '2.25rem',
          h3: '1.875rem',
          h4: '1.5rem'
        },
        lineHeight: {
          body: '1.6',
          heading: '1.2'
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700'
        }
      });
      
      setLayoutSettings({
        maxWidth: '1280px',
        padding: 'normal',
        borderRadius: 'rounded',
        shadows: 'medium',
        spacing: 'normal'
      });
    }
  };

  const exportSettings = () => {
    const settings = {
      contentBlocks,
      colorScheme,
      seoSettings,
      schedule,
      typography,
      layoutSettings,
      buttonStyles
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-page-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target?.result as string);
          if (settings.contentBlocks) setContentBlocks(settings.contentBlocks);
          if (settings.colorScheme) setColorScheme(settings.colorScheme);
          if (settings.seoSettings) setSeoSettings(settings.seoSettings);
          if (settings.schedule) setSchedule(settings.schedule);
          if (settings.typography) setTypography(settings.typography);
          if (settings.layoutSettings) setLayoutSettings(settings.layoutSettings);
          if (settings.buttonStyles) setButtonStyles(settings.buttonStyles);
          alert('Settings imported successfully!');
        } catch (error) {
          alert('Error importing settings. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const tabs = [
    { id: 'content', label: 'Content', icon: Edit3 },
    { id: 'visual', label: 'Visual Design', icon: Palette },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'buttons', label: 'Buttons', icon: MousePointer },
    { id: 'media', label: 'Media', icon: Image },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'preview', label: 'Preview', icon: Eye }
  ];

  const previewModes = [
    { id: 'desktop', label: 'Desktop', icon: Monitor },
    { id: 'tablet', label: 'Tablet', icon: Tablet },
    { id: 'mobile', label: 'Mobile', icon: Smartphone }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Booking Page Editor</h1>
              <p className="text-gray-600">
                {isDraft ? (
                  <span className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span>Unsaved changes</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Published</span>
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
              <div className="flex items-center space-x-2">
                <button
                  onClick={resetToDefaults}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-300"
                  title="Reset to defaults"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                
                <button
                  onClick={exportSettings}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-300"
                  title="Export settings"
                >
                  <Download className="h-4 w-4" />
                </button>
                
                <label className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-300 cursor-pointer" title="Import settings">
                  <Upload className="h-4 w-4" />
                  <input
                    type="file"
                    accept=".json"
                    onChange={importSettings}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                onClick={handleSaveDraft}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>Save Draft</span>
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
                <span>Publish</span>
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
                    <h2 className="text-xl font-bold text-gray-900">Content Blocks</h2>
                    <div className="flex items-center space-x-2">
                      <select
                        onChange={(e) => addContentBlock(e.target.value as ContentBlock['type'])}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue=""
                      >
                        <option value="" disabled>Add Block</option>
                        <option value="hero">Hero Section</option>
                        <option value="steps">Booking Steps</option>
                        <option value="calendar">Calendar Section</option>
                        <option value="summary">Booking Summary</option>
                        <option value="features">Features List</option>
                        <option value="testimonials">Testimonials</option>
                        <option value="cta">Call to Action</option>
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
                              <span className="text-sm text-gray-600">Visible</span>
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
                              Title
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
                                Subtitle
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
                            Content
                          </label>
                          <textarea
                            value={block.content}
                            onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter content text..."
                          />
                        </div>

                        {/* Background Settings */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Background Color
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={block.backgroundColor?.startsWith('#') ? block.backgroundColor : '#ffffff'}
                                onChange={(e) => updateContentBlock(block.id, { backgroundColor: e.target.value })}
                                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                              />
                              <input
                                type="text"
                                value={block.backgroundColor || ''}
                                onChange={(e) => updateContentBlock(block.id, { backgroundColor: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                placeholder="#ffffff or gradient..."
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Text Color
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={block.textColor || '#000000'}
                                onChange={(e) => updateContentBlock(block.id, { textColor: e.target.value })}
                                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                              />
                              <input
                                type="text"
                                value={block.textColor || ''}
                                onChange={(e) => updateContentBlock(block.id, { textColor: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                placeholder="#000000"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Button Settings */}
                        {block.buttonText !== undefined && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Button Text
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
                                Button Action
                              </label>
                              <input
                                type="text"
                                value={block.buttonAction || ''}
                                onChange={(e) => updateContentBlock(block.id, { buttonAction: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="/booking, #section, https://..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Button Style
                              </label>
                              <select
                                value={block.buttonStyle || 'primary'}
                                onChange={(e) => updateContentBlock(block.id, { buttonStyle: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="primary">Primary</option>
                                <option value="secondary">Secondary</option>
                                <option value="outline">Outline</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Price Settings */}
                        {block.price && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Price
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
                                Old Price (optional)
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
                                Currency
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
                                <option value="£">GBP (£)</option>
                                <option value="₽">RUB (₽)</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Features List */}
                        {block.features && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Features List
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
                                  const newFeatures = [...block.features!, 'New feature'];
                                  updateContentBlock(block.id, { features: newFeatures });
                                }}
                                className="flex items-center space-x-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 w-full"
                              >
                                <Plus className="h-4 w-4" />
                                <span>Add Feature</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Custom CSS */}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Custom CSS (Advanced)
                          </label>
                          <textarea
                            value={block.customCSS || ''}
                            onChange={(e) => updateContentBlock(block.id, { customCSS: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                            placeholder="/* Custom CSS for this block */"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Visual Design Tab */}
              {activeTab === 'visual' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Visual Design Settings</h2>
                  
                  <div className="space-y-8">
                    {/* Color Scheme */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Scheme</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(colorScheme).map(([key, value]) => (
                          <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                              {key === 'primary' ? 'Primary' :
                               key === 'secondary' ? 'Secondary' :
                               key === 'accent' ? 'Accent' :
                               key === 'text' ? 'Text' :
                               key === 'background' ? 'Background' :
                               key === 'button' ? 'Button' :
                               key === 'buttonHover' ? 'Button Hover' :
                               key === 'link' ? 'Link' :
                               key === 'success' ? 'Success' :
                               key === 'warning' ? 'Warning' :
                               key === 'error' ? 'Error' : key}
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={value}
                                onChange={(e) => updateColorScheme(key as keyof ColorScheme, e.target.value)}
                                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                              />
                              <input
                                type="text"
                                value={value}
                                onChange={(e) => updateColorScheme(key as keyof ColorScheme, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Typography */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Primary Font
                          </label>
                          <select 
                            value={typography.primaryFont}
                            onChange={(e) => setTypography(prev => ({ ...prev, primaryFont: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Inter">Inter</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Lato">Lato</option>
                            <option value="Poppins">Poppins</option>
                            <option value="Montserrat">Montserrat</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Heading Font
                          </label>
                          <select 
                            value={typography.headingFont}
                            onChange={(e) => setTypography(prev => ({ ...prev, headingFont: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Playfair Display">Playfair Display</option>
                            <option value="Merriweather">Merriweather</option>
                            <option value="Lora">Lora</option>
                            <option value="Crimson Text">Crimson Text</option>
                            <option value="Libre Baskerville">Libre Baskerville</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Base Font Size</label>
                          <input
                            type="text"
                            value={typography.fontSize.base}
                            onChange={(e) => setTypography(prev => ({ 
                              ...prev, 
                              fontSize: { ...prev.fontSize, base: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">H1 Size</label>
                          <input
                            type="text"
                            value={typography.fontSize.h1}
                            onChange={(e) => setTypography(prev => ({ 
                              ...prev, 
                              fontSize: { ...prev.fontSize, h1: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Body Line Height</label>
                          <input
                            type="text"
                            value={typography.lineHeight.body}
                            onChange={(e) => setTypography(prev => ({ 
                              ...prev, 
                              lineHeight: { ...prev.lineHeight, body: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Heading Line Height</label>
                          <input
                            type="text"
                            value={typography.lineHeight.heading}
                            onChange={(e) => setTypography(prev => ({ 
                              ...prev, 
                              lineHeight: { ...prev.lineHeight, heading: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Layout Tab */}
              {activeTab === 'layout' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Layout Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maximum Width
                        </label>
                        <select 
                          value={layoutSettings.maxWidth}
                          onChange={(e) => setLayoutSettings(prev => ({ ...prev, maxWidth: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="1280px">1280px (Default)</option>
                          <option value="1200px">1200px</option>
                          <option value="1440px">1440px</option>
                          <option value="100%">Full Width</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Section Padding
                        </label>
                        <select 
                          value={layoutSettings.padding}
                          onChange={(e) => setLayoutSettings(prev => ({ ...prev, padding: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="compact">Compact</option>
                          <option value="normal">Normal</option>
                          <option value="spacious">Spacious</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Border Radius
                        </label>
                        <select 
                          value={layoutSettings.borderRadius}
                          onChange={(e) => setLayoutSettings(prev => ({ ...prev, borderRadius: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="none">None</option>
                          <option value="small">Small</option>
                          <option value="rounded">Rounded</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Shadows
                        </label>
                        <select 
                          value={layoutSettings.shadows}
                          onChange={(e) => setLayoutSettings(prev => ({ ...prev, shadows: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="none">None</option>
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Element Spacing
                        </label>
                        <select 
                          value={layoutSettings.spacing}
                          onChange={(e) => setLayoutSettings(prev => ({ ...prev, spacing: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="tight">Tight</option>
                          <option value="normal">Normal</option>
                          <option value="loose">Loose</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons Tab */}
              {activeTab === 'buttons' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Button Styles</h2>
                  
                  <div className="space-y-8">
                    {Object.entries(buttonStyles).map(([styleKey, style]) => (
                      <div key={styleKey} className="border border-gray-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{styleKey} Button</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={style.background}
                                onChange={(e) => setButtonStyles(prev => ({
                                  ...prev,
                                  [styleKey]: { ...prev[styleKey as keyof typeof prev], background: e.target.value }
                                }))}
                                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                              />
                              <input
                                type="text"
                                value={style.background}
                                onChange={(e) => setButtonStyles(prev => ({
                                  ...prev,
                                  [styleKey]: { ...prev[styleKey as keyof typeof prev], background: e.target.value }
                                }))}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="color"
                                value={style.color}
                                onChange={(e) => setButtonStyles(prev => ({
                                  ...prev,
                                  [styleKey]: { ...prev[styleKey as keyof typeof prev], color: e.target.value }
                                }))}
                                className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                              />
                              <input
                                type="text"
                                value={style.color}
                                onChange={(e) => setButtonStyles(prev => ({
                                  ...prev,
                                  [styleKey]: { ...prev[styleKey as keyof typeof prev], color: e.target.value }
                                }))}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Border</label>
                            <input
                              type="text"
                              value={style.border}
                              onChange={(e) => setButtonStyles(prev => ({
                                ...prev,
                                [styleKey]: { ...prev[styleKey as keyof typeof prev], border: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                              placeholder="none, 1px solid #000, etc."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
                            <input
                              type="text"
                              value={style.borderRadius}
                              onChange={(e) => setButtonStyles(prev => ({
                                ...prev,
                                [styleKey]: { ...prev[styleKey as keyof typeof prev], borderRadius: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
                            <input
                              type="text"
                              value={style.padding}
                              onChange={(e) => setButtonStyles(prev => ({
                                ...prev,
                                [styleKey]: { ...prev[styleKey as keyof typeof prev], padding: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
                            <select
                              value={style.fontWeight}
                              onChange={(e) => setButtonStyles(prev => ({
                                ...prev,
                                [styleKey]: { ...prev[styleKey as keyof typeof prev], fontWeight: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="400">Normal (400)</option>
                              <option value="500">Medium (500)</option>
                              <option value="600">Semibold (600)</option>
                              <option value="700">Bold (700)</option>
                            </select>
                          </div>
                        </div>
                        
                        {/* Button Preview */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Preview:</p>
                          <button
                            style={{
                              background: style.background,
                              color: style.color,
                              border: style.border,
                              borderRadius: style.borderRadius,
                              padding: style.padding,
                              fontSize: style.fontSize,
                              fontWeight: style.fontWeight,
                              boxShadow: style.shadow,
                              cursor: 'pointer'
                            }}
                            className="transition-all duration-300 hover:scale-105"
                          >
                            {styleKey.charAt(0).toUpperCase() + styleKey.slice(1)} Button
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Tab */}
              {activeTab === 'media' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Media Library</h2>
                    <label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-300">
                      <Upload className="h-4 w-4" />
                      <span>Upload Media</span>
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
                            alt={media.alt || media.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Video className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => navigator.clipboard.writeText(media.url)}
                              className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                              title="Copy URL"
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
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                              title="Edit Alt Text"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                          <p className="text-white text-xs truncate">{media.name}</p>
                          {media.size && (
                            <p className="text-white text-xs opacity-75">
                              {(media.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Media Upload Guidelines */}
                  <div className="mt-8 bg-blue-50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4">Media Guidelines</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                      <div>
                        <h4 className="font-semibold mb-2">Images</h4>
                        <ul className="space-y-1">
                          <li>• Recommended: JPG, PNG, WebP</li>
                          <li>• Max size: 5MB</li>
                          <li>• Optimal: 1920x1080px for hero images</li>
                          <li>• Always add alt text for accessibility</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Videos</h4>
                        <ul className="space-y-1">
                          <li>• Recommended: MP4, WebM</li>
                          <li>• Max size: 50MB</li>
                          <li>• Optimal: 1920x1080px, 30fps</li>
                          <li>• Consider autoplay settings</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SEO Tab */}
              {activeTab === 'seo' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">SEO Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Title
                      </label>
                      <input
                        type="text"
                        value={seoSettings.title}
                        onChange={(e) => setSeoSettings(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={60}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {seoSettings.title.length}/60 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Description
                      </label>
                      <textarea
                        value={seoSettings.description}
                        onChange={(e) => setSeoSettings(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={160}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {seoSettings.description.length}/160 characters
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Keywords
                      </label>
                      <input
                        type="text"
                        value={seoSettings.keywords}
                        onChange={(e) => setSeoSettings(prev => ({ ...prev, keywords: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="keyword1, keyword2, keyword3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Open Graph Image
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
                        placeholder="https://gardaracing.com/booking"
                      />
                    </div>

                    {/* Alt Tags Management */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image Alt Tags
                      </label>
                      <div className="space-y-3">
                        {Object.entries(seoSettings.altTags).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-3">
                            <input
                              type="text"
                              value={key}
                              className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                              disabled
                            />
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => setSeoSettings(prev => ({
                                ...prev,
                                altTags: { ...prev.altTags, [key]: e.target.value }
                              }))}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Alt text for this image"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SEO Preview */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Search Engine Preview</h3>
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

                    {/* SEO Checklist */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-green-800 mb-3">SEO Checklist</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className={`h-4 w-4 ${seoSettings.title.length > 0 && seoSettings.title.length <= 60 ? 'text-green-600' : 'text-gray-400'}`} />
                          <span>Title is 1-60 characters</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className={`h-4 w-4 ${seoSettings.description.length > 0 && seoSettings.description.length <= 160 ? 'text-green-600' : 'text-gray-400'}`} />
                          <span>Description is 1-160 characters</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className={`h-4 w-4 ${seoSettings.keywords.length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                          <span>Keywords are defined</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className={`h-4 w-4 ${seoSettings.ogImage.length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                          <span>Open Graph image is set</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className={`h-4 w-4 ${Object.keys(seoSettings.altTags).length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                          <span>Image alt tags are defined</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Tab */}
              {activeTab === 'preview' && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Page Preview</h2>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">Mode: {previewMode}</span>
                      <button
                        onClick={() => window.open('/booking', '_blank')}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Open Live Page</span>
                      </button>
                    </div>
                  </div>

                  <div className={`mx-auto bg-gray-100 rounded-lg overflow-hidden ${
                    previewMode === 'desktop' ? 'max-w-full' :
                    previewMode === 'tablet' ? 'max-w-2xl' :
                    'max-w-sm'
                  }`}>
                    <div className="bg-white min-h-96 p-8">
                      {/* Preview Content */}
                      {contentBlocks.filter(block => block.isVisible).map((block) => (
                        <div
                          key={block.id}
                          className="mb-8 p-6 rounded-lg"
                          style={{
                            backgroundColor: block.backgroundColor,
                            color: block.textColor
                          }}
                        >
                          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: typography.headingFont }}>
                            {block.title}
                          </h2>
                          {block.subtitle && (
                            <h3 className="text-lg mb-4 opacity-80">{block.subtitle}</h3>
                          )}
                          <p className="mb-4" style={{ fontFamily: typography.primaryFont }}>
                            {block.content}
                          </p>
                          
                          {block.features && (
                            <div className="space-y-2 mb-4">
                              {block.features.map((feature, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {block.price && (
                            <div className="mb-4">
                              <span className="text-3xl font-bold">
                                {block.price.currency}{block.price.current}
                              </span>
                              {block.price.old && (
                                <span className="text-lg line-through opacity-60 ml-2">
                                  {block.price.currency}{block.price.old}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {block.buttonText && (
                            <button
                              style={{
                                ...buttonStyles[block.buttonStyle as keyof typeof buttonStyles],
                                fontFamily: typography.primaryFont
                              }}
                              className="transition-all duration-300 hover:scale-105"
                            >
                              {block.buttonText}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preview Notes */}
                  <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-800">Preview Notes</h4>
                        <p className="text-yellow-700 text-sm mt-1">
                          This is a simplified preview. The actual page may include additional interactive elements, 
                          animations, and responsive behaviors not shown here. Use "Open Live Page" for the full experience.
                        </p>
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

export default BookingContentEditor;