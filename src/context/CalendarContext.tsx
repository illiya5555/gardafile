import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCalendarSync, TimeSlot } from '../hooks/useCalendarSync';

// Определяем тип для значения, которое будет в контексте
interface CalendarContextType {
  availableDates: string[];
  timeSlots: TimeSlot[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  getTimeSlotsForDate: (date: string) => TimeSlot[];
  getActiveTimeSlotsForDate: (date: string) => TimeSlot[];
  isDateAvailable: (date: string) => boolean;
  isDateBooked: (date: string) => boolean; // Функция для проверки "забронированных" дней
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


  // --- БИЗНЕС-ЛОГИКА ДЛЯ ОТОБРАЖЕНИЯ ---

  /**
   * Проверяет, является ли день "забронированным" по бизнес-правилу.
   * Правило: будние дни (Пн-Пт) в Июне и Июле считаются забронированными.
   */
  const isDateBooked = (dateStr: string): boolean => {
    // Создаем объект Date, учитывая таймзону, чтобы избежать ошибок с "соседними" днями
    const date = new Date(dateStr + 'T00:00:00'); 
    const month = date.getMonth(); // JavaScript месяцы: Июнь = 5, Июль = 6
    const dayOfWeek = date.getDay(); // JavaScript дни недели: Воскресенье = 0, ... Суббота = 6

    // Применяем правило для Июня и Июля
    if (month === 5 || month === 6) {
      // Возвращаем true (забронировано), если это день с Понедельника по Пятницу
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    }
    
    // Для всех остальных месяцев это правило не действует
    return false;
  };

  /**
   * Переопределенная функция для проверки доступности даты.
   * Она учитывает как реальную доступность слотов, так и бизнес-правило "забронированности".
   */
  const isDateAvailable = (dateStr: string): boolean => {
    // 1. Проверяем, есть ли в принципе активные слоты на эту дату (данные из useCalendarSync)
    const hasActiveSlots = calendarSync.isDateAvailable(dateStr);
    
    // 2. Проверяем, не "забронирован" ли этот день по нашему бизнес-правилу
    const isBookedByRule = isDateBooked(dateStr);

    // 3. Дата доступна для выбора, только если на нее есть слоты И она не забронирована по правилу.
    return hasActiveSlots && !isBookedByRule;
  };


  // --- ФОРМИРОВАНИЕ ЗНАЧЕНИЯ КОНТЕКСТА ---

  // Собираем все функции и данные для передачи в дочерние компоненты.
  // Мы "подменяем" оригинальную isDateAvailable на нашу новую, "умную" версию.
  const value: CalendarContextType = {
    // Оригинальные значения из хука useCalendarSync
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
    
    // Наши переопределенные и новые функции
    isDateAvailable: isDateAvailable,
    isDateBooked: isDateBooked,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

// Кастомный хук для удобного использования контекста
export const useCalendar = (): CalendarContextType => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};