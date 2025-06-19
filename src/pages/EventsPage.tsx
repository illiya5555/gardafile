мне нужно чтоб ты интегрировал этот блок вместо существующего блока в этом коде:
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, Users, Award, Camera, Wind, Anchor, MapPin, CheckCircle, Star, Calendar } from 'lucide-react';

const EventsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedImage, setSelectedImage] = useState(null);

  const galleryImages = [
  {
    url: "https://i.postimg.cc/65HKJndX/temp-Image-WZ1-EPq.avif",
    caption: "Garda Yacht Racing 1"
  },
  {
    url: "https://i.postimg.cc/4yPg3hqp/temp-Image-Awvj-Tb.avif",
    caption: "Garda Yacht Racing 2"
  },
  {
    url: "https://i.postimg.cc/d1MvNFGZ/temp-Image66m3b-Q.avif",
    caption: "Garda Yacht Racing 3"
  },
  {
    url: "https://i.postimg.cc/m2Z4581j/temp-Image3ioz3-A.avif",
    caption: "Garda Yacht Racing 4"
  },
  {
    url: "https://i.postimg.cc/025gWBpM/temp-Image-S31m-Ms.avif",
    caption: "Garda Yacht Racing 5"
  },
  {
    url: "https://i.postimg.cc/ZqnKGqpN/temp-Image-GC3d-NH.avif",
    caption: "Garda Yacht Racing 6"
  },
  {
    url: "https://i.postimg.cc/RZRWr8Yk/temp-Image7-PJCLf.avif",
    caption: "Garda Yacht Racing 7"
  }
];

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

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-900 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif">
                The Complete Racing Experience
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                From beginner to champion in one day. Experience authentic yacht racing 
                on Lake Garda with professional instruction, competitive races, and 
                official recognition of your achievement.
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
                Book Your Experience - €195
              </Link>
            </div>
            <div className="relative">
              <img
                src={galleryImages[selectedImage].url}
                alt={galleryImages[selectedImage].caption}
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                <p className="text-white text-center">{galleryImages[selectedImage].caption}</p>
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
            ].map((tab) => (
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
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl w-full px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={galleryImages[selectedImage].url}
              alt={galleryImages[selectedImage].caption}
              className="max-h-[80vh] w-full object-contain rounded-xl shadow-lg"
            />
            <p className="text-white text-center mt-4">
              {galleryImages[selectedImage].caption}
            </p>

            {/* Prev */}
            {selectedImage > 0 && (
              <button
                onClick={() => setSelectedImage(selectedImage - 1)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full"
              >
                ‹
              </button>
            )}

            {/* Next */}
            {selectedImage < galleryImages.length - 1 && (
              <button
                onClick={() => setSelectedImage(selectedImage + 1)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full"
              >
                ›
              </button>
            )}

            {/* Close */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/40 p-2 rounded-full"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>
      )}


        {/* Weather */}
        {activeTab === 'weather' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Weather Conditions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {weatherConditions.map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                  <item.icon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.condition}</h3>
                  <p className="text-2xl font-bold text-primary-600">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 p-8 rounded-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Lake Garda is Perfect for Sailing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Consistent Winds</h4>
                  <p className="text-gray-700 mb-4">
                    Lake Garda enjoys reliable thermal winds that develop daily, creating perfect sailing conditions. 
                    The morning "Peler" wind from the north and afternoon "Ora" wind from the south provide 
                    consistent sailing throughout the day.
                  </p>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Protected Waters</h4>
                  <p className="text-gray-700 mb-4">
                    Surrounded by mountains, Lake Garda offers protected waters that are ideal for learning 
                    and racing. The lake's size provides enough space for proper racing while maintaining 
                    safe conditions for all skill levels.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Equipment */}
        {activeTab === 'equipment' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Equipment Provided</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">What's Included</h3>
                <div className="space-y-4">
                  {equipment.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-6 bg-gold-50 rounded-xl">
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Premium Yachts</h4>
                  <p className="text-gray-700">
                    We use modern J-70/J-80 high-performance yachts. 
                    These boats are specifically chosen for their racing capabilities while 
                    maintaining comfort and safety for our participants.
                  </p>
                </div>
              </div>
              <div>
                <img
                  src="https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Professional sailing equipment"
                  className="rounded-xl shadow-lg w-full h-96 object-cover"
                />
                <div className="mt-6 p-6 bg-primary-50 rounded-xl">
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Safety First</h4>
                  <p className="text-gray-700">
                    All safety equipment meets international standards. Our boats are regularly 
                    inspected and maintained to the highest standards. Every participant receives 
                    a comprehensive safety briefing before departure.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ */}
        {activeTab === 'faq' && (
          <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
            <div className="max-w-4xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-6">Still have questions? We're here to help!</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
  href="https://wa.me/393447770077"
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center justify-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300"
>
  <span>WhatsApp</span>
</a>
                        <a
                  href="https://t.me/VETER_ITA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors duration-300"
                  style={{ backgroundColor: '#0088cc', color: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#006699'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0088cc'}
                >
                  <span>💬</span>
                  <span>Telegram</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Racing?</h2>
          <p className="text-xl text-white/90 mb-8">
            Book your yacht racing experience today and create memories that will last a lifetime.
          </p>
          <Link
            to="/booking"
            className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg inline-block"
          >
            Book Now - €195 per person
          </Link>
        </div>
      </section>
    </div>
  );
};

export default EventsPage;