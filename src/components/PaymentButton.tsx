import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Loader } from 'lucide-react';
import { useStripe } from '../hooks/useStripe';
import { supabase } from '../lib/supabase';

interface PaymentButtonProps {
  priceId: string;
  mode: 'payment' | 'subscription';
  className?: string;
  children?: React.ReactNode;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({ 
  priceId, 
  mode, 
  className = '', 
  children 
}) => {
  const navigate = useNavigate();
  const { createCheckoutSession, loading, error } = useStripe();
  const [authError, setAuthError] = useState<string | null>(null);

  const handleClick = async () => {
    setAuthError(null);
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setAuthError('Please sign in to continue with your purchase');
      navigate('/login');
      return;
    }
    
    // Create checkout session
    const checkoutUrl = await createCheckoutSession({
      priceId,
      mode,
      successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/booking`
    });
    
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`flex items-center justify-center space-x-2 ${className}`}
      >
        {loading ? (
          <Loader className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            <span>{children || 'Pay Now'}</span>
          </>
        )}
      </button>
      
      {(error || authError) && (
        <div className="mt-2 text-sm text-red-600">
          {error || authError}
        </div>
      )}
    </>
  );
};

export default PaymentButton;