import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone, Mail, User, Settings, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

interface Booking {
  id: string;
  date: string;
  time: string;
  participants: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  total: number;
}

const ClientDashboard = () => {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load bookings for the current user
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error fetching user:", userError);
          return;
        }
        
        if (!userData.user) {
          console.log("No user logged in");
          return;
        }
        
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('date', { ascending: false });
        
        if (bookingsError) {
          console.error("Error fetching bookings:", bookingsError);
          return;
        }
        
        // Convert to the interface expected by the component
        const transformedBookings = bookingsData.map(booking => ({
          id: booking.id,
          date: booking.date,
          time: booking.time_slot || `${booking.start_time}-${booking.end_time}`,
          participants: booking.participants,
          status: booking.status,
          total: booking.total_price
        }));
        
        setBookings(transformedBookings);
      } catch (error) {
        console.error("Error in fetchBookings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
      setLoading(false);
  }, []);

  const openBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const closeBookingDetails = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('dashboard.welcome', 'Welcome back!')}
              </h1>
              <p className="text-gray-600 mt-2">
                {t('dashboard.subtitle', 'Manage your yacht racing bookings and profile')}
              </p>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <Settings className="h-5 w-5" />
              <span>{t('dashboard.settings', 'Settings')}</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.reduce((sum, b) => sum + b.participants, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('dashboard.your_bookings', 'Your Bookings')}
            </h2>
          </div>
          <div className="p-6">
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {t('dashboard.no_bookings', 'No bookings found')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300 cursor-pointer"
                    onClick={() => openBookingDetails(booking)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {new Date(booking.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">{booking.time}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            {booking.participants} {booking.participants === 1 ? 'participant' : 'participants'}
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            €{booking.total}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('dashboard.booking_details', 'Booking Details')}
                </h2>
                <button 
                  onClick={closeBookingDetails}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex justify-center mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 ${getStatusColor(selectedBooking.status)}`}>
                  {selectedBooking.status === 'confirmed' && <CheckCircle className="h-4 w-4 mr-1" />}
                  {selectedBooking.status === 'pending' && <AlertCircle className="h-4 w-4 mr-1" />}
                  {selectedBooking.status === 'cancelled' && <X className="h-4 w-4 mr-1" />}
                  <span>{selectedBooking.status}</span>
                </span>
              </div>
              
              {/* Booking Details */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{t('dashboard.booking_date', 'Date')}</p>
                    <p className="text-gray-600">{new Date(selectedBooking.date).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{t('dashboard.booking_time', 'Time')}</p>
                    <p className="text-gray-600">{selectedBooking.time}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{t('dashboard.participants', 'Participants')}</p>
                    <p className="text-gray-600">
                      {selectedBooking.participants} {selectedBooking.participants === 1 
                        ? t('dashboard.booking.participants_single', 'participant') 
                        : t('dashboard.booking.participants_plural', 'participants')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Info className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{t('dashboard.booking_id', 'Booking ID')}</p>
                    <p className="text-gray-600">{selectedBooking.id.substring(0, 8)}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <p className="font-medium text-gray-900 mb-2">{t('dashboard.price_details', 'Price Details')}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('dashboard.total_price', 'Total Price')}</span>
                    <span className="text-xl font-bold text-primary-600">€{selectedBooking.total}</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={closeBookingDetails}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t('common.close', 'Close')}
                </button>
                
                {selectedBooking.status === 'pending' && (
                  <button
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {t('dashboard.view_payment', 'View Payment')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;