import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, Users, Award, Camera, Wind, Anchor, CheckCircle, Star } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

const EventsPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const galleryImages = [
    { url: "https://i.postimg.cc/65HKJndX/temp-Image-WZ1-EPq.avif", caption: "Garda Yacht Racing 1" },
    { url: "https://i.postimg.cc/4yPg3hqp/temp-Image-Awvj-Tb.avif", caption: "Garda Yacht Racing 2" },
    { url: "https://i.postimg.cc/d1MvNFGZ/temp-Image66m3b-Q.avif", caption: "Garda Yacht Racing 3" },
    { url: "https://i.postimg.cc/m2Z4581j/temp-Image3ioz3-A.avif", caption: "Garda Yacht Racing 4" },
    { url: "https://i.postimg.cc/025gWBpM/temp-Image-S31m-Ms.avif", caption: "Garda Yacht Racing 5" },
    { url: "https://i.postimg.cc/ZqnKGqpN/temp-Image-GC3d-NH.avif", caption: "Garda Yacht Racing 6" },
    { url: "https://i.postimg.cc/RZRWr8Yk/temp-Image7-PJCLf.avif", caption: "Garda Yacht Racing 7" }
  ];

  // --- Data arrays as in original code ---
  const morningSchedule = [
    { time: "08:30", activity: "Welcome & Registration", description: "Meet your skipper and fellow sailors" },
    { time: "09:00", activity: "Safety Briefing", description: "Essential safety procedures and equipment overview" },
    { time: "09:30", activity: "Sailing Basics", description: "Learn fundamental sailing techniques" },
    { time: "10:00", activity: "First Race", description: "Practice race to get comfortable" },
    { time: "13:30", activity: "Medal Ceremony", description: "Awards and certificate presentation" },
    { time: "13:30", activity: "Photo Session", description: "Professional photos with your medals" }
  ];

  const afternoonSchedule = [
    { time: "13:00", activity: "Welcome & Registration", description: "Meet your skipper and fellow sailors" },
    { time: "13:30", activity: "Safety Briefing", description: "Essential safety procedures and equipment overview" },
    { time: "14:00", activity: "Sailing Basics", description: "Learn fundamental sailing techniques" },
    { time: "14:30", activity: "First Race", description: "Practice race to get comfortable" },
    { time: "18:00", activity: "Medal Ceremony", description: "Awards and certificate presentation" },
    { time: "18:00", activity: "Photo Session", description: "Professional photos with your medals" }
  ];

  const equipment = [
    "Professional racing yacht (J-70/J-80)",
    "All safety equipment (life jackets, water)",
    "Professional sailing gear",
    "First aid kit and emergency equipment"
  ];

  const weatherConditions = [
    { condition: "Wind Speed", value: "8-15 knots", icon: Wind },
    { condition: "Temperature", value: "18-28°C", icon: Clock },
    { condition: "Visibility", value: "Excellent", icon: Star },
    { condition: "Water Temp", value: "16-24°C", icon: Anchor }
  ];

  const faqs = [
    {
      question: "Do I need sailing experience?",
      answer: "No sailing experience is required! Our professional skippers will teach you everything you need to know. We welcome complete beginners and experienced sailors alike."
    },
    {
      question: "What should I bring?",
      answer: "Bring comfortable clothes, sunscreen, a hat, and a change of clothes. We provide all sailing equipment, safety gear."
    },
    {
      question: "What if the weather is bad?",
      answer: "Safety is our priority. If conditions are unsafe, we'll reschedule your experience at no extra cost. Light rain doesn't stop us - it's part of the adventure!"
    },
    {
      question: "How many people per boat?",
      answer: "Each yacht accommodates 4-5 participants plus the professional skipper. This ensures personalized attention."
    },
    {
      question: "Can I bring my camera?",
      answer: "Absolutely! We also provide professional photography services. You'll receive high-quality photos and videos of your racing experience within 24 hours."
    }
  ];

  // Функции для модалки галереи:
  const openGallery = (index: number) => setSelectedImage(index);
  const closeGallery = () => setSelectedImage(null);
  const prevImage = () => {
    if (selectedImage === null) return;
    setSelectedImage((selectedImage - 1 + galleryImages.length) % galleryImages.length);
  };
  const nextImage = () => {
    if (selectedImage === null) return;
    setSelectedImage((selectedImage + 1) % galleryImages.length);
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-900 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif">
                {t('events.title', 'The Complete Racing Experience')}
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                {t('events.subtitle', 'From beginner to champion in one day. Experience authentic yacht racing on Lake Garda with professional instruction, competitive races, and official recognition of your achievement.')}
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
                  <Clock className="h-5 w-5 text-gold-400" />
                  <span>3-4 hours</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
                  <Users className="h-5 w-5 text-gold-400" />
                  <span>4-5 people</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
                  <Award className="h-5 w-5 text-gold-400" />
                  <span>Medal included</span>
                </div>
              </div>
              <Link
                to="/booking"
                className="bg-gold-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gold-600 transition-all duration-300 hover:scale-105 shadow-lg inline-block"
              >
                {t('booking.cta', 'Book Your Experience - €195')}
              </Link>
            </div>
            <div className="relative">
              <img
                src={galleryImages[0].url}
                alt={galleryImages[0].caption}
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                <p className="text-white text-center">{galleryImages[0].caption}</p>
              </div>
              <button className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl hover:bg-black/30 transition-colors duration-300 group">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'schedule', label: 'Schedule' },
              { id: 'gallery', label: 'Gallery' },
              { id: 'weather', label: 'Weather' },
              { id: 'equipment', label: 'Equipment' },
              { id: 'faq', label: 'FAQ' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-300 ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-16 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">What Makes Our Experience Special</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Instruction</h3>
                      <p className="text-gray-600">Learn from certified sailing professionals with years of racing experience on Lake Garda.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <Award className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentic Racing</h3>
                      <p className="text-gray-600">Participate in real yacht races with official timing, scoring, and medal ceremonies.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <Camera className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Documentation</h3>
                      <p className="text-gray-600">High-quality photos and videos of your experience, delivered within 24 hours.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Racing Format</h2>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Pro-Level One-Day Regatta</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">Races held on J/70 class professional sailing yachts</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">Each boat includes a licensed skipper and full crew</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">3–5 official races per day, scored under sailing sport rules</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">Supervised by a qualified judging team and technical support boats</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">Medal ceremony and certificates for top crews</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule */}
        {activeTab === 'schedule' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Daily Schedule</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Morning Session</h3>
                <div className="space-y-6">
                  {morningSchedule.map((item, index) => (
                    <div key={index} className="flex items-start space-x-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                      <div className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold min-w-fit">
                        {item.time}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.activity}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Afternoon Session</h3>
                <div className="space-y-6">
                  {afternoonSchedule.map((item, index) => (
                    <div key={index} className="flex items-start space-x-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                      <div className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold min-w-fit">
                        {item.time}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.activity}</h3>
                        <p className="text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gallery */}
        {activeTab === 'gallery' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Experience Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((image, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer overflow-hidden rounded-xl"
                  onClick={() => openGallery(index)}
                >
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <p className="text-white font-semibold text-center px-4">{image.caption}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Overlay */}
            {selectedImage !== null && (
              <div
                className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
                onClick={closeGallery}
              >
                <div
                  className="relative max-w-4xl w-full rounded-lg overflow-hidden"
                  onClick={e => e.stopPropagation()}
                >
                  <img
                    src={galleryImages[selectedImage].url}
                    alt={galleryImages[selectedImage].caption}
                    className="w-full max-h-[80vh] object-contain rounded-lg"
                  />
                  <p className="text-center text-white mt-2">{galleryImages[selectedImage].caption}</p>
                  <button
                    onClick={closeGallery}
                    className="absolute top-3 right-3 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-75 transition"
                    aria-label="Previous Image"
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-75 transition"
                    aria-label="Next Image"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Weather */}
        {activeTab === 'weather' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Typical Weather Conditions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {weatherConditions.map(({ condition, value, icon: Icon }, i) => (
                <div key={i} className="flex flex-col items-center p-6 bg-white rounded-xl shadow-md border border-gray-100">
                  <Icon className="h-10 w-10 text-primary-600 mb-4" />
                  <p className="font-semibold text-lg text-gray-900">{condition}</p>
                  <p className="text-gray-600">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipment */}
        {activeTab === 'equipment' && (
          <div className="animate-fade-in max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Equipment Provided</h2>
            <ul className="list-disc list-inside space-y-4 text-gray-700 text-lg">
              {equipment.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* FAQ */}
        {activeTab === 'faq' && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map(({ question, answer }, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{question}</h3>
                  <p className="text-gray-700">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
