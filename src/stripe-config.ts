export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SSyGakSj62YBtw',
    priceId: 'price_1RY2JgQd82h5tJNs5VEHbO6v',
    name: 'Yacht racing',
    description: 'experiences in world-famous Lake Garda with professional skippers, racing medals, and unforgettable memories',
    mode: 'payment',
  },
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};