import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, Download, Mail, ArrowRight } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { useSubscription } from '../hooks/useSubscription';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const { orders, refetch: refetchOrders } = useOrders();
  const { subscription, refetch: refetchSubscription } = useSubscription();

  useEffect(() => {
    // Refetch data to get the latest order/subscription info
    const fetchData = async () => {
      await Promise.all([refetchOrders(), refetchSubscription()]);
      setLoading(false);
    };
    
    fetchData();
  }, []);

  // Find the order that matches the session ID if available
  const order = sessionId ? orders.find(o => o.checkout_session_id === sessionId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pt-20 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600">
            Thank you for your purchase. Your booking has been confirmed.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading your order details...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {order && (
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">{order.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: order.currency.toUpperCase()
                      }).format(order.amount_total / 100)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(order.order_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600 capitalize">
                      {order.order_status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {subscription && subscription.subscription_status === 'active' && (
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Subscription</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-blue-600 capitalize">
                      {subscription.subscription_status}
                    </span>
                  </div>
                  {subscription.current_period_end && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Next billing date:</span>
                      <span className="font-medium">
                        {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {subscription.payment_method_last4 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment method:</span>
                      <span className="font-medium capitalize">
                        {subscription.payment_method_brand} •••• {subscription.payment_method_last4}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">What's Next?</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700">
                      We've sent a confirmation email with all the details of your booking.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700">
                      Your experience is now confirmed. Please arrive 15 minutes before your scheduled time.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Download className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-700">
                      You can access your booking details and receipt from your account dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <Link
                to="/dashboard"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <span>Go to My Dashboard</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/"
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 text-center"
              >
                Return to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessPage;