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
  ArrowUp,
  ArrowDown,
  MapPin,
  Wind,
  Anchor,
  Trophy,
  Phone,
  Mail,
  Globe,
  Building,
  Target
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
  heroImages?: string[];
  testimonials?: Array<{
    id: string;
    name: string;
    location: string;
    rating: number;
    text: string;
    image_url?: string;
  }>;
  partners?: Array<{
    id: string;
    name: string;
    logo: string;
    description: string;
  }>;
  locationInfo?: {
    address: string;
    coordinates: { lat: number; lng: number };
    highlights: string[];
  };
  experienceSteps?: Array<{
    id: string;
    step: number;
    title: string;
    description: string;
    icon: string;
  }>;
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

  // Content blocks state with all sections
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    {
      id: 'hero',
      type: 'hero',
      title: 'Experience the Thrill of Yacht Racing',
      subtitle: 'Daily yacht racing experiences in world-famous Lake Garda',
      content: 'Daily yacht racing experiences in world-famous Lake Garda with professional skippers, racing medals, and unforgettable memories',
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
      heroImages: [
        'https://i.postimg.cc/d1MvNFGZ/temp-Image66m3b-Q.avif',
        'https://i.postimg.cc/4yPg3hqp/temp-Image-Awvj-Tb.avif',
        'https://i.postimg.cc/m2Z4581j/temp-Image3ioz3-A.avif',
        'https://i.postimg.cc/65HKJndX/temp-Image-WZ1-EPq.avif'
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
      features: [
        'Professional Skipper - Expert guidance from certified sailing professionals',
        'Racing Experience - Authentic yacht racing with medals and certificates', 
        'Photo & Video - Professional documentation of your sailing adventure',
        'Fully Insured - Complete safety coverage and premium equipment'
      ],
      isVisible: true,
      order: 2
    },
    {
      id: 'experience',
      type: 'experience',
      title: 'Your Perfect Day on Lake Garda',
      subtitle: 'From arrival to medal ceremony',
      content: 'A carefully crafted experience that takes you from complete beginner to confident sailor in one unforgettable day.',
      backgroundColor: 'linear-gradient(to bottom right, #eff6ff, #fef2f2)',
      textColor: '#1f2937',
      experienceSteps: [
        {
          id: '1',
          step: 1,
          title: 'Morning Briefing',
          description: 'Meet your professional skipper and learn the basics of yacht racing in a relaxed, friendly environment.',
          icon: 'users'
        },
        {
          id: '2',
          step: 2,
          title: 'Racing Experience',
          description: 'Participate in authentic yacht races with other boats, experiencing the thrill of competition on beautiful Lake Garda.',
          icon: 'trophy'
        },
        {
          id: '3',
          step: 3,
          title: 'Medal Ceremony',
          description: 'Celebrate your achievement with an official medal ceremony and receive your personalized racing certificate.',
          icon: 'award'
        }
      ],
      buttonText: 'Learn More About the Experience',
      buttonAction: '/events',
      isVisible: true,
      order: 3
    },
    {
      id: 'testimonials',
      type: 'testimonials',
      title: 'What Our Sailors Say',
      subtitle: 'Join thousands of satisfied customers who\'ve experienced the magic of Lake Garda racing',
      content: 'Real experiences from real customers',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      testimonials: [
        {
          id: '1',
          name: 'Marco Rossi',
          location: 'Munich, Germany',
          rating: 5,
          text: 'Incredible experience! The professional skipper made us feel safe while we enjoyed the thrill of racing. The photos they took are amazing memories.',
          image_url: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          location: 'London, UK',
          rating: 5,
          text: 'Perfect day on Lake Garda! No sailing experience needed - they taught us everything. The medal ceremony was a nice touch. Highly recommended!',
          image_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
        },
        {
          id: '3',
          name: 'Andreas Mueller',
          location: 'Vienna, Austria',
          rating: 5,
          text: 'Brought our corporate team here for a unique experience. Everyone loved it! Great organization, beautiful location, and unforgettable memories.',
          image_url: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
        }
      ],
      isVisible: true,
      order: 4
    },
    {
      id: 'location',
      type: 'location',
      title: 'Prime Location in Riva del Garda',
      subtitle: 'World-class sailing destination',
      content: 'Located in the heart of Lake Garda, offering perfect sailing conditions and stunning Alpine scenery.',
      backgroundColor: 'linear-gradient(to bottom right, #1e3a8a, #7f1d1d)',
      textColor: '#ffffff',
      image: 'https://postimg.cc/1gRCN3Y4',
      locationInfo: {
        address: 'Via del Porto 15, 38066 Riva del Garda, TN, Italy',
        coordinates: { lat: 45.8847, lng: 10.8405 },
        highlights: [
          'Easy Access from Munich - Just 4 hours drive from Munich, making it perfect for weekend getaways and corporate events.',
          'World-Class Sailing Conditions - Lake Garda offers consistent winds and stunning Alpine scenery, making it Europe\'s premier sailing destination.',
          'Daily Departures - Multiple time slots available daily from March to October, with flexible booking options.'
        ]
      },
      isVisible: true,
      order: 5
    },
    {
      id: 'partners',
      type: 'partners',
      title: 'Our Trusted Partners',
      subtitle: 'Working with the world\'s leading yacht and marine equipment manufacturers',
      content: 'We work with the world\'s leading yacht and marine equipment manufacturers to provide you with the best possible sailing experience.',
      backgroundColor: '#f9fafb',
      textColor: '#1f2937',
      partners: [
        {
          id: '1',
          name: 'Bavaria Yachts',
          logo: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop',
          description: 'Premium yacht manufacturer'
        },
        {
          id: '2',
          name: 'Garmin Marine',
          logo: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop',
          description: 'Navigation technology'
        },
        {
          id: '3',
          name: 'Helly Hansen',
          logo: 'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop',
          description: 'Professional sailing gear'
        },
        {
          id: '4',
          name: 'Musto Sailing',
          logo: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop',
          description: 'Technical sailing clothing'
        },
        {
          id: '5',
          name: 'Raymarine',
          logo: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop',
          description: 'Marine electronics'
        },
        {
          id: '6',
          name: 'Spinlock',
          logo: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop',
          description: 'Safety equipment'
        }
      ],
      buttonText: 'Contact Us About Partnerships',
      buttonAction: '/contact',
      isVisible: true,
      order: 6
    },
    {
      id: 'cta',
      type: 'cta',
      title: 'Ready for Your Sailing Adventure?',
      subtitle: 'Join us for an unforgettable day of yacht racing on Lake Garda',
      content: 'Join us for an unforgettable day of yacht racing on Lake Garda. No experience necessary - just bring your sense of adventure!',
      backgroundColor: '#dc2626',
      textColor: '#ffffff',
      buttonText: 'Book Now - €199',
      buttonAction: '/booking',
      buttonStyle: 'secondary',
      features: [
        'Call +39 345 678 9012'
      ],
      isVisible: true,
      order: 7
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
    { id: '3', url: 'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg', name: 'Harbor', type: 'image' },
    { id: '4', url: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg', name: 'Instruction', type: 'image' },
    { id: '5', url: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg', name: 'Medal Ceremony', type: 'image' }
  ]);

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

  // Helper functions for different block types
  const addTestimonial = (blockId: string) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block && block.testimonials) {
      const newTestimonial = {
        id: Date.now().toString(),
        name: 'New Customer',
        location: 'Location',
        rating: 5,
        text: 'Great experience!',
        image_url: ''
      };
      updateContentBlock(blockId, { 
        testimonials: [...block.testimonials, newTestimonial] 
      });
    }
  };

  const updateTestimonial = (blockId: string, testimonialId: string, updates: any) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block && block.testimonials) {
      const updatedTestimonials = block.testimonials.map(t => 
        t.id === testimonialId ? { ...t, ...updates } : t
      );
      updateContentBlock(blockId, { testimonials: updatedTestimonials });
    }
  };

  const removeTestimonial = (blockId: string, testimonialId: string) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block && block.testimonials) {
      const filteredTestimonials = block.testimonials.filter(t => t.id !== testimonialId);
      updateContentBlock(blockId, { testimonials: filteredTestimonials });
    }
  };

  const addPartner = (blockId: string) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block && block.partners) {
      const newPartner = {
        id: Date.now().toString(),
        name: 'New Partner',
        logo: '',
        description: 'Partner description'
      };
      updateContentBlock(blockId, { 
        partners: [...block.partners, newPartner] 
      });
    }
  };

  const updatePartner = (blockId: string, partnerId: string, updates: any) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block && block.partners) {
      const updatedPartners = block.partners.map(p => 
        p.id === partnerId ? { ...p, ...updates } : p
      );
      updateContentBlock(blockId, { partners: updatedPartners });
    }
  };

  const removePartner = (blockId: string, partnerId: string) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block && block.partners) {
      const filteredPartners = block.partners.filter(p => p.id !== partnerId);
      updateContentBlock(blockId, { partners: filteredPartners });
    }
  };

  const addExperienceStep = (blockId: string) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block && block.experienceSteps) {
      const newStep = {
        id: Date.now().toString(),
        step: block.experienceSteps.length + 1,
        title: 'New Step',
        description: 'Step description',
        icon: 'star'
      };
      updateContentBlock(blockId, { 
        experienceSteps: [...block.experienceSteps, newStep] 
      });
    }
  };

  const updateExperienceStep = (blockId: string, stepId: string, updates: any) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block && block.experienceSteps) {
      const updatedSteps = block.experienceSteps.map(s => 
        s.id === stepId ? { ...s, ...updates } : s
      );
      updateContentBlock(blockId, { experienceSteps: updatedSteps });
    }
  };

  const removeExperienceStep = (blockId: string, stepId: string) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block && block.experienceSteps) {
      const filteredSteps = block.experienceSteps.filter(s => s.id !== stepId);
      updateContentBlock(blockId, { experienceSteps: filteredSteps });
    }
  };

  const addHeroImage = (blockId: string) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block && block.heroImages) {
      const newImages = [...block.heroImages, ''];
      updateContentBlock(blockId, { heroImages: newImages });
    }
  };

  const updateHeroImage = (blockId: string, imageIndex: number, url: string) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block && block.heroImages) {
      const newImages = [...block.heroImages];
      newImages[imageIndex] = url;
      updateContentBlock(blockId, { heroImages: newImages });
    }
  };

  const removeHeroImage = (blockId: string, imageIndex: number) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block && block.heroImages && block.heroImages.length > 1) {
      const newImages = block.heroImages.filter((_, index) => index !== imageIndex);
      updateContentBlock(blockId, { heroImages: newImages });
    }
  };

  const moveHeroImage = (blockId: string, fromIndex: number, toIndex: number) => {
    const block = contentBlocks.find(b => b.id === blockId);
    if (block && block.heroImages) {
      const newImages = [...block.heroImages];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      updateContentBlock(blockId, { heroImages: newImages });
    }
  };

  const tabs = [
    { id: 'content', label: 'Content', icon: Edit3 },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'media', label: 'Media', icon: Image },
    { id: 'seo', label: 'SEO', icon: Settings },
    { id: 'preview', label: 'Preview', icon: Eye }
  ];

  const previewModes = [
    { id: 'desktop', label: 'Desktop', icon: Monitor },
    { id: 'tablet', label: 'Tablet', icon: Tablet },
    { id: 'mobile', label: 'Mobile', icon: Smartphone }
  ];

  const renderBlockEditor = (block: ContentBlock) => {
    return (
      <div key={block.id} className="border border-gray-200 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">{block.order}</span>
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

        {/* Basic Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={block.title}
              onChange={(e) => updateContentBlock(block.id, { title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {block.subtitle !== undefined && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <textarea
            value={block.content}
            onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Type-specific editors */}
        {block.type === 'hero' && renderHeroEditor(block)}
        {block.type === 'features' && renderFeaturesEditor(block)}
        {block.type === 'experience' && renderExperienceEditor(block)}
        {block.type === 'testimonials' && renderTestimonialsEditor(block)}
        {block.type === 'location' && renderLocationEditor(block)}
        {block.type === 'partners' && renderPartnersEditor(block)}
        {block.type === 'cta' && renderCTAEditor(block)}
      </div>
    );
  };

  const renderHeroEditor = (block: ContentBlock) => (
    <div className="space-y-6">
      {/* Hero Gallery Management */}
      {block.heroImages && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Hero Gallery Images (Auto-rotate every 7 seconds)
            </label>
            <button
              onClick={() => addHeroImage(block.id)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              <Plus className="h-4 w-4" />
              <span>Add Image</span>
            </button>
          </div>
          <div className="space-y-3">
            {block.heroImages.map((imageUrl, imageIndex) => (
              <div key={imageIndex} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => moveHeroImage(block.id, imageIndex, Math.max(0, imageIndex - 1))}
                    disabled={imageIndex === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveHeroImage(block.id, imageIndex, Math.min(block.heroImages!.length - 1, imageIndex + 1))}
                    disabled={imageIndex === block.heroImages!.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm font-medium text-gray-600 min-w-[2rem]">
                  #{imageIndex + 1}
                </span>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => updateHeroImage(block.id, imageIndex, e.target.value)}
                  placeholder="Image URL"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {imageUrl && (
                  <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={`Hero ${imageIndex + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <button
                  onClick={() => removeHeroImage(block.id, imageIndex)}
                  disabled={block.heroImages!.length <= 1}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Settings */}
      {block.price && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Price</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Old Price (optional)</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Features List</label>
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

      {/* Button Settings */}
      {block.buttonText !== undefined && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
            <input
              type="text"
              value={block.buttonText || ''}
              onChange={(e) => updateContentBlock(block.id, { buttonText: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
            <input
              type="text"
              value={block.buttonAction || ''}
              onChange={(e) => updateContentBlock(block.id, { buttonAction: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/booking or https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Style</label>
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
    </div>
  );

  const renderFeaturesEditor = (block: ContentBlock) => (
    <div>
      {block.features && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Features List</label>
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
                  placeholder="Feature title - Feature description"
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
                const newFeatures = [...block.features!, 'New Feature - Description'];
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
    </div>
  );

  const renderExperienceEditor = (block: ContentBlock) => (
    <div>
      {block.experienceSteps && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">Experience Steps</label>
            <button
              onClick={() => addExperienceStep(block.id)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              <Plus className="h-4 w-4" />
              <span>Add Step</span>
            </button>
          </div>
          <div className="space-y-4">
            {block.experienceSteps.map((step, stepIndex) => (
              <div key={step.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Step Number</label>
                    <input
                      type="number"
                      value={step.step}
                      onChange={(e) => updateExperienceStep(block.id, step.id, { step: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateExperienceStep(block.id, step.id, { title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                    <select
                      value={step.icon}
                      onChange={(e) => updateExperienceStep(block.id, step.id, { icon: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="users">Users</option>
                      <option value="trophy">Trophy</option>
                      <option value="award">Award</option>
                      <option value="star">Star</option>
                      <option value="target">Target</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={step.description}
                    onChange={(e) => updateExperienceStep(block.id, step.id, { description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => removeExperienceStep(block.id, step.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Button Settings */}
      {block.buttonText !== undefined && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
            <input
              type="text"
              value={block.buttonText || ''}
              onChange={(e) => updateContentBlock(block.id, { buttonText: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
            <input
              type="text"
              value={block.buttonAction || ''}
              onChange={(e) => updateContentBlock(block.id, { buttonAction: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/events or https://..."
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderTestimonialsEditor = (block: ContentBlock) => (
    <div>
      {block.testimonials && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">Testimonials</label>
            <button
              onClick={() => addTestimonial(block.id)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              <Plus className="h-4 w-4" />
              <span>Add Testimonial</span>
            </button>
          </div>
          <div className="space-y-4">
            {block.testimonials.map((testimonial, testimonialIndex) => (
              <div key={testimonial.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={testimonial.name}
                      onChange={(e) => updateTestimonial(block.id, testimonial.id, { name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={testimonial.location}
                      onChange={(e) => updateTestimonial(block.id, testimonial.id, { location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <select
                      value={testimonial.rating}
                      onChange={(e) => updateTestimonial(block.id, testimonial.id, { rating: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={5}>5 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={3}>3 Stars</option>
                      <option value={2}>2 Stars</option>
                      <option value={1}>1 Star</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                    <input
                      type="text"
                      value={testimonial.image_url || ''}
                      onChange={(e) => updateTestimonial(block.id, testimonial.id, { image_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Testimonial Text</label>
                  <textarea
                    value={testimonial.text}
                    onChange={(e) => updateTestimonial(block.id, testimonial.id, { text: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => removeTestimonial(block.id, testimonial.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderLocationEditor = (block: ContentBlock) => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Background Image</label>
        <input
          type="text"
          value={block.image || ''}
          onChange={(e) => updateContentBlock(block.id, { image: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://..."
        />
      </div>

      {block.locationInfo && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <input
            type="text"
            value={block.locationInfo.address}
            onChange={(e) => updateContentBlock(block.id, { 
              locationInfo: { ...block.locationInfo, address: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Location Highlights</label>
            <div className="space-y-2">
              {block.locationInfo.highlights.map((highlight, highlightIndex) => (
                <div key={highlightIndex} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => {
                      const newHighlights = [...block.locationInfo!.highlights];
                      newHighlights[highlightIndex] = e.target.value;
                      updateContentBlock(block.id, { 
                        locationInfo: { ...block.locationInfo!, highlights: newHighlights }
                      });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Highlight title - Description"
                  />
                  <button
                    onClick={() => {
                      const newHighlights = block.locationInfo!.highlights.filter((_, i) => i !== highlightIndex);
                      updateContentBlock(block.id, { 
                        locationInfo: { ...block.locationInfo!, highlights: newHighlights }
                      });
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newHighlights = [...block.locationInfo!.highlights, 'New Highlight - Description'];
                  updateContentBlock(block.id, { 
                    locationInfo: { ...block.locationInfo!, highlights: newHighlights }
                  });
                }}
                className="flex items-center space-x-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 w-full"
              >
                <Plus className="h-4 w-4" />
                <span>Add Highlight</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPartnersEditor = (block: ContentBlock) => (
    <div>
      {block.partners && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">Partners</label>
            <button
              onClick={() => addPartner(block.id)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              <Plus className="h-4 w-4" />
              <span>Add Partner</span>
            </button>
          </div>
          <div className="space-y-4">
            {block.partners.map((partner, partnerIndex) => (
              <div key={partner.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={partner.name}
                      onChange={(e) => updatePartner(block.id, partner.id, { name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                    <input
                      type="text"
                      value={partner.logo}
                      onChange={(e) => updatePartner(block.id, partner.id, { logo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <input
                      type="text"
                      value={partner.description}
                      onChange={(e) => updatePartner(block.id, partner.id, { description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => removePartner(block.id, partner.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Button Settings */}
      {block.buttonText !== undefined && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
            <input
              type="text"
              value={block.buttonText || ''}
              onChange={(e) => updateContentBlock(block.id, { buttonText: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
            <input
              type="text"
              value={block.buttonAction || ''}
              onChange={(e) => updateContentBlock(block.id, { buttonAction: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/contact or https://..."
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderCTAEditor = (block: ContentBlock) => (
    <div className="space-y-6">
      {/* Button Settings */}
      {block.buttonText !== undefined && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
            <input
              type="text"
              value={block.buttonText || ''}
              onChange={(e) => updateContentBlock(block.id, { buttonText: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
            <input
              type="text"
              value={block.buttonAction || ''}
              onChange={(e) => updateContentBlock(block.id, { buttonAction: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="/booking or https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Button Style</label>
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

      {/* Additional Actions */}
      {block.features && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Actions</label>
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
                  placeholder="Action text (e.g., Call +39 345 678 9012)"
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
                const newFeatures = [...block.features!, 'New Action'];
                updateContentBlock(block.id, { features: newFeatures });
              }}
              className="flex items-center space-x-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 w-full"
            >
              <Plus className="h-4 w-4" />
              <span>Add Action</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Home Page Editor</h1>
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
              <button
                onClick={handleSaveDraft}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-300 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
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
                        <option value="hero">Hero Banner</option>
                        <option value="features">Features</option>
                        <option value="experience">Experience</option>
                        <option value="testimonials">Testimonials</option>
                        <option value="location">Location</option>
                        <option value="partners">Partners</option>
                        <option value="cta">Call to Action</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {contentBlocks.map((block) => renderBlockEditor(block))}
                  </div>
                </div>
              )}

              {/* Design Tab */}
              {activeTab === 'design' && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Design Settings</h2>
                  
                  <div className="space-y-8">
                    {/* Color Scheme */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Scheme</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(colorScheme).map(([key, value]) => (
                          <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                              {key === 'primary' ? 'Primary' :
                               key === 'secondary' ? 'Secondary' :
                               key === 'accent' ? 'Accent' :
                               key === 'text' ? 'Text' :
                               key === 'background' ? 'Background' :
                               key === 'button' ? 'Button' :
                               key === 'buttonHover' ? 'Button (hover)' :
                               key === 'link' ? 'Link' : key}
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Main Font
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Inter">Inter (current)</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Lato">Lato</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Heading Font
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Playfair Display">Playfair Display (current)</option>
                            <option value="Merriweather">Merriweather</option>
                            <option value="Lora">Lora</option>
                            <option value="Crimson Text">Crimson Text</option>
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
                    <h2 className="text-xl font-bold text-gray-900">Media Library</h2>
                    <label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-300">
                      <Upload className="h-4 w-4" />
                      <span>Upload File</span>
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
                        placeholder="keyword, another keyword"
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
                        placeholder="https://gardaracing.com/"
                      />
                    </div>

                    {/* SEO Preview */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Search Results Preview</h3>
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
                    <h2 className="text-xl font-bold text-gray-900">Page Preview</h2>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">Mode: {previewMode}</span>
                      <button
                        onClick={() => window.open('/', '_blank')}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Open in New Tab</span>
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