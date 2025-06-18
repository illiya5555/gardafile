import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface CreateCheckoutSessionParams {
  priceId: string;
  mode: 'payment' | 'subscription';
  successUrl?: string;
  cancelUrl?: string;
}

interface UseStripeReturn {
  createCheckoutSession: (params: CreateCheckoutSessionParams) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export const useStripe = (): UseStripeReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async ({
    priceId,
    mode,
    successUrl = `${window.location.origin}/success`,
    cancelUrl = `${window.location.origin}/booking`
  }: CreateCheckoutSessionParams): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      // Get the current user's session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('You must be logged in to make a purchase');
      }

      // Call the Supabase edge function
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: priceId,
          mode,
          success_url: successUrl,
          cancel_url: cancelUrl
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (!data?.url) {
        throw new Error('No checkout URL received');
      }

      return data.url;
    } catch (err: any) {
      console.error('Stripe checkout error:', err);
      setError(err.message || 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createCheckoutSession,
    loading,
    error
  };
};