import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CreditCard, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Ship, Euro, User, Mail, Phone, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface YachtSlot {
  id: string;
  yacht_id: string;
  yacht_name: string;
  date: string;
  start_time: string;
  end_time: string;
  available: boolean;
  price_per_person: number;
  max_participants: number;
}

interface BookingData {
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  participants: number;
  yacht_id: string;
  total_price: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  card_number: string;
  card_expiry: string;
  card_cvv: string;
}

const BookingCalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<string>('');
  const [selectedEndDate, setSelectedEndDate] = useState<string>('');
  const [selectedStartTime, setSelectedStartTime] = useState<string>('');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('');
  const [participants, setParticipants] = useState(1);
  const [step, setStep] = useState(1); // 1: Calendar, 2: Time, 3: Details, 4: Payment
  const [availableSlots, setAvailableSlots] = useState<YachtSlot[]>([]);
  const [selectedYacht, setSelectedYacht] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({});

  // Generate available time slots (9:00-17:00, minimum 4 hours)
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // J-70 yacht fleet with proper UUID format
  const yachts = [
    { id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', name: 'J-70 "Adriatic Wind"', capacity: 8 },
    { id: 'b2c3d4e5-f6g7-8901-2345-678901bcdefg', name: 'J-70 "Lake Spirit"', capacity: 8 },
    { id: 'c3d4e5f6-g7h8-9012-3456-789012cdefgh', name: 'J-70 "Garda Dream"', capacity: 8 },
    { id: 'd4e5f6g7-h8i9-0123-4567-890123defghi', name: 'J-70 "Mountain View"', capacity: 8 },
    { id: 'e5f6g7h8-i9j0-1234-5678-901234efghij', name: 'J-70 "Blue Horizon"', capacity: 8 },
    { id: 'f6g7h8i9-j0k1-2345-6789-012345fghijk', name: 'J-70 "Wind Dancer"', capacity: 8 },
    { id: 'g7h8i9j0-k1l2-3456-7890-123456ghijkl', name: 'J-70 "Sunset Sail"', capacity: 8 },
    { id: 'h8i9j0k1-l2m3-4567-8901-234567hijklm', name: 'J-70 "Alpine Breeze"', capacity: 8 },
    { id: 'i9j0k1l2-m3n4-5678-9012-345678ijklmn', name: 'J-70 "Crystal Waters"', capacity: 8 },
    { id: 'j0k1l2m3-n4o5-6789-0123-456789jklmno', name: 'J-70 "Freedom"', capacity: 8 },
    { id: 'k1l2m3n4-o5p6-7890-1234-567890klmnop', name: 'J-70 "Serenity"', capacity: 8 },
    { id: 'l2m3n4o5-p6q7-8901-2345-678901lmnopq', name: 'J-70 "Majestic"', capacity: 8 }
  ];

  useEffect(() => {
    generateAvailableSlots();
  }, [currentDate]);

  const generateAvailableSlots = () => {
    const slots: YachtSlot[] = [];
    const today = new Date();
    
    // Generate slots for 30 days ahead
    for (let day = 0; day < 30; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() + day);
      
      yachts.forEach(yacht => {
        // Randomly make some slots unavailable for realism
        const isAvailable = Math.random() > 0.3;
        
        timeSlots.forEach((time, index) => {
          if (index < timeSlots.length - 3) { // Minimum 4 hours
            slots.push({
              id: `${yacht.id}-${date.toISOString().split('T')[0]}-${time}`,
              yacht_id: yacht.id,
              yacht_name: yacht.name,
              date: date.toISOString().split('T')[0],
              start_time: time,
              end_time: timeSlots[index + 4] || '17:00', // Minimum 4 hours
              available: isAvailable,
              price_per_person: 195, // €195 for 4 hours per person
              max_participants: yacht.capacity
            });
          }
        });
      });
    }
    
    setAvailableSlots(slots);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty days at the beginning of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateAvailable = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availableSlots.some(slot => slot.date === dateStr && slot.available);
  };

  const getAvailableYachtsForDate = (date: string) => {
    return availableSlots.filter(slot => slot.date === date && slot.available);
  };

  const calculateDuration = (startTime: string, endTime: string) => {
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    return end - start;
  };

  const calculateTotalPrice = () => {
    if (!selectedStartTime || !selectedEndTime) return 0;
    const duration = calculateDuration(selectedStartTime, selectedEndTime);
    
    // Base price for 4 hours is €195 per person
    // Additional hours are €48.75 per hour per person (195/4)
    let totalPrice = 195; // Base 4-hour price
    if (duration > 4) {
      const additionalHours = duration - 4;
      totalPrice += additionalHours * 48.75; // €48.75 per additional hour
    }
    
    return totalPrice * participants;
  };

  const handleDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    if (!selectedStartDate) {
      setSelectedStartDate(dateStr);
      setSelectedEndDate(dateStr); // Default to one day
    } else if (!selectedEndDate || dateStr < selectedStartDate) {
      setSelectedStartDate(dateStr);
      setSelectedEndDate(dateStr);
    } else {
      setSelectedEndDate(dateStr);
    }
  };

  const handleTimeSelect = (startTime: string, endTime: string, yachtId: string) => {
    setSelectedStartTime(startTime);
    setSelectedEndTime(endTime);
    setSelectedYacht(yachtId);
  };

  const handleBookingSubmit = async () => {
    setLoading(true);
    
    try {
      // Here would be payment system integration
      // For now simulate successful payment
      
      const booking = {
        yacht_id: selectedYacht,
        start_date: selectedStartDate,
        end_date: selectedEndDate,
        start_time: selectedStartTime,
        end_time: selectedEndTime,
        participants,
        total_price: calculateTotalPrice(),
        customer_name: bookingData.customer_name,
        customer_email: bookingData.customer_email,
        customer_phone: bookingData.customer_phone,
        status: 'confirmed',
        created_at: new Date().toISOString()
      };

      // Save to database
      const { error } = await supabase
        .from('yacht_bookings')
        .insert(booking);

      if (error) throw error;

      alert('Booking successfully created! You will receive confirmation by email.');
      
      // Reset form
      setStep(1);
      setSelectedStartDate('');
      setSelectedEndDate('');
      setSelectedStartTime('');
      setSelectedEndTime('');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">
            Book a J-70 Yacht
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose a date, time, and J-70 yacht for an unforgettable sailing adventure on Lake Garda
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: 'Select Date', icon: Calendar },
              { step: 2, title: 'Time and Yacht', icon: Clock },
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
                      const isAvailable = isDateAvailable(date);
                      const isSelected = dateStr === selectedStartDate || dateStr === selectedEndDate;
                      const isInRange = selectedStartDate && selectedEndDate && 
                        dateStr >= selectedStartDate && dateStr <= selectedEndDate;
                      const isPast = date < new Date();

                      return (
                        <button
                          key={index}
                          onClick={() => !isPast && isAvailable && handleDateSelect(date)}
                          disabled={isPast || !isAvailable}
                          className={`h-12 rounded-lg text-sm font-medium transition-all duration-300 ${
                            isPast
                              ? 'text-gray-300 cursor-not-allowed'
                              : isSelected
                              ? 'bg-blue-600 text-white scale-110 shadow-lg'
                              : isInRange
                              ? 'bg-blue-100 text-blue-600'
                              : isAvailable
                              ? 'hover:bg-blue-50 text-gray-900 border border-gray-200'
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  {/* Single Day Toggle */}
                  <div className="flex items-center space-x-3 mt-6">
                    <input
                      type="checkbox"
                      id="singleDay"
                      checked={selectedStartDate === selectedEndDate}
                      onChange={(e) => {
                        if (e.target.checked && selectedStartDate) {
                          setSelectedEndDate(selectedStartDate);
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="singleDay" className="text-gray-700">
                      One-day booking
                    </label>
                  </div>

                  {selectedStartDate && (
                    <button
                      onClick={() => setStep(2)}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                    >
                      Select time and yacht
                    </button>
                  )}
                </div>
              )}

              {/* Step 2: Time and Yacht Selection */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Select time and yacht</h2>
                    <button
                      onClick={() => setStep(1)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      ← Change date
                    </button>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800">
                      <strong>Selected date:</strong> {selectedStartDate}
                      {selectedEndDate !== selectedStartDate && ` - ${selectedEndDate}`}
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
                        onClick={() => setParticipants(Math.min(8, participants + 1))}
                        className="w-12 h-12 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-300 flex items-center justify-center text-xl font-semibold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Available Time Slots */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Available time slots</h3>
                    <div className="space-y-4">
                      {getAvailableYachtsForDate(selectedStartDate).slice(0, 6).map((slot) => {
                        const duration = calculateDuration(slot.start_time, slot.end_time);
                        const isSelected = selectedYacht === slot.yacht_id && 
                          selectedStartTime === slot.start_time;

                        // Calculate price for this specific slot
                        let slotPrice = 195; // Base 4-hour price
                        if (duration > 4) {
                          const additionalHours = duration - 4;
                          slotPrice += additionalHours * 48.75;
                        }

                        return (
                          <div
                            key={slot.id}
                            onClick={() => handleTimeSelect(slot.start_time, slot.end_time, slot.yacht_id)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50 scale-105'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                  <Ship className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{slot.yacht_name}</h4>
                                  <p className="text-gray-600">
                                    {slot.start_time} - {slot.end_time} ({duration} hours)
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Up to {slot.max_participants} participants
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-blue-600">
                                  €{Math.round(slotPrice * participants)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  €{Math.round(slotPrice)}/person
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selectedYacht && (
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
              <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h3>
              
              <div className="space-y-4 mb-6">
                {selectedStartDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">
                      {selectedStartDate}
                      {selectedEndDate !== selectedStartDate && ` - ${selectedEndDate}`}
                    </span>
                  </div>
                )}
                
                {selectedStartTime && selectedEndTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-semibold">{selectedStartTime} - {selectedEndTime}</span>
                  </div>
                )}
                
                {selectedYacht && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Yacht:</span>
                    <span className="font-semibold text-sm">
                      {yachts.find(y => y.id === selectedYacht)?.name}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Participants:</span>
                  <span className="font-semibold">{participants}</span>
                </div>
                
                {selectedStartTime && selectedEndTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">
                      {calculateDuration(selectedStartTime, selectedEndTime)} hours
                    </span>
                  </div>
                )}
              </div>

              {selectedStartTime && selectedEndTime && (
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600 flex items-center">
                      <Euro className="h-5 w-5 mr-1" />
                      {calculateTotalPrice()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    €195 for 4 hours per person (then €48.75 per additional hour)
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
                  <span>Instruction and training</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Adventure photography</span>
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