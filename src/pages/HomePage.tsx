import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Award, Camera, MapPin, Star, Wind, Anchor, Trophy, Shield, Clock, CheckCircle } from 'lucide-react';
import { supabase, Testimonial, testConnection } from '../lib/supabase';

const HomePage = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [connectionError, setConnectionError] = useState(false);

  // Experience section gallery images
  const experienceImages = [
    'https://i.postimg.cc/4yPg3hqp/temp-Image-Awvj-Tb.avif',
    'https://i.postimg.cc/m2Z4581j/temp-Image3ioz3-A.avif',
    'https://i.postimg.cc/65HKJndX/temp-Image-WZ1-EPq.avif',
    'https://i.postimg.cc/65HKJndX/temp-Image-WZ1-EPq.avif'
  ];

  // Location section gallery images - Lake Garda specific
  const locationImages = [
    'https://i.postimg.cc/mrC0JcY3/temp-Image-M1-LFin.avif',
    'https://i.postimg.cc/FszwmCbH/temp-Image-Akge-BH.avif',
    'https://i.postimg.cc/C5LXRmWJ/temp-Imageb-Td-UOY.avif'
  ];

  const [experienceImageIndex, setExperienceImageIndex] = useState(0);
  const [locationImageIndex, setLocationImageIndex] = useState(0);

  // Fallback testimonials
  const fallbackTestimonials: Testimonial[] = [
    {
      id: '1',
      name: "Marco Rossi",
      location: "Munich, Germany",
      rating: 5,
      text: "Incredible experience! The professional skipper made us feel safe while we enjoyed the thrill of racing. The photos they took are amazing memories.",
      image_url: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      is_featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: "Sarah Johnson",
      location: "London, UK",
      rating: 5,
      text: "Perfect day on Lake Garda! No sailing experience needed - they taught us everything. The medal ceremony was a nice touch. Highly recommended!",
      image_url: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      is_featured: true,
      created_at: new Date().toISOString()
    },
    {
      id: '3',
      name: "Andreas Mueller",
      location: "Vienna, Austria",
      rating: 5,
      text: "Brought our corporate team here for a unique experience. Everyone loved it! Great organization, beautiful location, and unforgettable memories.",
      image_url: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop",
      is_featured: true,
      created_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Auto-rotate experience images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setExperienceImageIndex((prevIndex) => 
        (prevIndex + 1) % experienceImages.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [experienceImages.length]);

  // Auto-rotate location images every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLocationImageIndex((prevIndex) => 
        (prevIndex + 1) % locationImages.length
      );
    }, 6000);

    return () => clearInterval(interval);
  }, [locationImages.length]);

  const fetchTestimonials = async () => {
    try {
      // First test the connection
      const isConnected = await testConnection();
      if (!isConnected) {
        console.warn('Supabase connection failed, using fallback testimonials');
        setConnectionError(true);
        setTestimonials(fallbackTestimonials);
        return;
      }

      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching testimonials:', error);
        throw error;
      }

      if (data && data.length > 0) {
        setTestimonials(data);
        setConnectionError(false);
      } else {
        // No testimonials found in database, use fallback
        console.log('No testimonials found in database, using fallback');
        setTestimonials(fallbackTestimonials);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setConnectionError(true);
      // Use fallback testimonials when database fails
      setTestimonials(fallbackTestimonials);
    }
  };

  const features = [
    {
      icon: Trophy,
      title: "Real Racing Format",
      description: "Authentic yacht regatta with team dynamics, medals, and true competition."
    },
    {
      icon: Users,
      title: "Professional Skipper",
      description: "Certified and experienced sailing captains on every boat."
    },
    {
      icon: Camera,
      title: "Photo & Video",
      description: "Professional photos and videos of your race day to remember and share."
    },
    {
      icon: Shield,
      title: "Fully Insured",
      description: "Complete safety coverage and modern equipment included."
    },
    {
      icon: Star,
      title: "Accessible & Premium",
      description: "A top-level regatta experience open to everyone — no experience needed."
    }
  ];

  const partners = [
    {
      name: "Bavaria Yachts",
      logo: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop",
      description: "Premium yacht manufacturer"
    },
    {
      name: "Garmin Marine",
      logo: "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop",
      description: "Navigation technology"
    },
    {
      name: "Helly Hansen",
      logo: "https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop",
      description: "Professional sailing gear"
    },
    {
      name: "Musto Sailing",
      logo: "https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop",
      description: "Technical sailing clothing"
    },
    {
      name: "Raymarine",
      logo: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop",
      description: "Marine electronics"
    },
    {
      name: "Spinlock",
      logo: "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop",
      description: "Safety equipment"
    }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section with Background Video */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Video */}
        <div className="absolute inset-0">
          <iframe
            src="https://www.youtube.com/embed/Y7sRZOTsXbQ?autoplay=1&mute=1&loop=1&playlist=Y7sRZOTsXbQ&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1&fs=0&cc_load_policy=0&playsinline=1&autohide=1"
            title="Sailing Video Background"
            className="w-full h-full object-cover"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100vw',
              height: '56.25vw', // 16:9 aspect ratio
              minHeight: '100vh',
              minWidth: '177.78vh', // 16:9 aspect ratio
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen={false}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-800/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-slide-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-serif">
              Experience the Thrill of
              <span className="block text-gold-300">Yacht Racing</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Daily yacht racing experiences in world-famous Lake Garda with professional skippers, 
              racing medals, and unforgettable memories
            </p>
            
            {/* Price & CTA */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 max-w-md mx-auto border border-white/20">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-gold-300 mb-2">€195</div>
                <p className="text-white/80">per person • Full day experience</p>
              </div>
              
              <div className="space-y-3 mb-6 text-left">
                <div className="flex items-center space-x-3 text-white/90">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span>Real yacht racing format</span>
                </div>
                <div className="flex items-center space-x-3 text-white/90">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span>Professional skipper on every boat</span>
                </div>
                <div className="flex items-center space-x-3 text-white/90">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span>Open to all skill levels – no experience needed</span>
                </div>
                <div className="flex items-center space-x-3 text-white/90">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span>Professional photos & videos from the race</span>
                </div>
                <div className="flex items-center space-x-3 text-white/90">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <span>All equipment provided</span>
                </div>
              </div>
              
              <Link
                to="/booking"
                className="w-full bg-primary-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-lg inline-block"
              >
                Book Your Adventure
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-serif">
              Why Choose Garda Racing?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide the complete yacht racing experience with professional guidance, 
              premium equipment, and memories that last a lifetime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.slice(0, 4).map((feature, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="bg-primary-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-100 transition-colors duration-300">
                  <feature.icon className="h-10 w-10 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Fifth feature centered below */}
          <div className="flex justify-center mt-12">
            <div className="text-center group hover:scale-105 transition-transform duration-300 max-w-sm">
              <div className="bg-primary-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-100 transition-colors duration-300">
                {(() => {
                  const IconComponent = features[4].icon;
                  return <IconComponent className="h-10 w-10 text-primary-600" />;
                })()}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{features[4].title}</h3>
              <p className="text-gray-600 leading-relaxed">{features[4].description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Preview with Auto-rotating Images */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-serif">
                Your Perfect Day on Lake Garda
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Morning Briefing</h3>
                    <p className="text-gray-600">Meet your professional skipper and learn the basics of yacht racing in a relaxed, friendly environment.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Racing Experience</h3>
                    <p className="text-gray-600">Participate in authentic yacht races with other boats, experiencing the thrill of competition on beautiful Lake Garda.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Medal Ceremony</h3>
                    <p className="text-gray-600">Celebrate your achievement with an official medal ceremony and receive your personalized racing certificate.</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <Link
                  to="/events"
                  className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-lg inline-block"
                >
                  Learn More About the Experience
                </Link>
              </div>
            </div>
            <div className="relative">
              {/* Auto-rotating experience images */}
              <div className="relative rounded-2xl shadow-2xl overflow-hidden">
                {experienceImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Yacht racing experience ${index + 1}`}
                    className={`w-full h-96 object-cover transition-opacity duration-1000 ${
                      index === experienceImageIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'
                    }`}
                  />
                ))}
              </div>
              
              {/* Image indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {experienceImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setExperienceImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === experienceImageIndex 
                        ? 'bg-white scale-110' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-serif">
              What Our Sailors Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied customers who've experienced the magic of Lake Garda racing
            </p>
            {connectionError && (
              <p className="text-sm text-amber-600 mt-2">
                Currently showing sample testimonials - database connection unavailable
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-gold-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center space-x-4">
                  {testimonial.image_url && (
                    <img
                      src={testimonial.image_url}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section with Auto-rotating Gallery */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif">
                Prime Location in Riva del Garda
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-gold-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Easy Access from Munich</h3>
                    <p className="text-white/80">Just 4 hours drive from Munich, making it perfect for weekend getaways and corporate events.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Anchor className="h-6 w-6 text-gold-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">World-Class Sailing Conditions</h3>
                    <p className="text-white/80">Lake Garda offers consistent winds and stunning Alpine scenery, making it Europe's premier sailing destination.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-gold-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Daily Departures</h3>
                    <p className="text-white/80">Multiple time slots available daily from March to October, with flexible booking options.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              {/* Auto-rotating location images */}
              <div className="relative rounded-2xl shadow-2xl overflow-hidden">
                {locationImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Lake Garda location ${index + 1}`}
                    className={`w-full h-96 object-cover transition-opacity duration-1000 ${
                      index === locationImageIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'
                    }`}
                  />
                ))}
              </div>
              
              {/* Image indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {locationImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setLocationImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === locationImageIndex 
                        ? 'bg-white scale-110' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
              
              <div className="absolute -top-6 -right-6 bg-gold-500 text-white p-4 rounded-xl shadow-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold">4.9★</p>
                  <p className="text-sm">Google Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 font-serif">
              Our Trusted Partners
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We work with the world's leading yacht and marine equipment manufacturers 
              to provide you with the best possible sailing experience.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {partners.map((partner, index) => (
              <div key={index} className="group text-center">
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-105">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="w-full h-16 object-cover rounded-lg mb-4 grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                  <h3 className="font-semibold text-gray-900 mb-1">{partner.name}</h3>
                  <p className="text-sm text-gray-600">{partner.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6">
              Interested in partnering with us? We're always looking for quality brands that share our passion for sailing.
            </p>
            <Link
              to="/contact"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-300 inline-block"
            >
              Contact Us About Partnerships
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif">
            Ready for Your Sailing Adventure?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join us for an unforgettable day of yacht racing on Lake Garda. 
            No experience necessary - just bring your sense of adventure!
          </p>
          <Link
            to="/booking"
            className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Book Now - €195
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;