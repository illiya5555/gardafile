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
    priceId: 'price_1234567890', // Replace with your actual Stripe price ID
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
    priceId: 'price_0987654321', // Replace with your actual Stripe price ID
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