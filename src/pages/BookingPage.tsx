import React, { useState } from 'react';
import { Calendar, Users, CreditCard, Shield, Clock, CheckCircle, AlertCircle, Phone, Mail } from 'lucide-react';

const BookingPage = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [participants, setParticipants] = useState(1);
  const [bookingStep, setBookingStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
    agreeTerms: false,
    agreeMarketing: false
  });

  const timeSlots = [
    { time: '08:30', available: true, price: 199 },
    { time: '09:00', available: true, price: 199 },
    { time: '13:30', available: false, price: 199 },
    { time: '14:00', available: true, price: 199 }
  ];

  const totalPrice = participants * 199;
  const deposit = Math.round(totalPrice * 0.3);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleNextStep = () => {
    if (bookingStep < 3) {
      setBookingStep(bookingStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1);
    }
  };

  const isStepValid = () => {
    switch (bookingStep) {
      case 1:
        return selectedDate && selectedTime && participants > 0;
      case 2:
        return formData.firstName && formData.lastName && formData.email && formData.phone && formData.agreeTerms;
      default:
        return true;
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">
            Book Your Racing Experience
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Secure your spot for an unforgettable day of yacht racing on Lake Garda
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: 'Select Date & Time', icon: Calendar },
              { step: 2, title: 'Your Details', icon: Users },
              { step: 3, title: 'Payment', icon: CreditCard }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors duration-300 ${
                  bookingStep >= item.step
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {bookingStep > item.step ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <item.icon className="h-6 w-6" />
                  )}
                </div>
                <div className="ml-4 hidden sm:block">
                  <p className={`font-semibold ${bookingStep >= item.step ? 'text-primary-600' : 'text-gray-400'}`}>
                    Step {item.step}
                  </p>
                  <p className={`text-sm ${bookingStep >= item.step ? 'text-gray-900' : 'text-gray-500'}`}>
                    {item.title}
                  </p>
                </div>
                {index < 2 && (
                  <div className={`hidden sm:block w-24 h-1 mx-4 rounded ${
                    bookingStep > item.step ? 'bg-primary-600' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Step 1: Date & Time Selection */}
              {bookingStep === 1 && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Your Experience</h2>
                  
                  {/* Date Selection */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">Choose Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                    />
                  </div>

                  {/* Time Selection */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">Choose Time Slot</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                            selectedTime === slot.time
                              ? 'border-primary-600 bg-primary-50 text-primary-600'
                              : slot.available
                              ? 'border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                              : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="text-xl font-semibold">{slot.time}</div>
                          <div className="text-sm">
                            {slot.available ? `€${slot.price} per person` : 'Fully booked'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Participants */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">Number of Participants</label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setParticipants(Math.max(1, participants - 1))}
                        className="w-12 h-12 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-300 flex items-center justify-center text-xl font-semibold"
                      >
                        -
                      </button>
                      <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
                        {participants}
                      </span>
                      <button
                        onClick={() => setParticipants(Math.min(8, participants + 1))}
                        className="w-12 h-12 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-300 flex items-center justify-center text-xl font-semibold"
                      >
                        +
                      </button>
                      <span className="text-gray-600 ml-4">Maximum 8 people per boat</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Personal Details */}
              {bookingStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Special Requests</label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Any dietary requirements, accessibility needs, or special occasions..."
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleInputChange}
                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        required
                      />
                      <label className="text-sm text-gray-700">
                        I agree to the <a href="#" className="text-primary-600 hover:underline">Terms & Conditions</a> and <a href="#" className="text-primary-600 hover:underline">Cancellation Policy</a> *
                      </label>
                    </div>
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        name="agreeMarketing"
                        checked={formData.agreeMarketing}
                        onChange={handleInputChange}
                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="text-sm text-gray-700">
                        I would like to receive updates about special offers and new experiences
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {bookingStep === 3 && (
                <div className="space-y-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Secure Payment</h2>
                  
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-2">Secure Payment Processing</h3>
                        <p className="text-blue-800 text-sm">
                          Your payment is processed securely through Stripe. We never store your card details.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">CVC</label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="bg-green-50 p-6 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-green-900 mb-2">What happens after booking?</h3>
                        <ul className="text-green-800 text-sm space-y-1">
                          <li>• Instant confirmation email with all details</li>
                          <li>• Meeting point and contact information</li>
                          <li>• Weather updates 24 hours before</li>
                          <li>• Professional photos delivered within 24 hours</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handlePrevStep}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-300 ${
                    bookingStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  disabled={bookingStep === 1}
                >
                  Previous
                </button>
                
                {bookingStep < 3 ? (
                  <button
                    onClick={handleNextStep}
                    disabled={!isStepValid()}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                      isStepValid()
                        ? 'bg-primary-600 text-white hover:bg-primary-700 hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 hover:scale-105"
                  >
                    Complete Booking
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-32">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h3>
              
              <div className="space-y-4 mb-6">
                {selectedDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">{new Date(selectedDate).toLocaleDateString()}</span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold">{selectedTime}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Participants:</span>
                  <span className="font-semibold">{participants}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price per person:</span>
                  <span className="font-semibold">€199</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary-600">€{totalPrice}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Pay €{deposit} deposit now, €{totalPrice - deposit} on the day
                </p>
              </div>

              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Professional skipper included</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>All safety equipment provided</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Racing medal & certificate</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Professional photos & videos</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                  <Clock className="h-4 w-4" />
                  <span>Free cancellation up to 48 hours before</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="h-4 w-4" />
                  <span>Fully insured and certified</span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-primary-50 rounded-2xl p-6 mt-6">
              <h4 className="font-semibold text-gray-900 mb-4">Need Help?</h4>
              <div className="space-y-3">
                <a
                  href="tel:+393456789012"
                  className="flex items-center space-x-3 text-primary-600 hover:text-primary-700 transition-colors duration-300"
                >
                  <Phone className="h-4 w-4" />
                  <span>+39 345 678 9012</span>
                </a>
                <a
                  href="mailto:info@gardaracing.com"
                  className="flex items-center space-x-3 text-primary-600 hover:text-primary-700 transition-colors duration-300"
                >
                  <Mail className="h-4 w-4" />
                  <span>info@gardaracing.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Policies Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancellation Policy</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Free cancellation up to 48 hours before departure</li>
                <li>• 50% refund for cancellations 24-48 hours before</li>
                <li>• No refund for cancellations less than 24 hours</li>
                <li>• Weather cancellations: full refund or reschedule</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What to Bring</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Comfortable clothes and change of clothes</li>
                <li>• Sunscreen and hat</li>
                <li>• Non-slip shoes (we provide sailing boots)</li>
                <li>• Camera (waterproof case recommended)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;