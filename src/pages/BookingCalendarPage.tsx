import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CreditCard, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Euro, User, Mail, Phone, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCalendarSync } from '../hooks/useCalendarSync';
import UnifiedCalendar from '../components/calendar/UnifiedCalendar';

interface BookingData {
  date: string;
  time: string;
  participants: number;
  total_price: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  card_number: string;
  card_expiry: string;
  card_cvv: string;
}

const BookingCalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [participants, setParticipants] = useState(1);
  const [step, setStep] = useState(1); // 1: Calendar, 2: Time, 3: Details, 4: Payment
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({});

  const { getActiveTimeSlotsForDate, isDateAvailable, loading: calendarLoading, error: calendarError } = useCalendarSync();

  // Show loading state while calendar data is being fetched
  if (calendarLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading calendar data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if calendar data failed to load
  if (calendarError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load calendar</h2>
              <p className="text-gray-600 mb-4">There was an error loading the booking calendar. Please try refreshing the page.</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const calculateTotalPrice = () => {
    const selectedSlot = getActiveTimeSlotsForDate(selectedDate).find(slot => 
      slot.time === selectedTime
    );
    // Safely handle null price_per_person by defaulting to 0
    const pricePerPerson = selectedSlot?.price_per_person ?? 0;
    return pricePerPerson * participants;
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time selection when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBookingSubmit = async () => {
    setLoading(true);
    
    try {
      // Validate required fields
      if (!bookingData.customer_name || !bookingData.customer_email || !bookingData.customer_phone) {
        throw new Error('Please fill in all required customer information');
      }

      if (!selectedDate || !selectedTime) {
        throw new Error('Please select date and time');
      }

      // Create booking object with all required fields
      const booking = {
        booking_date: selectedDate,
        time_slot: selectedTime,
        participants,
        total_price: calculateTotalPrice(),
        customer_name: bookingData.customer_name,
        customer_email: bookingData.customer_email,
        customer_phone: bookingData.customer_phone,
        status: 'confirmed',
        deposit_paid: 0,
        special_requests: null,
        user_id: null // Allow null for anonymous bookings
      };

      console.log('Submitting booking:', booking);

      // Save to database
      const { data, error } = await supabase
        .from('bookings')
        .insert(booking)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Booking created successfully:', data);
      alert('Booking successfully created! You will receive confirmation by email.');
      
      // Reset form
      setStep(1);
      setSelectedDate('');
      setSelectedTime('');
      setParticipants(1);
      setBookingData({});
      
    } catch (error: any) {
      console.error('Booking error:', error);
      alert('Error creating booking: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">
            Book Your Regatta Experience
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose a date and time for an unforgettable yacht racing experience on Lake Garda
          </p>
          <div className="mt-4 flex justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>4-hour experience</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Max 5 people per regatta</span>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: 'Select Date', icon: Calendar },
              { step: 2, title: 'Time & Participants', icon: Clock },
              { step: 3, title: 'Details', icon: Users },
              { step: 4, title: 'Payment', icon: CreditCard }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 ${
                  step >= item.step
                    ? 'bg-blue-600 border-blue-600 text-white scale-110'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {step > item.step ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <item.icon className="h-6 w-6" />
                  )}
                </div>
                <div className="ml-4 hidden sm:block">
                  <p className={`font-semibold transition-colors duration-300 ${step >= item.step ? 'text-blue-600' : 'text-gray-400'}`}>
                    Step {item.step}
                  </p>
                  <p className={`text-sm transition-colors duration-300 ${step >= item.step ? 'text-gray-900' : 'text-gray-500'}`}>
                    {item.title}
                  </p>
                </div>
                {index < 3 && (
                  <div className={`hidden sm:block w-24 h-1 mx-4 rounded transition-all duration-500 ${
                    step > item.step ? 'bg-blue-600' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              
              {/* Step 1: Calendar */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Date</h2>
                  
                  <UnifiedCalendar
                    mode="select"
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    className="border-0 shadow-none"
                  />

                  {selectedDate && (
                    <button
                      onClick={() => setStep(2)}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                    >
                      Select time and participants
                    </button>
                  )}
                </div>
              )}

              {/* Step 2: Time and Participants Selection */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Select time and participants</h2>
                    <button
                      onClick={() => setStep(1)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      ← Change date
                    </button>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800">
                      <strong>Selected date:</strong> {new Date(selectedDate).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Participants Selection */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      Number of participants
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setParticipants(Math.max(1, participants - 1))}
                        className="w-12 h-12 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-300 flex items-center justify-center text-xl font-semibold"
                      >
                        -
                      </button>
                      <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
                        {participants}
                      </span>
                      <button
                        onClick={() => {
                          // Get max participants from selected date's time slots, safely handle null values
                          const availableTimesForDate = getActiveTimeSlotsForDate(selectedDate);
                          const maxAllowed = availableTimesForDate.length > 0 
                            ? Math.min(...availableTimesForDate.map(slot => slot.max_participants ?? 5))
                            : 5;
                          setParticipants(Math.min(maxAllowed, participants + 1));
                        }}
                        className="w-12 h-12 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-300 flex items-center justify-center text-xl font-semibold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Available Time Slots */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Available regatta times</h3>
                    <div className="space-y-4">
                      {getActiveTimeSlotsForDate(selectedDate).map((slot) => {
                        // Safely handle null values
                        const pricePerPerson = slot.price_per_person ?? 0;
                        const maxParticipants = slot.max_participants ?? 5;
                        const totalPrice = pricePerPerson * participants;
                        const isSelected = selectedTime === slot.time;
                        const timeRange = slot.time;
                        const regattaName = timeRange.startsWith('08:30') || timeRange.startsWith('09:00') 
                          ? 'Morning Regatta' 
                          : 'Afternoon Regatta';

                        return (
                          <div
                            key={slot.id}
                            onClick={() => handleTimeSelect(slot.time)}
                            className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50 scale-105'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                  <Clock className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 text-lg">{regattaName}</h4>
                                  <p className="text-gray-600">
                                    {timeRange} (4 hours)
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Up to {maxParticipants} participants
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-blue-600">
                                  €{totalPrice}
                                </p>
                                <p className="text-sm text-gray-600">
                                  €{pricePerPerson} per person
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {getActiveTimeSlotsForDate(selectedDate).length === 0 && (
                        <div className="p-6 border-2 border-red-200 rounded-lg bg-red-50">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                            <div>
                              <h4 className="font-semibold text-red-900 mb-1">No available time slots</h4>
                              <p className="text-red-700">
                                There are no available time slots for this date. Please select another date.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedTime && (
                    <button
                      onClick={() => setStep(3)}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                    >
                      Continue
                    </button>
                  )}
                </div>
              )}

              {/* Step 3: Customer Details */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Your details</h2>
                    <button
                      onClick={() => setStep(2)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      ← Back
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={bookingData.customer_name || ''}
                          onChange={(e) => setBookingData({...bookingData, customer_name: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="John Smith"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          value={bookingData.customer_email || ''}
                          onChange={(e) => setBookingData({...bookingData, customer_email: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Phone *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          value={bookingData.customer_phone || ''}
                          onChange={(e) => setBookingData({...bookingData, customer_phone: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+39 345 678 9012"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {bookingData.customer_name && bookingData.customer_email && bookingData.customer_phone && (
                    <button
                      onClick={() => setStep(4)}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                    >
                      Proceed to payment
                    </button>
                  )}
                </div>
              )}

              {/* Step 4: Payment */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
                    <button
                      onClick={() => setStep(3)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      ← Back
                    </button>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-green-900 mb-2">Secure payment</h3>
                        <p className="text-green-800 text-sm">
                          Your data is protected by SSL encryption. We do not store credit card data.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Card Number *
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={bookingData.card_number || ''}
                          onChange={(e) => setBookingData({...bookingData, card_number: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          value={bookingData.card_expiry || ''}
                          onChange={(e) => setBookingData({...bookingData, card_expiry: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          CVV *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={bookingData.card_cvv || ''}
                            onChange={(e) => setBookingData({...bookingData, card_cvv: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="123"
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {bookingData.card_number && bookingData.card_expiry && bookingData.card_cvv && (
                    <button
                      onClick={handleBookingSubmit}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Lock className="h-5 w-5" />
                          <span>Pay €{calculateTotalPrice()}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-32">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Regatta Summary</h3>
              
              <div className="space-y-4 mb-6">
                {selectedDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">
                      {new Date(selectedDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {selectedTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold">
                      {selectedTime.startsWith('08:30') || selectedTime.startsWith('09:00') ? 'Morning' : 'Afternoon'} Regatta
                      <br />
                      <span className="text-sm text-gray-500">{selectedTime}</span>
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Participants:</span>
                  <span className="font-semibold">{participants}</span>
                </div>
                
                {selectedTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">4 hours</span>
                  </div>
                )}
              </div>

              {selectedTime && (
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600 flex items-center">
                      <Euro className="h-5 w-5 mr-1" />
                      {calculateTotalPrice()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {getActiveTimeSlotsForDate(selectedDate).find(slot => slot.time === selectedTime)?.price_per_person ?? 195} € per person
                  </p>
                </div>
              )}

              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Professional skipper</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>All safety equipment</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Racing instruction and training</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Medal ceremony</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Professional photography</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Free cancellation 48 hours prior</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Full insurance included</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendarPage;