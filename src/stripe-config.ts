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
    priceId: 'price_1QU9hXP5kZ8hHdOdcTgEKktf', // Replace with your actual Stripe price ID for €195 yacht racing experience
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
  {
    id: 'premium-membership',
    priceId: 'price_1QU9hXP5kZ8hHdOdcTgEKktg', // Replace with your actual Stripe price ID for monthly membership
    name: 'Premium Membership',
    description: 'Monthly membership with exclusive benefits and discounts.',
    price: 29.99,
    currency: 'EUR',
    mode: 'subscription',
    features: [
      'Priority booking access',
      '20% discount on all experiences',
      'Exclusive member events',
      'Free professional photos',
      'Complimentary equipment upgrades'
    ],
    popular: false
  }
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
  return !!product;
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