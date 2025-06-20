import React from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { useStripeCheckout } from '../hooks/useStripe';
import { getProductByPriceId, formatPrice } from '../stripe-config';
import { useTranslation } from '../context/LanguageContext';

interface PaymentButtonProps {
  priceId: string;
  mode?: 'payment' | 'subscription';
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  showPrice?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  priceId,
  mode = 'payment',
  successUrl,
  cancelUrl,
  metadata,
  className = '',
  disabled = false,
  children,
  showPrice = true,
  variant = 'primary'
}) => {
  const { t } = useTranslation();
  const { redirectToCheckout, loading, error } = useStripeCheckout();

  const product = getProductByPriceId(priceId);

  const handlePayment = async () => {
    await redirectToCheckout({
      priceId,
      mode,
      successUrl,
      cancelUrl,
      metadata
    });
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
      case 'outline':
        return 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 bg-transparent';
      default:
        return 'bg-primary-600 hover:bg-primary-700 text-white';
    }
  };

  const defaultText = () => {
    if (children) return children;
    
    if (product && showPrice) {
      return `${mode === 'subscription' ? t('payment.subscribe_now', 'Subscribe Now') : t('payment.pay_now', 'Pay Now')} ${formatPrice(product.price, product.currency)}`;
    }
    
    return mode === 'subscription' ? t('payment.subscribe_now', 'Subscribe Now') : t('payment.pay_now', 'Pay Now');
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handlePayment}
        disabled={disabled || loading}
        className={`
          flex items-center justify-center space-x-2 px-6 py-3 
          font-semibold rounded-lg transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:scale-105 active:scale-95
          ${getVariantClasses()}
          ${className}
        `}
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t('payment.processing', 'Processing...')}</span>
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            <span>{defaultText()}</span>
          </>
        )}
      </button>
      
      {error && (
        <p className="text-red-600 text-sm text-center">
          {error}
        </p>
      )}
      
      {product && (
        <p className="text-xs text-gray-500 text-center">
          {t('payment.secure_payment', 'Secure payment powered by Stripe')}
        </p>
      )}
    </div>
  );
};

export default PaymentButton;