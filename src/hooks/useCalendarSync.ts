import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  max_participants: number;
  price_per_person: number;
  is_active: boolean;
  created_at: string;
}

export interface CalendarSyncState {
  timeSlots: TimeSlot[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export const useCalendarSync = () => {
  const [state, setState] = useState<CalendarSyncState>({
    timeSlots: [],
    loading: true,
    error: null,
    lastUpdated: null
  });

  // Fetch time slots from database
  const fetchTimeSlots = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase
        .from('time_slots')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setState(prev => ({
        ...prev,
        timeSlots: data || [],
        loading: false,
        lastUpdated: new Date(),
        error: null
      }));
    } catch (error: any) {
      console.error('Error fetching time slots:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch time slots'
      }));
    }
  }, []);

  // Subscribe to real-time changes
  useEffect(() => {
    // Initial fetch
    fetchTimeSlots();

    // Set up real-time subscription
    const subscription = supabase
      .channel('time_slots_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_slots'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          // Refetch data when changes occur
          fetchTimeSlots();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchTimeSlots]);

  // Helper functions
  const getAvailableDates = useCallback(() => {
    const availableDates = new Set<string>();
    state.timeSlots
      .filter(slot => slot.is_active)
      .forEach(slot => availableDates.add(slot.date));
    return Array.from(availableDates).sort();
  }, [state.timeSlots]);

  const getTimeSlotsForDate = useCallback((date: string) => {
    return state.timeSlots
      .filter(slot => slot.date === date)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [state.timeSlots]);

  const getActiveTimeSlotsForDate = useCallback((date: string) => {
    return state.timeSlots
      .filter(slot => slot.date === date && slot.is_active)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [state.timeSlots]);

  const isDateAvailable = useCallback((date: string) => {
    return state.timeSlots.some(slot => slot.date === date && slot.is_active);
  }, [state.timeSlots]);

  const refreshData = useCallback(() => {
    fetchTimeSlots();
  }, [fetchTimeSlots]);

  // Bulk update functions
  const bulkUpdateTimeSlots = useCallback(async (
    startDate: string,
    endDate: string,
    action: 'activate' | 'deactivate' | 'delete'
  ) => {
    try {
      const { data, error } = await supabase
        .rpc('bulk_update_time_slots', {
          start_date: startDate,
          end_date: endDate,
          action: action
        });

      if (error) throw error;
      
      // Refresh data after bulk update
      fetchTimeSlots();
      return data;
    } catch (error: any) {
      console.error(`Error performing bulk ${action}:`, error);
      throw error;
    }
  }, [fetchTimeSlots]);

  // Create default time slots for a date
  const createDefaultTimeSlots = useCallback(async (date: string) => {
    try {
      const { data, error } = await supabase
        .rpc('create_default_time_slots', {
          date_param: date
        });

      if (error) throw error;
      
      // Refresh data after creating default slots
      fetchTimeSlots();
      return data;
    } catch (error: any) {
      console.error('Error creating default time slots:', error);
      throw error;
    }
  }, [fetchTimeSlots]);

  // Get booking statistics for a date
  const getDateBookingStats = useCallback(async (date: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_date_booking_stats', {
          date_param: date
        });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error getting date booking stats:', error);
      throw error;
    }
  }, []);

  return {
    ...state,
    getAvailableDates,
    getTimeSlotsForDate,
    getActiveTimeSlotsForDate,
    isDateAvailable,
    refreshData,
    bulkUpdateTimeSlots,
    createDefaultTimeSlots,
    getDateBookingStats
  };
};