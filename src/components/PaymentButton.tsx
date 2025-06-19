import React from 'react';
import { CreditCard } from 'lucide-react';

interface PaymentButtonProps {
  amount: number;
  currency?: string;
  description?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  amount,
  currency = 'EUR',
  description = 'Payment',
  onSuccess,
  onError,
  className = '',
  disabled = false,
  children
}) => {
  const handlePayment = async () => {
    try {
      // Placeholder for payment processing logic
      // This would integrate with Stripe or other payment processor
      console.log('Processing payment:', { amount, currency, description });
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error.message : 'Payment failed');
      }
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled}
      className={`
        flex items-center justify-center space-x-2 px-6 py-3 
        bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400
        text-white font-semibold rounded-lg
        transition-colors duration-200
        ${className}
      `}
    >
      <CreditCard className="h-5 w-5" />
      <span>
        {children || `Pay ${amount} ${currency}`}
      </span>
    </button>
  );
};

export default PaymentButton;