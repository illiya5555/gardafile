import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Award, Camera, Shield, Clock, CheckCircle, Star, MapPin, Phone, Mail, Calendar } from 'lucide-react';

const CorporateSailingPage = () => {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-900 to-primary-900 text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(https://i.postimg.cc/JhjJ21S9/Boas-1775.jpg)' }}
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif">
            🧭 Corporate Sailing Regatta on Lake Garda
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
            We offer a unique team-building program through participation in a real sailing regatta.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  In just one day, your team becomes a true crew: participants are divided into teams, 
                  receive instructions, train under the guidance of professional skippers, and compete 
                  in a yacht race on J/70 class sports boats.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  This is more than just fun — it's a model of modern business: teamwork, rapid 
                  decision-making, strategy, trust, and adrenaline.
                </p>
              </div>

              {/* Program Includes */}
              <div className="bg-blue-50 p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">⚓ The program includes:</h2>
                <div className="space-y-4">
                  {[
                    'Theoretical briefing on shore',
                    'Practical training on board',
                    'Full sailing regatta (3–5 races)',
                    'Professional skippers on every yacht',
                    'Supervision by a judging team and technical support boats',
                    'Individual life vests for all participants'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional Extras */}
              <div className="bg-gold-50 p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">🎁 Optional extras:</h2>
                <div className="space-y-3">
                  {[
                    'Branded teamwear (caps, jackets, polo shirts, T-shirts)',
                    'Yacht branding with your company logo (stickers on both sides)',
                    'Professional photo and video coverage',
                    'Prizes for the winning team',
                    'Closing dinner with music and a relaxed atmosphere',
                    'Hotel accommodation near the yacht club',
                    'Transfers from Verona / Milan airports',
                    'Guided tours and custom experiences around Lake Garda'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="text-gold-600 font-bold">–</span>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Benefits & CTA */}
            <div className="space-y-8">
              {/* What Your Team Gets */}
              <div className="bg-primary-50 p-8 rounded-2xl">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">💡 What your team gets:</h2>
                <div className="space-y-4">
                  {[
                    { icon: '🔹', text: 'A bright and unifying emotional experience' },
                    { icon: '🔹', text: 'New skills in communication and fast decision-making under pressure' },
                    { icon: '🔹', text: 'A true sense of teamwork and engagement' },
                    { icon: '🔹', text: 'Informal connections and real networking' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="text-primary-600 text-xl">{item.icon}</span>
                      <span className="text-gray-700">{item.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-white rounded-lg border-l-4 border-primary-600">
                  <p className="text-gray-700 italic">
                    "On the water, it's actions that matter — and your team will feel it firsthand."
                  </p>
                </div>
              </div>

              {/* Gallery */}
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Corporate sailing team"
                  className="rounded-xl shadow-lg w-full h-48 object-cover"
                />
                <img
                  src="https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Team building on yacht"
                  className="rounded-xl shadow-lg w-full h-48 object-cover"
                />
                <img
                  src="https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Lake Garda sailing"
                  className="rounded-xl shadow-lg w-full h-48 object-cover"
                />
                <img
                  src="https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Award ceremony"
                  className="rounded-xl shadow-lg w-full h-48 object-cover"
                />
              </div>

              {/* Contact CTA */}
              <div className="bg-gradient-to-br from-blue-600 to-primary-600 p-8 rounded-2xl text-white">
                <h3 className="text-2xl font-bold mb-4">Ready to organize your corporate regatta?</h3>
                <p className="text-white/90 mb-6">
                  Contact us for a personalized quote and detailed program planning.
                </p>
                <div className="space-y-4">
                  <a
                    href="tel:+393447770077"
                    className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg hover:bg-white/30 transition-all duration-300"
                  >
                    <Phone className="h-5 w-5" />
                    <span>+39 344 777 00 77</span>
                  </a>
                  <a
                    href="mailto:corporate@gardaracing.com"
                    className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg hover:bg-white/30 transition-all duration-300"
                  >
                    <Mail className="h-5 w-5" />
                    <span>corporate@gardaracing.com</span>
                  </a>
                  <Link
                    to="/contact"
                    className="flex items-center justify-center space-x-3 bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300"
                  >
                    <Calendar className="h-5 w-5" />
                    <span>Request Quote</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Choose Our Corporate Sailing Program?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: "Team Building",
                description: "Strengthen bonds through shared challenges and victories on the water"
              },
              {
                icon: Award,
                title: "Professional Organization",
                description: "Experienced event coordinators ensure seamless execution"
              },
              {
                icon: Camera,
                title: "Memorable Documentation",
                description: "Professional photography and videography capture every moment"
              },
              {
                icon: Shield,
                title: "Safety First",
                description: "Fully insured with certified skippers and safety equipment"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Back to Services */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            to="/services"
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium transition-colors duration-300"
          >
            <span>← Back to Services</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CorporateSailingPage;