import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Phone, Mail, User, Settings } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading bookings
    setTimeout(() => {
      setBookings([
        {
          id: '1',
          date: '2025-01-25',
          time: '08:30-12:30',
          participants: 2,
          status: 'confirmed',
          total: 398
        },
        {
          id: '2',
          date: '2025-02-10',
          time: '13:30-17:30',
          participants: 4,
          status: 'pending',
          total: 796
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

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
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
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
    </div>
  );
};

export default ClientDashboard;