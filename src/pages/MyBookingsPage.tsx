import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Phone, Mail, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Booking } from '../lib/supabase';
import { Link } from 'react-router-dom';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your bookings.</p>
          <Link
            to="/"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-300"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your yacht racing experiences</p>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Bookings Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't made any bookings yet. Book your first yacht racing experience today!
            </p>
            <Link
              to="/booking"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-300 inline-block"
            >
              Book Your First Experience
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary-100 p-3 rounded-lg">
                        <Calendar className="h-6 w-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Yacht Racing Experience
                        </h3>
                        <p className="text-gray-600">
                          {new Date(booking.booking_date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(booking.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Time</p>
                        <p className="font-semibold text-gray-900">{booking.time_slot}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Participants</p>
                        <p className="font-semibold text-gray-900">{booking.participants} people</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-semibold text-gray-900">Riva del Garda</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Price</p>
                        <p className="text-2xl font-bold text-primary-600">€{booking.total_price}</p>
                        <p className="text-sm text-gray-600">
                          Deposit paid: €{booking.deposit_paid} | 
                          Remaining: €{booking.total_price - booking.deposit_paid}
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        {booking.status === 'pending' && (
                          <button className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors duration-300">
                            Cancel
                          </button>
                        )}
                        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-300">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>

                  {booking.special_requests && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Special Requests:</p>
                      <p className="text-gray-900">{booking.special_requests}</p>
                    </div>
                  )}
                </div>

                {booking.status === 'confirmed' && (
                  <div className="bg-green-50 border-t border-green-200 p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-900 mb-2">Your booking is confirmed!</h4>
                        <div className="text-sm text-green-800 space-y-1">
                          <p>• Meeting point: Marina Riva del Garda, Pier 3</p>
                          <p>• Arrive 30 minutes before departure time</p>
                          <p>• Bring comfortable clothes and sunscreen</p>
                          <p>• Weather updates will be sent 24 hours before</p>
                        </div>
                        <div className="mt-3 flex space-x-4">
                          <a
                            href="tel:+393456789012"
                            className="flex items-center space-x-2 text-green-700 hover:text-green-800 transition-colors duration-300"
                          >
                            <Phone className="h-4 w-4" />
                            <span className="text-sm font-medium">+39 345 678 9012</span>
                          </a>
                          <a
                            href="mailto:info@gardaracing.com"
                            className="flex items-center space-x-2 text-green-700 hover:text-green-800 transition-colors duration-300"
                          >
                            <Mail className="h-4 w-4" />
                            <span className="text-sm font-medium">info@gardaracing.com</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/booking"
              className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-300"
            >
              <div className="bg-primary-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Book Another Experience</h3>
                <p className="text-sm text-gray-600">Schedule your next sailing adventure</p>
              </div>
            </Link>
            
            <a
              href="tel:+393456789012"
              className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-300"
            >
              <div className="bg-primary-100 p-3 rounded-lg">
                <Phone className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Contact Support</h3>
                <p className="text-sm text-gray-600">Get help with your booking</p>
              </div>
            </a>
            
            <Link
              to="/experience"
              className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-300"
            >
              <div className="bg-primary-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Learn More</h3>
                <p className="text-sm text-gray-600">About our racing experiences</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;