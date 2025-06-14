import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, Euro } from 'lucide-react';
import { useCalendarSync } from '../../hooks/useCalendarSync';

interface UnifiedCalendarProps {
  mode?: 'view' | 'select';
  selectedDate?: string;
  onDateSelect?: (date: string) => void;
  showTimeSlots?: boolean;
  className?: string;
}

const UnifiedCalendar: React.FC<UnifiedCalendarProps> = ({
  mode = 'view',
  selectedDate,
  onDateSelect,
  showTimeSlots = false,
  className = ''
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { timeSlots, loading, isDateAvailable, getActiveTimeSlotsForDate } = useCalendarSync();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  const handleDateClick = (date: Date) => {
    if (mode === 'select' && onDateSelect) {
      const dateStr = date.toISOString().split('T')[0];
      const isPast = date < new Date();
      const available = isDateAvailable(dateStr);
      
      if (!isPast && available) {
        onDateSelect(dateStr);
      }
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Body */}
      <div className="p-6">
        <div className="grid grid-cols-7 gap-2">
          {getDaysInMonth(currentDate).map((date, index) => {
            if (!date) {
              return <div key={index} className="h-12"></div>;
            }

            const dateStr = date.toISOString().split('T')[0];
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = date.toDateString() === new Date().toDateString();
            const isPast = date < new Date() && !isToday;
            const available = isDateAvailable(dateStr);
            const isSelected = selectedDate === dateStr;
            const timeSlotsForDate = getActiveTimeSlotsForDate(dateStr);

            return (
              <div
                key={index}
                onClick={() => isCurrentMonth && handleDateClick(date)}
                className={`h-12 rounded-lg text-sm font-medium transition-all duration-300 relative cursor-pointer ${
                  !isCurrentMonth
                    ? 'text-gray-300 cursor-not-allowed'
                    : isPast
                    ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                    : isSelected
                    ? 'bg-blue-600 text-white scale-110 shadow-lg'
                    : !available
                    ? 'bg-red-100 text-red-600 cursor-not-allowed'
                    : isToday
                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    : 'hover:bg-blue-50 text-gray-900 border border-gray-200 hover:border-blue-300'
                } flex items-center justify-center`}
              >
                {date.getDate()}
                
                {/* Availability indicator */}
                {isCurrentMonth && !isPast && available && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  </div>
                )}
                
                {/* Time slots count */}
                {isCurrentMonth && !isPast && timeSlotsForDate.length > 0 && (
                  <div className="absolute top-0 right-0 -mt-1 -mr-1">
                    <div className="w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                      {timeSlotsForDate.length}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Time Slots Display */}
        {showTimeSlots && selectedDate && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Available Time Slots</h4>
            <div className="space-y-3">
              {getActiveTimeSlotsForDate(selectedDate).map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-900">{slot.time}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>Max {slot.max_participants}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Euro className="h-4 w-4" />
                        <span>{slot.price_per_person}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {getActiveTimeSlotsForDate(selectedDate).length === 0 && (
                <p className="text-gray-500 text-center py-4">No available time slots for this date</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-6 pb-6">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 border border-gray-200 rounded bg-white"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-100 rounded"></div>
            <span>Unavailable</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <span>Past</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 rounded"></div>
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedCalendar;