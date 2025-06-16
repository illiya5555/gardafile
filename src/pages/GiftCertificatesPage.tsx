import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Star, Heart, Calendar, Users, Award, CheckCircle, Phone, Mail, CreditCard, Download } from 'lucide-react';

const GiftCertificatesPage = () => {
  const [selectedAmount, setSelectedAmount] = useState('195');
  const [customAmount, setCustomAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  const predefinedAmounts = [
    { value: '195', label: '€195', description: 'Single sailing experience' },
    { value: '390', label: '€390', description: 'Couple sailing experience' },
    { value: '585', label: '€585', description: 'Family experience (3 people)' },
    { value: '780', label: '€780', description: 'Group experience (4 people)' },
    { value: 'custom', label: 'Custom', description: 'Choose your own amount' }
  ];

  const giftIdeas = [
    {
      title: "Birthday Gift",
      description: "Celebrate a special birthday with an unforgettable sailing adventure",
      icon: "🎂",
      occasions: ["Birthday", "Milestone Birthday", "Sweet 16"]
    },
    {
      title: "Anniversary Gift",
      description: "Create romantic memories on the beautiful waters of Lake Garda",
      icon: "💕",
      occasions: ["Wedding Anniversary", "Dating Anniversary", "Engagement"]
    },
    {
      title: "Corporate Gift",
      description: "Show appreciation to employees, clients, or business partners",
      icon: "🏢",
      occasions: ["Employee Recognition", "Client Appreciation", "Business Milestone"]
    },
    {
      title: "Holiday Gift",
      description: "Perfect for Christmas, Valentine's Day, or any special holiday",
      icon: "🎁",
      occasions: ["Christmas", "Valentine's Day", "Easter", "New Year"]
    },
    {
      title: "Graduation Gift",
      description: "Celebrate achievements with an adventure they'll never forget",
      icon: "🎓",
      occasions: ["High School Graduation", "College Graduation", "PhD Defense"]
    },
    {
      title: "Retirement Gift",
      description: "Start the next chapter with an exciting new experience",
      icon: "🌅",
      occasions: ["Retirement Party", "Career Change", "New Beginnings"]
    }
  ];

  const handlePurchase = () => {
    const amount = selectedAmount === 'custom' ? customAmount : selectedAmount;
    if (!amount || !recipientName || !recipientEmail || !senderName) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Here would be payment processing integration
    alert('Gift certificate purchase functionality will be implemented with payment system integration');
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-900 to-primary-900 text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(https://i.postimg.cc/1XvDrJbX/image.png)' }}
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif">
            🎁 Gift Certificates
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
            Perfect gift for sailing enthusiasts. Give the gift of an unforgettable 
            yacht racing experience on beautiful Lake Garda.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Instant Digital Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Valid for 2 Years</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Flexible Booking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Gift Certificate Purchase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Purchase Form */}
            <div className="bg-gray-50 p-8 rounded-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Purchase Gift Certificate</h2>
              
              {/* Amount Selection */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Amount</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {predefinedAmounts.map((amount) => (
                    <button
                      key={amount.value}
                      onClick={() => setSelectedAmount(amount.value)}
                      className={`p-4 rounded-lg border-2 text-left transition-all duration-300 ${
                        selectedAmount === amount.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{amount.label}</div>
                      <div className="text-sm text-gray-600">{amount.description}</div>
                    </button>
                  ))}
                </div>
                
                {selectedAmount === 'custom' && (
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Custom Amount (€)
                    </label>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter amount"
                      min="50"
                    />
                  </div>
                )}
              </div>

              {/* Recipient Information */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Recipient Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Recipient Email *
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Sender Information */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Personal Message (Optional)
                    </label>
                    <textarea
                      value={personalMessage}
                      onChange={(e) => setPersonalMessage(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Add a personal message to make this gift extra special..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Delivery Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Leave empty for immediate delivery
                    </p>
                  </div>
                </div>
              </div>

              {/* Purchase Button */}
              <button
                onClick={handlePurchase}
                className="w-full bg-primary-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
              >
                <CreditCard className="h-5 w-5" />
                <span>
                  Purchase Gift Certificate - €{selectedAmount === 'custom' ? customAmount || '0' : selectedAmount}
                </span>
              </button>
            </div>

            {/* Gift Certificate Preview */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-blue-600 to-primary-600 p-8 rounded-2xl text-white shadow-2xl">
                <div className="text-center mb-6">
                  <Gift className="h-16 w-16 mx-auto mb-4 text-gold-300" />
                  <h3 className="text-2xl font-bold mb-2">Garda Racing Yacht Club</h3>
                  <p className="text-white/80">Gift Certificate</p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gold-300 mb-2">
                      €{selectedAmount === 'custom' ? customAmount || '0' : selectedAmount}
                    </div>
                    <p className="text-white/80">Yacht Racing Experience</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/80">To:</span>
                    <span>{recipientName || 'Recipient Name'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">From:</span>
                    <span>{senderName || 'Your Name'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Valid Until:</span>
                    <span>{new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                  </div>
                </div>

                {personalMessage && (
                  <div className="mt-6 p-4 bg-white/10 rounded-lg">
                    <p className="text-sm italic">"{personalMessage}"</p>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="bg-gray-50 p-6 rounded-2xl">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Included</h3>
                <div className="space-y-3">
                  {[
                    'Professional yacht racing experience',
                    'Certified skipper and instruction',
                    'All safety equipment provided',
                    'Racing medal and certificate',
                    'Professional photography',
                    'Flexible booking (subject to availability)',
                    'Valid for 2 years from purchase date'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gift Ideas */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Perfect Gift Ideas</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A sailing experience makes an unforgettable gift for any occasion. 
              Here are some popular reasons our customers choose gift certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {giftIdeas.map((idea, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-3">{idea.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{idea.title}</h3>
                  <p className="text-gray-600">{idea.description}</p>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-500 mb-2">Perfect for:</p>
                  <div className="flex flex-wrap gap-2">
                    {idea.occasions.map((occasion, idx) => (
                      <span key={idx} className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs">
                        {occasion}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to give the perfect gift</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: 1,
                title: "Choose Amount",
                description: "Select from preset amounts or choose a custom value",
                icon: CreditCard
              },
              {
                step: 2,
                title: "Personalize",
                description: "Add recipient details and a personal message",
                icon: Heart
              },
              {
                step: 3,
                title: "Purchase",
                description: "Secure payment processing with instant confirmation",
                icon: CheckCircle
              },
              {
                step: 4,
                title: "Deliver",
                description: "Digital certificate sent via email immediately or on chosen date",
                icon: Download
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "How long are gift certificates valid?",
                answer: "All gift certificates are valid for 2 years from the date of purchase, giving recipients plenty of time to plan their sailing adventure."
              },
              {
                question: "Can gift certificates be used for any sailing experience?",
                answer: "Yes, gift certificates can be applied to any of our sailing experiences, including individual bookings and corporate events."
              },
              {
                question: "What if the experience costs more than the gift certificate value?",
                answer: "Recipients can pay the difference when booking. If the experience costs less, the remaining balance stays on the certificate for future use."
              },
              {
                question: "Can I get a refund on a gift certificate?",
                answer: "Gift certificates are non-refundable, but they can be transferred to another person if needed."
              },
              {
                question: "How will the recipient receive the gift certificate?",
                answer: "Gift certificates are delivered digitally via email as a beautifully designed PDF that can be printed or shared electronically."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Need Help with Your Gift Certificate?</h2>
          <p className="text-xl text-white/90 mb-8">
            Our team is here to help you create the perfect gift experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+393447770077"
              className="flex items-center justify-center space-x-2 bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300"
            >
              <Phone className="h-5 w-5" />
              <span>Call +39 344 777 00 77</span>
            </a>
            <a
              href="mailto:gifts@gardaracing.com"
              className="flex items-center justify-center space-x-2 bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-all duration-300"
            >
              <Mail className="h-5 w-5" />
              <span>gifts@gardaracing.com</span>
            </a>
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

export default GiftCertificatesPage;