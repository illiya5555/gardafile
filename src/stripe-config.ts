export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  mode: 'payment' | 'subscription';
  features?: string[];
  popular?: boolean;
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'garda-racing-experience',
    priceId: 'price_1RbAbcHGLVvZbOy8R1225QhL', // Live Stripe price ID
    name: 'Garda Racing Experience',
    description: 'Premium yacht racing experience on Lake Garda with professional skipper, equipment, and medal ceremony.',
    price: 195.00,
    currency: 'EUR',
    mode: 'payment',
    features: [
      'Professional yacht racing experience',
      'Certified skipper and instruction',
      'All safety equipment provided',
      'Racing medal and certificate',
      'Professional photography',
      '4-hour sailing experience'
    ],
    popular: true
  },
];

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

// Helper function to format price for display
export const formatPrice = (price: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
};

// Helper function to check if a product is available
export const isProductAvailable = (productId: string): boolean => {
  const product = getProductById(productId);
  return !!product && productId === 'garda-racing-experience'; // Only the racing experience is available
};

// Configuration for different environments
export const stripeConfig = {
  // These will be set automatically by Supabase edge functions
  publishableKey: '', // Not needed for server-side integration
  apiVersion: '2023-10-16' as const,
  
  // Default success and cancel URLs
  defaultSuccessUrl: '/success',
  defaultCancelUrl: '/booking',
  
  // Supported currencies
  supportedCurrencies: ['EUR', 'USD'] as const,
  
  // Default currency
  defaultCurrency: 'EUR' as const,
};

export type SupportedCurrency = typeof stripeConfig.supportedCurrencies[number];