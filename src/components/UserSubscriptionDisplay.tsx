import React, { useEffect, useState } from 'react';
import { Crown, Calendar, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { getProductByPriceId } from '../stripe-config';

interface SubscriptionData {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

const UserSubscriptionDisplay = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
    );
  }

  if (!subscription || subscription.subscription_status === 'not_started') {
    return null;
  }

  const product = subscription.price_id ? getProductByPriceId(subscription.price_id) : null;
  const isActive = ['active', 'trialing'].includes(subscription.subscription_status);
  const isPastDue = subscription.subscription_status === 'past_due';
  const isCanceled = ['canceled', 'incomplete_expired'].includes(subscription.subscription_status);

  const getStatusColor = () => {
    if (isActive) return 'bg-green-100 text-green-800';
    if (isPastDue) return 'bg-yellow-100 text-yellow-800';
    if (isCanceled) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = () => {
    switch (subscription.subscription_status) {
      case 'active': return 'Active';
      case 'trialing': return 'Trial';
      case 'past_due': return 'Past Due';
      case 'canceled': return 'Canceled';
      case 'incomplete': return 'Incomplete';
      case 'incomplete_expired': return 'Expired';
      case 'unpaid': return 'Unpaid';
      case 'paused': return 'Paused';
      default: return subscription.subscription_status;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Crown className="h-5 w-5 text-yellow-500" />
          <div>
            <p className="font-medium text-gray-900">
              {product?.name || 'Subscription'}
            </p>
            <p className="text-sm text-gray-600">
              {product?.description || 'Active subscription'}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
          
          {subscription.current_period_end && (
            <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>
                {subscription.cancel_at_period_end ? 'Ends' : 'Renews'}{' '}
                {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {subscription.payment_method_brand && subscription.payment_method_last4 && (
            <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
              <CreditCard className="h-3 w-3" />
              <span>
                {subscription.payment_method_brand.toUpperCase()} ****{subscription.payment_method_last4}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSubscriptionDisplay;