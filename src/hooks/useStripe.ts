import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface CreateCheckoutSessionParams {
  priceId: string;
  mode: 'payment' | 'subscription';
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
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
    cancelUrl = `${window.location.origin}/booking`,
    metadata = {}
  }: CreateCheckoutSessionParams): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      // Call the Supabase edge function (without requiring authentication)
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: priceId,
          mode,
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata
        }
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (!data?.url) {
        throw new Error('No checkout URL received from Stripe');
      }
      
      // Track Google Ads begin_checkout event
      if (window.gtag) {
        window.gtag('event', 'begin_checkout', {
          'send_to': 'AW-17237804462',
          'value': priceId === 'price_1RbAbcHGLVvZbOy8R1225QhL' ? 195.0 : null,
          'currency': 'EUR',
          'items': [{ 'id': priceId }]
        });
      }

      return data.url;
    } catch (err: any) {
      console.error('Stripe checkout error:', err);
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
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

// Helper hook for redirecting to Stripe checkout
export const useStripeCheckout = () => {
  const { createCheckoutSession, loading, error } = useStripe();

  const redirectToCheckout = async (params: CreateCheckoutSessionParams) => {
    try {
      const url = await createCheckoutSession(params);
      if (url) {
        // Redirect to Stripe checkout
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout redirect error:', error);
    }
  };

  return {
    redirectToCheckout,
    loading,
    error
  };
};