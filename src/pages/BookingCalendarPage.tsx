// src/pages/BookingCalendarPage.tsx  <- Убедитесь, что это правильный путь к файлу

import React, { useState } from 'react';
import { Calendar, Clock, Users, CreditCard, CheckCircle, AlertCircle, ArrowLeft, Euro, User, Mail, Phone, Lock, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CalendarProvider, useCalendar } from '../context/CalendarContext';
import UnifiedCalendar from '../components/UnifiedCalendar'; // <--- ВОТ ИСПРАВЛЕНИЕ
import { TimeSlot } from '../hooks/useCalendarSync';

interface BookingData {
    date: string;
    timeSlot: TimeSlot | null;
    participants: number;
    total_price: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    card_number: string;
    card_expiry: string;
    card_cvv: string;
}

const BookingForm = () => {
    const { getActiveTimeSlotsForDate } = useCalendar(); // Получаем функции из контекста
    
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [participants, setParticipants] = useState(1);
    const [step, setStep] = useState(1); // 1: Calendar, 2: Details, 3: Payment
    const [loading, setLoading] = useState(false);
    const [bookingData, setBookingData] = useState<Partial<BookingData>>({});

    const handleDateSelect = (date: string) => {
        setSelectedDate(date);
        setSelectedTimeSlot(null); // Сбрасываем выбор времени при смене даты
        setStep(1); // Остаемся на шаге выбора даты, пока не нажмем "далее"
    };

    const handleTimeSelect = (slot: TimeSlot) => {
        setSelectedTimeSlot(slot);
    };

    const calculateTotalPrice = () => {
        if (!selectedTimeSlot) return 0;
        return selectedTimeSlot.price_per_person * participants;
    };

    const handleBookingSubmit = async () => {
        setLoading(true);
        try {
            if (!bookingData.customer_name || !bookingData.customer_email || !bookingData.customer_phone) {
                throw new Error('Please fill in all required customer information');
            }
            if (!selectedDate || !selectedTimeSlot) {
                throw new Error('Please select date and time');
            }

            const booking = {
                booking_date: selectedDate,
                time_slot: selectedTimeSlot.time,
                participants,
                total_price: calculateTotalPrice(),
                customer_name: bookingData.customer_name,
                customer_email: bookingData.customer_email,
                customer_phone: bookingData.customer_phone,
                status: 'confirmed',
                deposit_paid: 0,
                special_requests: null,
                user_id: null,
            };

            const { data, error } = await supabase.from('bookings').insert(booking).select().single();
            if (error) {
                console.error('Supabase error:', error);
                throw new Error(`Database error: ${error.message}`);
            }

            alert('Booking successfully created! You will receive confirmation by email.');
            setStep(1);
            setSelectedDate('');
            setSelectedTimeSlot(null);
            setParticipants(1);
            setBookingData({});
        } catch (error: any) {
            console.error('Booking error:', error);
            alert('Error creating booking: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    
    const availableTimeSlots = selectedDate ? getActiveTimeSlotsForDate(selectedDate) : [];

    const regattaTimeInfo = (time: string) => {
      const [start] = time.split('-');
      return parseInt(start) < 12 ? 'Morning Regatta' : 'Afternoon Regatta';
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    {/* Step 1: Calendar & Time */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900">1. Select Date & Time</h2>
                            <UnifiedCalendar
                                mode="select"
                                selectedDate={selectedDate}
                                onDateSelect={handleDateSelect}
                            />
                            {selectedDate && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Regatta Times for {new Date(selectedDate + 'T00:00:00').toLocaleDateString()}</h3>
                                    {availableTimeSlots.length > 0 ? (
                                        <div className="space-y-4">
                                            {availableTimeSlots.map((slot) => {
                                                const isSelected = selectedTimeSlot?.id === slot.id;
                                                return (
                                                    <div key={slot.id} onClick={() => handleTimeSelect(slot)} className={`p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 ${ isSelected ? 'border-blue-600 bg-blue-50 scale-105' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50' }`} >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="bg-blue-100 p-3 rounded-lg"> <Clock className="h-6 w-6 text-blue-600" /> </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900 text-lg">{regattaTimeInfo(slot.time)}</h4>
                                                                    <p className="text-gray-600">{slot.time} (4 hours)</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xl font-bold text-blue-600">€{slot.price_per_person}</p>
                                                                <p className="text-sm text-gray-600">per person</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">No available time slots for this date. Please select another date.</p>
                                    )}
                                </div>
                            )}
                            {selectedDate && selectedTimeSlot && (
                                <button onClick={() => setStep(2)} className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 mt-6" >
                                    Continue
                                </button>
                            )}
                        </div>
                    )}

                    {/* Step 2: Details */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">2. Your Details & Participants</h2>
                                <button onClick={() => setStep(1)} className="text-blue-600 hover:text-blue-700 font-medium">← Back to calendar</button>
                            </div>
                            
                            <div>
                                <label className="block text-lg font-semibold text-gray-900 mb-4">Number of participants (max {selectedTimeSlot?.max_participants})</label>
                                <div className="flex items-center space-x-4">
                                    <button onClick={() => setParticipants(Math.max(1, participants - 1))} className="w-12 h-12 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-300 flex items-center justify-center text-xl font-semibold">-</button>
                                    <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">{participants}</span>
                                    <button onClick={() => setParticipants(Math.min(selectedTimeSlot?.max_participants || 5, participants + 1))} className="w-12 h-12 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-300 flex items-center justify-center text-xl font-semibold">+</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input type="text" value={bookingData.customer_name || ''} onChange={(e) => setBookingData({ ...bookingData, customer_name: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Smith" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Email *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input type="email" value={bookingData.customer_email || ''} onChange={(e) => setBookingData({ ...bookingData, customer_email: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="john@example.com" required />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Phone *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input type="tel" value={bookingData.customer_phone || ''} onChange={(e) => setBookingData({ ...bookingData, customer_phone: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+39 345 678 9012" required />
                                    </div>
                                </div>
                            </div>
                            {bookingData.customer_name && bookingData.customer_email && bookingData.customer_phone && (
                                <button onClick={() => setStep(3)} className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105">Proceed to payment</button>
                            )}
                        </div>
                    )}

                    {/* Step 3: Payment */}
                    {step === 3 && (
                        <div className="space-y-6">
                             <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">3. Payment</h2>
                                <button onClick={() => setStep(2)} className="text-blue-600 hover:text-blue-700 font-medium">← Back</button>
                            </div>
                             <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div className="flex items-start space-x-3">
                                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-green-900 mb-2">Secure payment</h3>
                                        <p className="text-green-800 text-sm">Your data is protected by SSL encryption. We do not store credit card data.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Card Number *</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input type="text" value={bookingData.card_number || ''} onChange={(e) => setBookingData({ ...bookingData, card_number: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="1234 5678 9012 3456" maxLength={19} required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Expiry Date *</label>
                                        <input type="text" value={bookingData.card_expiry || ''} onChange={(e) => setBookingData({ ...bookingData, card_expiry: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="MM/YY" maxLength={5} required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">CVV *</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input type="text" value={bookingData.card_cvv || ''} onChange={(e) => setBookingData({ ...bookingData, card_cvv: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="123" maxLength={4} required />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {bookingData.card_number && bookingData.card_expiry && bookingData.card_cvv && (
                                <button onClick={handleBookingSubmit} disabled={loading} className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2">
                                    {loading ? (<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>) : (<> <Lock className="h-5 w-5" /> <span>Pay €{calculateTotalPrice()}</span> </>)}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Booking Summary Sidebar */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Regatta Summary</h3>
                    <div className="space-y-4 mb-6">
                        {selectedDate ? (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Date:</span>
                                <span className="font-semibold">{new Date(selectedDate + 'T00:00:00').toLocaleDateString()}</span>
                            </div>
                        ) : <p className="text-gray-500">Select a date...</p>}
                        
                        {selectedTimeSlot && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Time:</span>
                                <span className="font-semibold text-right">{regattaTimeInfo(selectedTimeSlot.time)}<br /><span className="text-sm text-gray-500">{selectedTimeSlot.time}</span></span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Participants:</span>
                            <span className="font-semibold">{participants}</span>
                        </div>
                    </div>
                    {selectedTimeSlot && (
                        <div className="border-t border-gray-200 pt-4 mb-6">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total:</span>
                                <span className="text-blue-600 flex items-center"><Euro className="h-5 w-5 mr-1" />{calculateTotalPrice()}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">€{selectedTimeSlot.price_per_person} per person</p>
                        </div>
                    )}
                    <div className="space-y-4 text-sm text-gray-600">
                        <div className="flex items-start space-x-2"><CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /><span>Professional skipper</span></div>
                        <div className="flex items-start space-x-2"><CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /><span>All safety equipment</span></div>
                        <div className="flex items-start space-x-2"><CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /><span>Racing instruction and training</span></div>
                        <div className="flex items-start space-x-2"><CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /><span>Medal ceremony</span></div>
                        <div className="flex items-start space-x-2"><CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /><span>Professional photography</span></div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2"><AlertCircle className="h-4 w-4" /><span>Free cancellation 48 hours prior</span></div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600"><CheckCircle className="h-4 w-4" /><span>Full insurance included</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const BookingCalendarPage = () => {
    return (
        <CalendarProvider>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">Book Your Regatta Experience</h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">Choose a date and time for an unforgettable yacht racing experience on Lake Garda</p>
                    </div>
                     <div className="max-w-4xl mx-auto mb-8">
                        <div className="flex items-center justify-between">
                            {[
                                { step: 1, title: 'Select Date & Time', icon: Calendar },
                                { step: 2, title: 'Details', icon: Users },
                                { step: 3, title: 'Payment', icon: CreditCard }
                            ].map((item, index) => (
                                <React.Fragment key={item.step}>
                                    <div className="flex flex-col items-center text-center">
                                        <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 bg-white`}>
                                            <item.icon className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <p className="mt-2 font-semibold text-blue-800">Step {item.step}</p>
                                        <p className="text-sm text-gray-600">{item.title}</p>
                                    </div>
                                    {index < 2 && (
                                        <div className={`flex-1 h-1 mx-4 rounded transition-all duration-500 bg-blue-200`}></div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                    <BookingForm />
                </div>
            </div>
        </CalendarProvider>
    );
};

export default BookingCalendarPage;