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
    id: 'prod_SWD13VWgaEUI4a',
    priceId: 'price_1RbAbcHGLVvZbOy8R1225QhL',
    name: 'Garda',
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
  }
];

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};