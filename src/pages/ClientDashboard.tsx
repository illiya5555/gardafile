import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MessageSquare, 
  Camera, 
  FileText, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Clock,
  Euro,
  Download,
  Send,
  Image,
  Video,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface Booking {
  id: string;
  booking_date?: string;
  start_date?: string;
  end_date?: string;
  time_slot?: string;
  start_time?: string;
  end_time?: string;
  participants: number;
  total_price: number;
  status: string;
  type: 'regular' | 'yacht';
  yacht_name?: string;
  created_at: string;
}

interface ChatMessage {
  id: string;
  message: string;
  sender_type: 'manager' | 'client';
  is_read: boolean;
  created_at: string;
}

interface MediaFile {
  id: string;
  media_url: string;
  media_type: 'photo' | 'video';
  caption?: string;
  created_at: string;
}

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && (!user || profile?.role_name !== 'client')) {
      navigate('/');
      return;
    }

    if (user && profile?.role_name === 'client') {
      fetchClientData();
    }
  }, [user, profile, loading, navigate]);

  const fetchClientData = async () => {
    if (!user) return;

    try {
      setLoadingData(true);

      // Fetch regular bookings
      const { data: regularBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch yacht bookings
      const { data: yachtBookings } = await supabase
        .from('yacht_bookings')
        .select(`
          *,
          yachts(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Combine bookings
      const allBookings: Booking[] = [
        ...(regularBookings || []).map(b => ({ ...b, type: 'regular' as const })),
        ...(yachtBookings || []).map(b => ({ 
          ...b, 
          type: 'yacht' as const,
          yacht_name: b.yachts?.name 
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setBookings(allBookings);

      // Fetch chat messages
      const { data: messages } = await supabase
        .from('manager_client_chats')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: true });

      setChatMessages(messages || []);

      // Fetch media files
      const { data: media } = await supabase
        .from('client_media')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      setMediaFiles(media || []);

    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      // Find a manager to send message to (for simplicity, get first manager)
      const { data: managers } = await supabase
        .from('profiles')
        .select(`
          id,
          user_roles!inner(role_name)
        `)
        .eq('user_roles.role_name', 'manager')
        .limit(1);

      if (!managers || managers.length === 0) {
        alert('No managers available at the moment');
        return;
      }

      const { error } = await supabase
        .from('manager_client_chats')
        .insert({
          client_id: user.id,
          manager_id: managers[0].id,
          message: newMessage,
          sender_type: 'client'
        });

      if (error) throw error;

      setNewMessage('');
      fetchClientData(); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <Star className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.first_name}!
          </h1>
          <p className="text-gray-600">Manage your sailing experiences and communications</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'bookings', label: 'My Bookings', icon: Calendar },
              { id: 'chat', label: 'Chat with Manager', icon: MessageSquare },
              { id: 'media', label: 'My Photos & Videos', icon: Camera },
              { id: 'profile', label: 'Profile', icon: User }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors duration-300 ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
                <a
                  href="/booking"
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-300"
                >
                  Book New Experience
                </a>
              </div>

              {bookings.length === 0 ? (
                <div className="bg-white p-12 rounded-lg shadow-sm text-center">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-600 mb-6">Start your sailing adventure today!</p>
                  <a
                    href="/booking"
                    className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-300"
                  >
                    Book Your First Experience
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.type === 'yacht' ? booking.yacht_name : 'Racing Experience'}
                          </h3>
                          <p className="text-gray-600">
                            {booking.booking_date || booking.start_date}
                            {booking.time_slot && ` • ${booking.time_slot}`}
                            {booking.start_time && ` • ${booking.start_time} - ${booking.end_time}`}
                          </p>
                        </div>
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="capitalize">{booking.status}</span>
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>{booking.participants} participants</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Euro className="h-4 w-4" />
                          <span>€{booking.total_price}</span>
                        </div>
                      </div>

                      {booking.status === 'confirmed' && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <button className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm font-medium">
                            <Download className="h-4 w-4" />
                            <span>Download Receipt</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Chat with Manager</h2>
                <p className="text-gray-600">Get help with your bookings and questions</p>
              </div>
              
              <div className="h-96 overflow-y-auto p-6 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No messages yet. Start a conversation!</p>
                  </div>
                ) : (
                  chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_type === 'client' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_type === 'client'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_type === 'client' ? 'text-primary-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-6 border-t border-gray-200">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">My Photos & Videos</h2>
              
              {mediaFiles.length === 0 ? (
                <div className="bg-white p-12 rounded-lg shadow-sm text-center">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No media yet</h3>
                  <p className="text-gray-600">Photos and videos from your sailing experiences will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mediaFiles.map((media) => (
                    <div key={media.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      {media.media_type === 'photo' ? (
                        <img
                          src={media.media_url}
                          alt={media.caption || 'Sailing photo'}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                          <Video className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="p-4">
                        {media.caption && (
                          <p className="text-gray-700 text-sm mb-2">{media.caption}</p>
                        )}
                        <p className="text-gray-500 text-xs">
                          {new Date(media.created_at).toLocaleDateString()}
                        </p>
                        <button className="mt-2 flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm">
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <p className="text-gray-900">{profile?.first_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <p className="text-gray-900">{profile?.last_name || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <p className="text-gray-900">{profile?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <p className="text-gray-900">{profile?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                  <p className="text-gray-900">
                    {new Date(profile?.created_at || '').toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                    {profile?.role_name}
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-300">
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;