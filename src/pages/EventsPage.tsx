import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, Users, Award, Camera, Wind, Anchor, CheckCircle, Star, Shield } from 'lucide-react';
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

  // --- Data arrays with translations ---
  const morningSchedule = [
    { time: "08:30", activity: t("events.schedule.welcome_registration", "Welcome & Registration"), description: t("events.schedule.welcome_registration_desc", "Meet your skipper and fellow sailors") },
    { time: "09:00", activity: t("events.schedule.safety_briefing", "Safety Briefing"), description: t("events.schedule.safety_briefing_desc", "Essential safety procedures and equipment overview") },
    { time: "09:30", activity: t("events.schedule.sailing_basics", "Sailing Basics"), description: t("events.schedule.sailing_basics_desc", "Learn fundamental sailing techniques") },
    { time: "10:00", activity: t("events.schedule.first_race", "First Race"), description: t("events.schedule.first_race_desc", "Practice race to get comfortable") },
    { time: "13:30", activity: t("events.schedule.medal_ceremony_award", "Medal Ceremony"), description: t("events.schedule.medal_ceremony_desc", "Awards presentation") },
    { time: "13:30", activity: t("events.schedule.photo_session", "Photo Session"), description: t("events.schedule.photo_session_desc", "Professional photos with your medals") }
  ];

  const afternoonSchedule = [
    { time: "13:00", activity: t("events.schedule.welcome_registration", "Welcome & Registration"), description: t("events.schedule.welcome_registration_desc", "Meet your skipper and fellow sailors") },
    { time: "13:30", activity: t("events.schedule.safety_briefing", "Safety Briefing"), description: t("events.schedule.safety_briefing_desc", "Essential safety procedures and equipment overview") },
    { time: "14:00", activity: t("events.schedule.sailing_basics", "Sailing Basics"), description: t("events.schedule.sailing_basics_desc", "Learn fundamental sailing techniques") },
    { time: "14:30", activity: t("events.schedule.first_race", "First Race"), description: t("events.schedule.first_race_desc", "Practice race to get comfortable") },
    { time: "18:00", activity: t("events.schedule.medal_ceremony_award", "Medal Ceremony"), description: t("events.schedule.medal_ceremony_desc", "Awards presentation") },
    { time: "18:00", activity: t("events.schedule.photo_session", "Photo Session"), description: t("events.schedule.photo_session_desc", "Professional photos with your medals") }
  ];

  const weatherConditions = [
    { condition: t("events.weather.wind_speed", "Wind Speed"), value: t("events.weather.wind_speed_value", "8-15 knots"), icon: Wind },
    { condition: t("events.weather.temperature", "Temperature"), value: t("events.weather.temperature_value", "18-28°C"), icon: Clock },
    { condition: t("events.weather.visibility", "Visibility"), value: t("events.weather.visibility_value", "Excellent"), icon: Star },
    { condition: t("events.weather.water_temp", "Water Temp"), value: t("events.weather.water_temp_value", "16-24°C"), icon: Anchor }
  ];

  const faqs = [
    {
      question: t("events.faq.sailing_experience", "Do I need sailing experience?"),
      answer: t("events.faq.sailing_experience_answer", "No sailing experience is required! Our professional skippers will teach you everything you need to know. We welcome complete beginners and experienced sailors alike.")
    },
    {
      question: t("events.faq.what_to_bring", "What should I bring?"),
      answer: t("events.faq.what_to_bring_answer", "Bring comfortable clothes, sunscreen, a hat, and a change of clothes. We provide all sailing equipment, safety gear.")
    },
    {
      question: t("events.faq.bad_weather", "What if the weather is bad?"),
      answer: t("events.faq.bad_weather_answer", "Safety is our priority. If conditions are unsafe, we'll reschedule your experience at no extra cost. Light rain doesn't stop us - it's part of the adventure!")
    },
    {
      question: t("events.faq.people_per_boat", "How many people per boat?"),
      answer: t("events.faq.people_per_boat_answer", "Each yacht accommodates 4-5 participants plus the professional skipper. This ensures personalized attention.")
    },
    {
      question: t("events.faq.bring_camera", "Can I bring my camera?"),
      answer: t("events.faq.bring_camera_answer", "Absolutely! We also provide professional photography services. You'll receive high-quality photos and videos of your racing experience within 24 hours.")
    }
  ];

  // Functions for gallery modal:
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
                  <span>{t('home.features.duration', '3-4 hours')}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
                  <Users className="h-5 w-5 text-gold-400" />
                  <span>{t('home.features.participants', '4-5 people')}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg">
                  <Award className="h-5 w-5 text-gold-400" />
                  <span>{t('home.features.medal', 'Medal included')}</span>
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
                srcSet={`
                  ${galleryImages[0].url}?width=400 400w,
                  ${galleryImages[0].url}?width=800 800w,
                  ${galleryImages[0].url} 1200w
                `}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw"
                alt={galleryImages[0].caption}
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
                loading="eager" // Eagerly load this above-the-fold image
                width="800"
                height="384"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                <p className="text-white text-center">{galleryImages[0].caption}</p>
              </div>
              <button 
                className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl hover:bg-black/30 transition-colors duration-300 group"
                onClick={() => openGallery(0)}
                aria-label="Open gallery"
              >
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
              { id: 'overview', label: t('events.tabs.overview', 'Overview') },
              { id: 'schedule', label: t('events.tabs.schedule', 'Schedule') },
              { id: 'gallery', label: t('events.tabs.gallery', 'Gallery') },
              { id: 'weather', label: t('events.tabs.weather', 'Weather') },
              { id: 'equipment', label: t('events.tabs.equipment', 'Equipment') },
              { id: 'faq', label: t('events.tabs.faq', 'FAQ') }
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
                <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('events.overview.what_makes_special', 'What Makes Our Experience Special')}</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('events.overview.professional_instruction', 'Сertified sailing professionals with years of racing experience on Lake Garda.')}</h3>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <Award className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('events.overview.authentic_racing', 'Authentic Racing')}</h3>
                      <p className="text-gray-600">{t('events.overview.authentic_racing_desc', 'Participate in real yacht races with official timing, scoring, and medal ceremonies.')}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <Camera className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('events.overview.professional_documentation', 'Professional Documentation')}</h3>
                      <p className="text-gray-600">{t('events.overview.professional_documentation_desc', 'High-quality photos and videos of your experience, delivered within 24 hours.')}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('events.overview.racing_format', 'Racing Format')}</h2>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('events.overview.pro_level_regatta', 'Pro-Level One-Day Regatta')}</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">{t('events.overview.j70_yachts', 'Races held on J/70 class professional sailing yachts')}</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">{t('events.overview.licensed_skipper', 'Each boat includes a licensed skipper and full crew')}</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">{t('events.overview.official_races', '3–5 official races per day')}</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">{t('events.overview.medal_ceremony_certificates', 'Medal ceremony and certificates for top crews')}</span>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('events.schedule.daily_schedule', 'Daily Schedule')}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">{t('events.schedule.morning_session', 'Morning Session')}</h3>
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
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">{t('events.schedule.afternoon_session', 'Afternoon Session')}</h3>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('events.gallery.experience_gallery', 'Experience Gallery')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {galleryImages.map((image, index) => {
                // Create srcset variations
                const baseUrl = image.url;
                
                return (
                <div
                  key={index}
                  className="relative group cursor-pointer overflow-hidden rounded-xl aspect-square"
                  onClick={() => openGallery(index)}
                >
                  <img
                    src={image.url}
                    srcSet={`
                      ${baseUrl}?width=400 400w,
                      ${baseUrl}?width=600 600w, 
                      ${baseUrl} 800w
                    `}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    alt={image.caption}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    width="400"
                    height="400"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <p className="text-white font-semibold text-center px-4">{image.caption}</p>
                  </div>
                </div>
                );
              })}
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
                    srcSet={`
                      ${galleryImages[selectedImage].url}?width=800 800w,
                      ${galleryImages[selectedImage].url}?width=1200 1200w,
                      ${galleryImages[selectedImage].url}?width=2000 2000w
                    `}
                    sizes="(max-width: 640px) 100vw, (max-width: 1536px) 80vw, 1200px"
                    alt={galleryImages[selectedImage].caption}
                    className="w-full max-h-[80vh] object-contain rounded-lg"
                    loading="eager"
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('events.weather.typical_conditions', 'Typical Weather Conditions')}</h2>
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
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('events.equipment.equipment_provided', 'Equipment Provided')}</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
              {/* Safety First Section */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <Shield className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{t('events.equipment.safety_first', 'Safety First')}</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {t('events.equipment.safety_description', 'All safety equipment meets international standards. Our boats are regularly inspected and maintained to the highest standards. Every participant receives a comprehensive safety briefing before departure.')}
                </p>
              </div>

              {/* Premium Yachts Section */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <Anchor className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{t('events.equipment.premium_yachts', 'Premium Yachts')}</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {t('events.equipment.premium_yachts_desc', 'We use modern J-70/J-80 high-performance yachts. These boats are specifically chosen for their racing capabilities while maintaining comfort and safety for our participants.')}
                </p>
              </div>
            </div>

            {/* Yacht Image */}
            <div className="mb-12">
              <div className="relative rounded-2xl shadow-2xl overflow-hidden">
                <img
                  src="https://i.postimg.cc/4yPg3hqp/temp-Image-Awvj-Tb.avif"
                  srcSet="
                    https://i.postimg.cc/4yPg3hqp/temp-Image-Awvj-Tb.avif?width=800 800w,
                    https://i.postimg.cc/4yPg3hqp/temp-Image-Awvj-Tb.avif?width=1200 1200w,
                    https://i.postimg.cc/4yPg3hqp/temp-Image-Awvj-Tb.avif 1600w
                  "
                  sizes="(max-width: 768px) 100vw, 1200px"
                  alt={t('events.equipment.professional_j70_yacht', 'Professional J-70/J-80 Racing Yacht')}
                  className="w-full h-96 object-cover"
                  loading="lazy"
                  width="1200"
                  height="384"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-white text-center font-semibold">{t('events.equipment.professional_j70_yacht', 'Professional J-70/J-80 Racing Yacht')}</p>
                </div>
              </div>
            </div>

            {/* Equipment List */}
            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('events.equipment.complete_list', 'Complete Equipment List')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{t('events.equipment.racing_yacht', 'Professional racing yacht (J-70/J-80)')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{t('events.equipment.safety_equipment', 'All safety equipment (life jackets, water)')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{t('events.equipment.sailing_gear', 'Professional sailing gear')}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{t('events.equipment.first_aid', 'First aid kit and emergency equipment')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{t('events.equipment.photo_equipment', 'Professional photography equipment')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{t('events.equipment.medals_certificates', 'Racing medals and certificates')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ */}
        {activeTab === 'faq' && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('events.faq.frequently_asked', 'Frequently Asked Questions')}</h2>
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