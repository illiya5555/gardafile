import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCalendarSync, TimeSlot } from '../hooks/useCalendarSync';

interface CalendarContextType {
  availableDates: string[];
  timeSlots: TimeSlot[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  getTimeSlotsForDate: (date: string) => TimeSlot[];
  getActiveTimeSlotsForDate: (date: string) => TimeSlot[];
  isDateAvailable: (date: string) => boolean;
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
    if (!calendarSync.loading) {
      setAvailableDates(calendarSync.getAvailableDates());
    }
  }, [calendarSync.timeSlots, calendarSync.loading]);

  const value = {
    availableDates,
    timeSlots: calendarSync.timeSlots,
    loading: calendarSync.loading,
    error: calendarSync.error,
    lastUpdated: calendarSync.lastUpdated,
    getTimeSlotsForDate: calendarSync.getTimeSlotsForDate,
    getActiveTimeSlotsForDate: calendarSync.getActiveTimeSlotsForDate,
    isDateAvailable: calendarSync.isDateAvailable,
    refreshCalendarData: calendarSync.refreshData,
    bulkUpdateTimeSlots: calendarSync.bulkUpdateTimeSlots,
    createDefaultTimeSlots: calendarSync.createDefaultTimeSlots,
    getDateBookingStats: calendarSync.getDateBookingStats
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