// src/context/CalendarContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCalendarSync, TimeSlot } from '../hooks/useCalendarSync';

// Добавляем isDateBooked в тип контекста
interface CalendarContextType {
  availableDates: string[];
  timeSlots: TimeSlot[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  getTimeSlotsForDate: (date: string) => TimeSlot[];
  getActiveTimeSlotsForDate: (date: string) => TimeSlot[];
  isDateAvailable: (date: string) => boolean;
  isDateBooked: (date: string) => boolean; // <-- ДОБАВЛЕНО
  refreshCalendarData: () => void;
  bulkUpdateTimeSlots: (startDate: string, endDate: string, action: 'activate' | 'deactivate' | 'delete') => Promise<any>;
  createDefaultTimeSlots: (date: string) => Promise<any>;
  getDateBookingStats: (date: string) => Promise<any>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const calendarSync = useCalendarSync();
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  useEffect(() => {
    if (!calendarSync.loading && !calendarSync.error) {
      setAvailableDates(calendarSync.getAvailableDates());
    }
  }, [calendarSync.timeSlots, calendarSync.loading, calendarSync.error]);

  // --- НАЧАЛО НАШЕЙ НОВОЙ ЛОГИКИ ---

  /**
   * Проверяет, является ли день "забронированным" по бизнес-правилам.
   * В нашем случае: будние дни в Июне и Июле.
   */
  const isDateBooked = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const month = date.getMonth(); // Июнь = 5, Июль = 6
    const dayOfWeek = date.getDay(); // Воскресенье = 0, ... Пятница = 5, Суббота = 6

    if (month === 5 || month === 6) {
      // Возвращаем true (забронировано), если это будний день (Пн-Пт)
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    }
    
    // В остальные месяцы это правило не применяется
    return false;
  };

  /**
   * Создаем новую "умную" функцию isDateAvailable.
   * Она использует оригинальную функцию из хука, но также учитывает нашу логику "isDateBooked".
   */
  const isDateAvailable = (dateStr: string): boolean => {
    // 1. Проверяем, доступна ли дата в принципе (есть ли активные слоты по данным из хука).
    const originallyAvailable = calendarSync.isDateAvailable(dateStr);
    
    // 2. Проверяем, не забронирован ли этот день по нашим специальным правилам.
    const bookedByRule = isDateBooked(dateStr);

    // 3. Дата доступна для выбора, только если она была доступна изначально И не забронирована по правилу.
    return originallyAvailable && !bookedByRule;
  };

  // --- КОНЕЦ НАШЕЙ НОВОЙ ЛОГИКИ ---

  // Формируем значение для провайдера, подменяя оригинальные функции нашими новыми
  const value: CalendarContextType = {
    availableDates,
    timeSlots: calendarSync.timeSlots,
    loading: calendarSync.loading,
    error: calendarSync.error,
    lastUpdated: calendarSync.lastUpdated,
    getTimeSlotsForDate: calendarSync.getTimeSlotsForDate,
    getActiveTimeSlotsForDate: calendarSync.getActiveTimeSlotsForDate,
    refreshCalendarData: calendarSync.refreshData,
    bulkUpdateTimeSlots: calendarSync.bulkUpdateTimeSlots,
    createDefaultTimeSlots: calendarSync.createDefaultTimeSlots,
    getDateBookingStats: calendarSync.getDateBookingStats,
    // --- ПЕРЕОПРЕДЕЛЯЕМ ФУНКЦИИ ---
    isDateAvailable: isDateAvailable, // <-- Используем нашу новую "умную" функцию
    isDateBooked: isDateBooked,       // <-- Добавляем нашу новую функцию в контекст
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = (): CalendarContextType => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};