// src/components/UnifiedCalendar.tsx

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendar } from '../context/CalendarContext';

interface UnifiedCalendarProps {
    mode?: 'view' | 'select';
    selectedDate?: string;
    onDateSelect?: (date: string) => void;
    className?: string;
}

const UnifiedCalendar: React.FC<UnifiedCalendarProps> = ({
    mode = 'view',
    selectedDate,
    onDateSelect,
    className = '',
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const { loading, isDateAvailable, isDateBooked } = useCalendar();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay(); // 0=Sun, 1=Mon, ...
        const days = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }
        return days;
    };

    const handleDateClick = (date: Date) => {
        if (mode === 'select' && onDateSelect) {
            const dateStr = date.toISOString().split('T')[0];
            onDateSelect(dateStr);
        }
    };

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    if (loading) {
        return (
            <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-4 w-1/2 mx-auto"></div>
                    <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 35 }).map((_, i) => (
                            <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"><ChevronLeft className="h-5 w-5" /></button>
                    <h3 className="text-xl font-semibold text-gray-900">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-300"><ChevronRight className="h-5 w-5" /></button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {dayNames.map(day => <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">{day}</div>)}
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-7 gap-2">
                    {getDaysInMonth(currentDate).map((date, index) => {
                        if (!date) return <div key={index} className="h-12"></div>;

                        const dateStr = date.toISOString().split('T')[0];
                        const today = new Date();
                        today.setHours(0,0,0,0);

                        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isPast = date < today;
                        
                        const available = isDateAvailable(dateStr);
                        const booked = isDateBooked(dateStr);
                        const isSelected = selectedDate === dateStr;
                        const isClickable = mode === 'select' && isCurrentMonth && !isPast && available && !booked;

                        let style = 'text-gray-900 border border-gray-200 hover:bg-blue-50 hover:border-blue-300'; // Default available
                        if (!isCurrentMonth) style = 'text-gray-300';
                        else if (isPast) style = 'text-gray-400 bg-gray-50 cursor-not-allowed';
                        else if (booked) style = 'bg-red-100 text-red-700 cursor-not-allowed relative';
                        else if (!available) style = 'text-gray-400 bg-gray-100 cursor-not-allowed';
                        else if (isToday) style = 'bg-blue-100 text-blue-800 hover:bg-blue-200';
                        
                        if (isSelected) style = 'bg-blue-600 text-white scale-110 shadow-lg z-10';

                        return (
                            <div key={index} onClick={() => isClickable && handleDateClick(date)}
                                className={`h-12 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center relative ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'} ${style}`}
                            >
                                <span>{date.getDate()}</span>
                                {isCurrentMonth && !isPast && booked && (
                                     <span className="absolute bottom-1 text-[10px] font-bold leading-tight">Booked</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                    <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-blue-600 rounded"></div><span>Selected</span></div>
                    <div className="flex items-center space-x-2"><div className="w-3 h-3 border border-gray-200 rounded bg-white"></div><span>Available</span></div>
                    <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-red-100 rounded"></div><span>Booked</span></div>
                    <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-gray-100 rounded"></div><span>Unavailable</span></div>
                    <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-blue-100 rounded"></div><span>Today</span></div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedCalendar;