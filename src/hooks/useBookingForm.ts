import { useState } from 'react';
import { supabase } from '../lib/supabase';

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

interface UseBookingFormReturn {
  loading: boolean;
  error: string | null;
  success: boolean;
  submitBooking: (data: BookingFormData) => Promise<string | null>;
}

export const useBookingForm = (): UseBookingFormReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitBooking = async (data: BookingFormData): Promise<string | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || null;

      // Call the Supabase RPC function to insert booking
      const { data: bookingId, error } = await supabase.rpc('insert_booking', {
        p_user_id: userId,
        p_booking_date: data.date,
        p_time_slot: data.time,
        p_participants: data.participants,
        p_total_price: data.totalPrice,
        p_customer_name: data.customerName,
        p_customer_email: data.customerEmail,
        p_customer_phone: data.customerPhone,
        p_special_requests: data.specialRequests || null
      });

      if (error) {
        console.error('Error submitting booking:', error);
        setError(error.message || 'Failed to submit booking. Please try again.');
        return null;
      }

      setSuccess(true);
      return bookingId;
    } catch (err: any) {
      console.error('Exception during booking submission:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    success,
    submitBooking
  };
};