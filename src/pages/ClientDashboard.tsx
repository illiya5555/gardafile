import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  User, 
  LogOut, 
  Settings, 
  Clock, 
  Users, 
  DollarSign, 
  Award, 
  Camera, 
  Ship, 
  Edit, 
  Eye, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Star,
  CreditCard
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSubscription } from '../hooks/useSubscription';
import { useOrders } from '../hooks/useOrders';
import PhoneInput from '../components/PhoneInput';

interface Booking {
  id: string;
  booking_date: string;
  time_slot: string;
  participants: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: string;
}

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookings');
  const [editingProfile, setEditingProfile] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState<Partial<Profile>>({});
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    totalSpent: 0
  });

  // Get subscription data
  const { subscription, loading: subscriptionLoading, productName } = useSubscription();
  
  // Get orders data
  const { orders, loading: ordersLoading } = useOrders();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }
      
      setUser(user);
      await fetchProfile(user.id);
      await fetchBookings(user.id, user.email);
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setUpdatedProfile({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '+39 '
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchBookings = async (userId: string, userEmail: string) => {
    try {
      // Fetch bookings where user_id matches OR customer_email matches
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .or(`user_id.eq.${userId},customer_email.eq.${userEmail}`)
        .order('booking_date', { ascending: false });

      if (error) throw error;
      
      setBookings(data || []);
      
      // Calculate booking statistics
      const now = new Date();
      const upcoming = data?.filter(booking => 
        new Date(booking.booking_date) >= now && 
        booking.status !== 'cancelled'
      ).length || 0;
      
      const completed = data?.filter(booking => 
        booking.status === 'completed'
      ).length || 0;
      
      const totalSpent = data?.reduce((sum, booking) => 
        booking.status !== 'cancelled' ? sum + parseFloat(booking.total_price) : sum, 0
      ) || 0;
      
      setBookingStats({
        total: data?.length || 0,
        upcoming,
        completed,
        totalSpent
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handlePhoneChange = (value: string) => {
    setUpdatedProfile(prev => ({
      ...prev,
      phone: value
    }));
  };

  const updateProfile = async () => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: updatedProfile.first_name,
          last_name: updatedProfile.last_name,
          phone: updatedProfile.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      // Refresh profile data
      await fetchProfile(user.id);
      setEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-5 w-5" />;
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'cancelled': return <XCircle className="h-5 w-5" />;
      case 'completed': return <Award className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-32">
              {/* User Info */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {profile?.first_name?.[0] || profile?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Welcome!'}
                  </h2>
                  <p className="text-gray-600 text-sm">{profile?.email}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2 mb-6">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-300 ${
                    activeTab === 'bookings'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                  <span>My Bookings</span>
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-300 ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-300 ${
                    activeTab === 'photos'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Camera className="h-5 w-5" />
                  <span>My Photos</span>
                </button>
                <button
                  onClick={() => setActiveTab('certificates')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-300 ${
                    activeTab === 'certificates'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Award className="h-5 w-5" />
                  <span>My Certificates</span>
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-300 ${
                    activeTab === 'payments'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Payment History</span>
                </button>
              </nav>

              {/* Stats */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4">
                  Your Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Bookings</span>
                    <span className="font-semibold text-gray-900">{bookingStats.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Upcoming</span>
                    <span className="font-semibold text-gray-900">{bookingStats.upcoming}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-semibold text-gray-900">{bookingStats.completed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Spent</span>
                    <span className="font-semibold text-gray-900">€{bookingStats.totalSpent}</span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                  <a 
                    href="/booking" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Book New Experience</span>
                  </a>
                </div>

                {bookings.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
                    <p className="text-gray-600 mb-6">You haven't made any bookings yet. Start your sailing adventure today!</p>
                    <a 
                      href="/booking" 
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 inline-flex items-center space-x-2"
                    >
                      <Calendar className="h-5 w-5" />
                      <span>Book Your First Experience</span>
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Upcoming Bookings */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Upcoming Bookings</h2>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {bookings
                          .filter(booking => new Date(booking.booking_date) >= new Date() && booking.status !== 'cancelled')
                          .map(booking => (
                            <div 
                              key={booking.id} 
                              className="p-6 hover:bg-gray-50 transition-colors duration-300 cursor-pointer"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowBookingDetails(true);
                              }}
                            >
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div className="flex items-start space-x-4">
                                  <div className="bg-blue-100 p-3 rounded-lg">
                                    <Ship className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-gray-900">Yacht Racing Experience</h3>
                                    <p className="text-gray-600">{formatDate(booking.booking_date)}</p>
                                    <p className="text-gray-500 text-sm">{booking.time_slot} • {booking.participants} participants</p>
                                  </div>
                                </div>
                                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                                  <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                                    <div className="flex items-center space-x-1">
                                      {getStatusIcon(booking.status)}
                                      <span className="capitalize">{booking.status}</span>
                                    </div>
                                  </div>
                                  <span className="font-semibold text-gray-900">€{booking.total_price}</span>
                                  <ChevronRight className="h-5 w-5 text-gray-400" />
                                </div>
                              </div>
                            </div>
                          ))}
                        {bookings.filter(booking => new Date(booking.booking_date) >= new Date() && booking.status !== 'cancelled').length === 0 && (
                          <div className="p-8 text-center">
                            <p className="text-gray-600">No upcoming bookings</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Past Bookings */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Past Bookings</h2>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {bookings
                          .filter(booking => new Date(booking.booking_date) < new Date() || booking.status === 'cancelled')
                          .map(booking => (
                            <div 
                              key={booking.id} 
                              className="p-6 hover:bg-gray-50 transition-colors duration-300 cursor-pointer"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowBookingDetails(true);
                              }}
                            >
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div className="flex items-start space-x-4">
                                  <div className={`p-3 rounded-lg ${
                                    booking.status === 'cancelled' ? 'bg-red-100' : 
                                    booking.status === 'completed' ? 'bg-green-100' : 'bg-gray-100'
                                  }`}>
                                    <Ship className={`h-6 w-6 ${
                                      booking.status === 'cancelled' ? 'text-red-600' : 
                                      booking.status === 'completed' ? 'text-green-600' : 'text-gray-600'
                                    }`} />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-gray-900">Yacht Racing Experience</h3>
                                    <p className="text-gray-600">{formatDate(booking.booking_date)}</p>
                                    <p className="text-gray-500 text-sm">{booking.time_slot} • {booking.participants} participants</p>
                                  </div>
                                </div>
                                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                                  <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                                    <div className="flex items-center space-x-1">
                                      {getStatusIcon(booking.status)}
                                      <span className="capitalize">{booking.status}</span>
                                    </div>
                                  </div>
                                  <span className="font-semibold text-gray-900">€{booking.total_price}</span>
                                  <ChevronRight className="h-5 w-5 text-gray-400" />
                                </div>
                              </div>
                            </div>
                          ))}
                        {bookings.filter(booking => new Date(booking.booking_date) < new Date() || booking.status === 'cancelled').length === 0 && (
                          <div className="p-8 text-center">
                            <p className="text-gray-600">No past bookings</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                  {!editingProfile ? (
                    <button 
                      onClick={() => setEditingProfile(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => setEditingProfile(false)}
                      className="text-gray-600 hover:text-gray-800 transition-colors duration-300"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  {editingProfile ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            value={updatedProfile.first_name || ''}
                            onChange={(e) => setUpdatedProfile({...updatedProfile, first_name: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            value={updatedProfile.last_name || ''}
                            onChange={(e) => setUpdatedProfile({...updatedProfile, last_name: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={profile?.email || ''}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <PhoneInput
                          value={updatedProfile.phone || '+39 '}
                          onChange={handlePhoneChange}
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={updateProfile}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">First Name</h3>
                          <p className="text-lg text-gray-900">{profile?.first_name || 'Not provided'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Last Name</h3>
                          <p className="text-lg text-gray-900">{profile?.last_name || 'Not provided'}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                          <p className="text-lg text-gray-900">{profile?.email}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
                          <p className="text-lg text-gray-900">{profile?.phone || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Member Since</h3>
                        <p className="text-lg text-gray-900">{formatDate(profile?.created_at || '')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Account Security Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Security</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Password</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-lg text-gray-900">••••••••</p>
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Change Password
                        </button>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-900">Not enabled</p>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <button className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-300 text-sm">
                          Enable
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Photos Tab */}
            {activeTab === 'photos' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">My Photos</h1>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <div className="text-center py-8">
                    <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No photos yet</h3>
                    <p className="text-gray-600 mb-6">
                      Photos from your sailing experiences will appear here after your booking.
                      Our professional photographers capture your moments on the water!
                    </p>
                    <a 
                      href="/booking" 
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 inline-flex items-center space-x-2"
                    >
                      <Calendar className="h-5 w-5" />
                      <span>Book an Experience</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Certificates Tab */}
            {activeTab === 'certificates' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <div className="text-center py-8">
                    <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No certificates yet</h3>
                    <p className="text-gray-600 mb-6">
                      After completing your sailing experience, you'll receive a digital certificate 
                      recognizing your achievement. Certificates will appear here.
                    </p>
                    {bookings.filter(b => b.status === 'completed').length > 0 ? (
                      <p className="text-blue-600">
                        Your certificates are being prepared and will be available soon!
                      </p>
                    ) : (
                      <a 
                        href="/booking" 
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 inline-flex items-center space-x-2"
                      >
                        <Calendar className="h-5 w-5" />
                        <span>Book an Experience</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
                </div>

                {/* Subscription Info */}
                {subscriptionLoading ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading subscription data...</p>
                  </div>
                ) : subscription && subscription.subscription_status === 'active' ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Active Subscription</h2>
                    <div className="bg-blue-50 p-6 rounded-xl">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="bg-blue-100 p-3 rounded-lg">
                          <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{productName || 'Premium Plan'}</h3>
                          <p className="text-blue-700">
                            Status: <span className="font-medium capitalize">{subscription.subscription_status}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subscription.current_period_end && (
                          <div>
                            <p className="text-sm text-gray-600">Next billing date</p>
                            <p className="font-medium text-gray-900">
                              {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        
                        {subscription.payment_method_last4 && (
                          <div>
                            <p className="text-sm text-gray-600">Payment method</p>
                            <p className="font-medium text-gray-900 capitalize">
                              {subscription.payment_method_brand} •••• {subscription.payment_method_last4}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Order History */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
                  </div>
                  
                  {ordersLoading ? (
                    <div className="p-8 text-center">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                      <p className="text-gray-600">Loading payment history...</p>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.map((order) => (
                            <tr key={order.order_id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(order.order_date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                #{order.order_id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: order.currency.toUpperCase()
                                }).format(order.amount_total / 100)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize
                                  ${order.order_status === 'completed' ? 'bg-green-100 text-green-800' : 
                                    order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'}`}>
                                  {order.order_status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-gray-600">No payment history found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
                <button
                  onClick={() => setShowBookingDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg ${getStatusColor(selectedBooking.status)}`}>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(selectedBooking.status)}
                  <span className="font-medium capitalize">{selectedBooking.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Experience</h4>
                  <p className="text-lg font-semibold text-gray-900">Yacht Racing Experience</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Booking ID</h4>
                  <p className="text-lg text-gray-900">{selectedBooking.id.substring(0, 8)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Date</h4>
                  <p className="text-lg text-gray-900">{formatDate(selectedBooking.booking_date)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Time</h4>
                  <p className="text-lg text-gray-900">{selectedBooking.time_slot}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Participants</h4>
                  <p className="text-lg text-gray-900">{selectedBooking.participants}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Total Price</h4>
                  <p className="text-lg font-semibold text-gray-900">€{selectedBooking.total_price}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Customer Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{selectedBooking.customer_name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{selectedBooking.customer_email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{selectedBooking.customer_phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Location</h4>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-gray-900">Viale Giancarlo Maroni 4</p>
                    <p className="text-gray-900">38066 Riva del Garda TN</p>
                    <p className="text-gray-900">Italia</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 flex justify-between">
                <button
                  onClick={() => setShowBookingDetails(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors duration-300"
                >
                  Close
                </button>
                <div className="space-x-3">
                  {selectedBooking.status === 'confirmed' && new Date(selectedBooking.booking_date) > new Date() && (
                    <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300">
                      Cancel Booking
                    </button>
                  )}
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300">
                    Download Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;