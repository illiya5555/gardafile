import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CreditCard, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Euro, User, Mail, Phone, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCalendar } from '../context/CalendarContext';
import PaymentButton from '../components/PaymentButton';
import { stripeProducts } from '../stripe-config';
import PhoneInput from '../components/PhoneInput';

interface BookingFormData {
  date: string;
  time: string;
  participants: number;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests?: string;
}

const BookingCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [participants, setParticipants] = useState(1);
  const [step, setStep] = useState(1); // 1: Calendar, 2: Time, 3: Details, 4: Payment
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<Partial<BookingFormData>>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Use the calendar context to get available dates and time slots
  const { 
    timeSlots, 
    loading: calendarLoading, 
    isDateAvailable, 
    getActiveTimeSlotsForDate 
  } = useCalendar();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
    
    if (user) {
      // Fetch user profile to pre-fill form
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name, email, phone')
        .eq('id', user.id)
        .maybeSingle();
      
      if (data) {
        setBookingData({
          customerName: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          customerEmail: data.email || user.email,
          customerPhone: data.phone || '+39 '
        });
      } else {
        setBookingData({
          customerEmail: user.email,
          customerPhone: '+39 '
        });
      }
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty days at the beginning
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setSelectedTime(''); // Reset time selection when date changes
    setStep(2); // Move to time selection step
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handlePhoneChange = (value: string) => {
    setBookingData(prev => ({
      ...prev,
      customerPhone: value
    }));
  };

  const calculateTotalPrice = () => {
    return 195 * participants;
  };

  const handleBookingSubmit = async () => {
    setLoading(true);
    
    try {
      // Validate required fields
      if (!bookingData.customerName || !bookingData.customerEmail || !bookingData.customerPhone) {
        throw new Error('Please fill in all required customer information');
      }

      if (!selectedDate || !selectedTime) {
        throw new Error('Please select date and time');
      }

      // Create booking object with all required fields for reservations table
      const booking = {
        type: 'regular',
        booking_date: selectedDate,
        time_slot: selectedTime,
        participants: participants,
        total_price: calculateTotalPrice(),
        customer_name: bookingData.customerName,
        customer_email: bookingData.customerEmail,
        customer_phone: bookingData.customerPhone,
        status: 'confirmed',
        booking_source: 'website'
      };

      console.log('Submitting booking:', booking);

      // Save to database using the correct reservations table
      const { data, error } = await supabase
        .from('reservations')
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

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get the Garda product
  const gardaProduct = stripeProducts.find(product => product.name === 'Garda');

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).replace(/\//g, '.');
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
              <span>Morning: 8:30-12:30</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Afternoon: 13:30-18:00</span>
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
                  
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={prevMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h3>
                    <button
                      onClick={nextMonth}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Special notice for June/July */}
                  {(currentDate.getMonth() === 5 || currentDate.getMonth() === 6) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-900">
                            {currentDate.getMonth() === 5 ? 'June' : 'July'} Availability Notice
                          </h4>
                          <p className="text-amber-800 text-sm mt-1">
                            During {currentDate.getMonth() === 5 ? 'June' : 'July'}, regattas are available only on weekends (Saturday & Sunday). 
                            Weekdays are fully booked for private events.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Special notice for all other months */}
                  {(currentDate.getMonth() !== 5 && currentDate.getMonth() !== 6) && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-green-900">
                            {monthNames[currentDate.getMonth()]} - Full Availability
                          </h4>
                          <p className="text-green-800 text-sm mt-1">
                            All dates are available for booking during {monthNames[currentDate.getMonth()]}. 
                            Choose any day that works for you!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {dayNames.map(day => (
                      <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {getDaysInMonth(currentDate).map((date, index) => {
                      if (!date) {
                        return <div key={index} className="h-12"></div>;
                      }

                      const dateStr = date.toISOString().split('T')[0];
                      const isAvailable = isDateAvailable(dateStr);
                      const isSelected = dateStr === selectedDate;
                      const isPast = date < new Date();
                      const isCurrentMonth = date.getMonth() === currentDate.getMonth();

                      // For June and July, only weekends are available
                      const month = date.getMonth() + 1; // JavaScript months are 0-indexed
                      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
                      let isBookable = isAvailable;
                      
                      // Apply special rule for June/July
                      if ((month === 6 || month === 7) && !(dayOfWeek === 0 || dayOfWeek === 6)) {
                        isBookable = false;
                      }

                      return (
                        <button
                          key={index}
                          onClick={() => !isPast && isBookable && isCurrentMonth && handleDateSelect(date)}
                          disabled={isPast || !isBookable || !isCurrentMonth}
                          className={`h-12 rounded-lg text-sm font-medium transition-all duration-300 relative ${
                            !isCurrentMonth
                              ? 'text-gray-300 cursor-not-allowed'
                              : isPast
                              ? 'text-gray-300 cursor-not-allowed bg-gray-100'
                              : isSelected
                              ? 'bg-blue-600 text-white scale-110 shadow-lg'
                              : !isBookable
                              ? 'bg-red-100 text-red-600 cursor-not-allowed'
                              : 'hover:bg-blue-50 text-gray-900 border border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          {date.getDate()}
                          {!isBookable && !isPast && isCurrentMonth && (
                            <div className="absolute bottom-0 left-0 right-0 text-xs text-red-600 font-bold">
                              Booked
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-6 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-600 rounded"></div>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border border-gray-200 rounded bg-white"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-100 rounded"></div>
                      <span>Booked</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-100 rounded"></div>
                      <span>Past/Unavailable</span>
                    </div>
                  </div>
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
                    <div className="flex items-center">
                      <span className="text-blue-800 font-semibold">Selected date:</span>
                      <span className="ml-2 text-blue-900">{formatDisplayDate(selectedDate)}</span>
                    </div>
                  </div>

                  {/* Participants Selection */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      Number of participants (max 5 per regatta)
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
                        onClick={() => setParticipants(Math.min(5, participants + 1))}
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
                      {calendarLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="mt-2 text-gray-600">Loading available times...</p>
                        </div>
                      ) : (
                        getActiveTimeSlotsForDate(selectedDate).map((slot) => {
                          const totalPrice = slot.price_per_person * participants;
                          const isSelected = selectedTime === slot.time;
                          const regattaName = slot.time.startsWith('08:30') ? 'Morning Regatta' : 'Afternoon Regatta';
                          const timeRange = slot.time;
                          const [startTime] = timeRange.split('-');
                          const endTime = timeRange.split('-')[1];

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
                                      Up to {slot.max_participants} participants
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-blue-600">
                                    €{totalPrice}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    €{slot.price_per_person} per person
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}

                      {!calendarLoading && getActiveTimeSlotsForDate(selectedDate).length === 0 && (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No available time slots</h3>
                          <p className="text-gray-600">
                            There are no available time slots for this date. Please select another date.
                          </p>
                          <button
                            onClick={() => setStep(1)}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                          >
                            Choose Another Date
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedTime && (
                    <button
                      onClick={() => setStep(3)}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                    >
                      Continue to details
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
                      ← Back to time selection
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
                          value={bookingData.customerName || ''}
                          onChange={(e) => setBookingData({...bookingData, customerName: e.target.value})}
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
                          value={bookingData.customerEmail || ''}
                          onChange={(e) => setBookingData({...bookingData, customerEmail: e.target.value})}
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
                      <PhoneInput
                        value={bookingData.customerPhone || '+39 '}
                        onChange={handlePhoneChange}
                        required
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(4)}
                    disabled={!bookingData.customerName || !bookingData.customerEmail || !bookingData.customerPhone}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Proceed to payment
                  </button>
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
                      ← Back to details
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

                  {isAuthenticated ? (
                    <div className="space-y-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Order Summary</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-blue-800">Date:</span>
                            <span className="font-medium">{formatDisplayDate(selectedDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-800">Time:</span>
                            <span className="font-medium">{selectedTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-800">Participants:</span>
                            <span className="font-medium">{participants}</span>
                          </div>
                          <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                            <span className="text-blue-800 font-semibold">Total:</span>
                            <span className="font-bold text-blue-900">€{calculateTotalPrice()}</span>
                          </div>
                        </div>
                      </div>

                      {gardaProduct && (
                        <PaymentButton
                          priceId={gardaProduct.priceId}
                          mode={gardaProduct.mode}
                          className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Pay €{calculateTotalPrice()} with Stripe
                        </PaymentButton>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                          <div>
                            <h3 className="font-semibold text-blue-900 mb-2">Please sign in to continue</h3>
                            <p className="text-blue-800 text-sm">
                              You need to be signed in to complete your booking. This helps us keep track of your bookings and provide better service.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-4">
                        <a
                          href="/login"
                          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 text-center"
                        >
                          Sign in to continue
                        </a>
                        <p className="text-sm text-gray-600 text-center">
                          Don't have an account? <a href="/login" className="text-blue-600 hover:underline">Create one now</a>
                        </p>
                      </div>
                    </div>
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
                      {formatDisplayDate(selectedDate)}
                    </span>
                  </div>
                )}
                
                {selectedTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold">
                      {selectedTime.startsWith('08:30') ? 'Morning' : 'Afternoon'} Regatta
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
                    €195 per person for 4-hour regatta
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