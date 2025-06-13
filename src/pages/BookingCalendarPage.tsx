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

  // Генерируем доступные временные слоты (9:00-17:00, минимум 4 часа)
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Симуляция данных о яхтах (в реальном приложении это будет из базы данных)
  const yachts = [
    { id: '1', name: 'Bavaria 34 "Adriatic Wind"', capacity: 8 },
    { id: '2', name: 'Bavaria 34 "Lake Spirit"', capacity: 8 },
    { id: '3', name: 'Jeanneau 349 "Garda Dream"', capacity: 8 },
    { id: '4', name: 'Bavaria 37 "Mountain View"', capacity: 10 },
    { id: '5', name: 'Hanse 345 "Blue Horizon"', capacity: 8 },
    { id: '6', name: 'Bavaria 34 "Wind Dancer"', capacity: 8 },
    { id: '7', name: 'Jeanneau 349 "Sunset Sail"', capacity: 8 },
    { id: '8', name: 'Bavaria 37 "Alpine Breeze"', capacity: 10 },
    { id: '9', name: 'Hanse 345 "Crystal Waters"', capacity: 8 },
    { id: '10', name: 'Bavaria 34 "Freedom"', capacity: 8 },
    { id: '11', name: 'Jeanneau 349 "Serenity"', capacity: 8 },
    { id: '12', name: 'Bavaria 37 "Majestic"', capacity: 10 }
  ];

  useEffect(() => {
    generateAvailableSlots();
  }, [currentDate]);

  const generateAvailableSlots = () => {
    const slots: YachtSlot[] = [];
    const today = new Date();
    
    // Генерируем слоты на 30 дней вперед
    for (let day = 0; day < 30; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() + day);
      
      yachts.forEach(yacht => {
        // Случайно делаем некоторые слоты недоступными для реалистичности
        const isAvailable = Math.random() > 0.3;
        
        timeSlots.forEach((time, index) => {
          if (index < timeSlots.length - 3) { // Минимум 4 часа
            slots.push({
              id: `${yacht.id}-${date.toISOString().split('T')[0]}-${time}`,
              yacht_id: yacht.id,
              yacht_name: yacht.name,
              date: date.toISOString().split('T')[0],
              start_time: time,
              end_time: timeSlots[index + 4] || '17:00', // Минимум 4 часа
              available: isAvailable,
              price_per_person: 199,
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
    
    // Добавляем пустые дни в начале месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Добавляем дни месяца
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
    const basePrice = Math.max(4, duration) * 199; // Минимум 4 часа
    return basePrice * participants;
  };

  const handleDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    if (!selectedStartDate) {
      setSelectedStartDate(dateStr);
      setSelectedEndDate(dateStr); // По умолчанию один день
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
      // Здесь будет интеграция с платежной системой
      // Пока что симулируем успешную оплату
      
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

      // Сохраняем в базу данных
      const { error } = await supabase
        .from('yacht_bookings')
        .insert(booking);

      if (error) throw error;

      alert('Бронирование успешно создано! Вы получите подтверждение на email.');
      
      // Сброс формы
      setStep(1);
      setSelectedStartDate('');
      setSelectedEndDate('');
      setSelectedStartTime('');
      setSelectedEndTime('');
      setParticipants(1);
      setBookingData({});
      
    } catch (error: any) {
      console.error('Booking error:', error);
      alert('Ошибка при создании бронирования: ' + error.message);
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
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">
            Забронировать яхту
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Выберите дату, время и яхту для незабываемого парусного приключения на озере Гарда
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: 'Выбор даты', icon: Calendar },
              { step: 2, title: 'Время и яхта', icon: Clock },
              { step: 3, title: 'Детали', icon: Users },
              { step: 4, title: 'Оплата', icon: CreditCard }
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
                    Шаг {item.step}
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Выберите дату</h2>
                  
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
                      Бронирование на один день
                    </label>
                  </div>

                  {selectedStartDate && (
                    <button
                      onClick={() => setStep(2)}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                    >
                      Выбрать время и яхту
                    </button>
                  )}
                </div>
              )}

              {/* Step 2: Time and Yacht Selection */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Выберите время и яхту</h2>
                    <button
                      onClick={() => setStep(1)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      ← Изменить дату
                    </button>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800">
                      <strong>Выбранная дата:</strong> {selectedStartDate}
                      {selectedEndDate !== selectedStartDate && ` - ${selectedEndDate}`}
                    </p>
                  </div>

                  {/* Participants Selection */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-4">
                      Количество участников
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
                        onClick={() => setParticipants(Math.min(10, participants + 1))}
                        className="w-12 h-12 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-300 flex items-center justify-center text-xl font-semibold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Available Time Slots */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Доступные временные слоты</h3>
                    <div className="space-y-4">
                      {getAvailableYachtsForDate(selectedStartDate).slice(0, 6).map((slot) => {
                        const duration = calculateDuration(slot.start_time, slot.end_time);
                        const isSelected = selectedYacht === slot.yacht_id && 
                          selectedStartTime === slot.start_time;

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
                                    {slot.start_time} - {slot.end_time} ({duration} часов)
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    До {slot.max_participants} участников
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-blue-600">
                                  €{duration * slot.price_per_person * participants}
                                </p>
                                <p className="text-sm text-gray-600">
                                  €{slot.price_per_person}/час/чел
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
                      Продолжить
                    </button>
                  )}
                </div>
              )}

              {/* Step 3: Customer Details */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Ваши данные</h2>
                    <button
                      onClick={() => setStep(2)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      ← Назад
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Полное имя *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={bookingData.customer_name || ''}
                          onChange={(e) => setBookingData({...bookingData, customer_name: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Иван Иванов"
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
                          placeholder="ivan@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Телефон *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          value={bookingData.customer_phone || ''}
                          onChange={(e) => setBookingData({...bookingData, customer_phone: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="+7 (999) 123-45-67"
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
                      Перейти к оплате
                    </button>
                  )}
                </div>
              )}

              {/* Step 4: Payment */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Оплата</h2>
                    <button
                      onClick={() => setStep(3)}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      ← Назад
                    </button>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-green-900 mb-2">Безопасная оплата</h3>
                        <p className="text-green-800 text-sm">
                          Ваши данные защищены SSL-шифрованием. Мы не храним данные банковских карт.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Номер карты *
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
                          Срок действия *
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
                          <span>Оплатить €{calculateTotalPrice()}</span>
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
              <h3 className="text-xl font-bold text-gray-900 mb-6">Сводка бронирования</h3>
              
              <div className="space-y-4 mb-6">
                {selectedStartDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Дата:</span>
                    <span className="font-semibold">
                      {selectedStartDate}
                      {selectedEndDate !== selectedStartDate && ` - ${selectedEndDate}`}
                    </span>
                  </div>
                )}
                
                {selectedStartTime && selectedEndTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Время:</span>
                    <span className="font-semibold">{selectedStartTime} - {selectedEndTime}</span>
                  </div>
                )}
                
                {selectedYacht && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Яхта:</span>
                    <span className="font-semibold text-sm">
                      {yachts.find(y => y.id === selectedYacht)?.name}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Участники:</span>
                  <span className="font-semibold">{participants}</span>
                </div>
                
                {selectedStartTime && selectedEndTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Длительность:</span>
                    <span className="font-semibold">
                      {calculateDuration(selectedStartTime, selectedEndTime)} часов
                    </span>
                  </div>
                )}
              </div>

              {selectedStartTime && selectedEndTime && (
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Итого:</span>
                    <span className="text-blue-600 flex items-center">
                      <Euro className="h-5 w-5 mr-1" />
                      {calculateTotalPrice()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    €199 за час на человека (минимум 4 часа)
                  </p>
                </div>
              )}

              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Профессиональный шкипер</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Все оборудование для безопасности</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Инструктаж и обучение</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Фотосъемка приключения</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Бесплатная отмена за 48 часов</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Полная страховка включена</span>
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