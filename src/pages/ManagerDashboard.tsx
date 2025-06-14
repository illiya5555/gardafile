import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MessageSquare, 
  Users, 
  Camera, 
  Upload,
  Search,
  Filter,
  Edit,
  Eye,
  Send,
  Image,
  Video,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  User,
  Phone,
  Mail
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
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  created_at: string;
}

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  created_at: string;
  unread_messages: number;
}

interface ChatMessage {
  id: string;
  client_id: string;
  message: string;
  sender_type: 'manager' | 'client';
  is_read: boolean;
  created_at: string;
  client_name: string;
}

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!loading && (!user || profile?.role_name !== 'manager')) {
      navigate('/');
      return;
    }

    if (user && profile?.role_name === 'manager') {
      fetchManagerData();
    }
  }, [user, profile, loading, navigate]);

  const fetchManagerData = async () => {
    if (!user) return;

    try {
      setLoadingData(true);

      // Fetch all bookings
      const [regularBookingsRes, yachtBookingsRes] = await Promise.all([
        supabase
          .from('bookings')
          .select(`
            *,
            profiles(first_name, last_name, email, phone)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('yacht_bookings')
          .select(`
            *,
            yachts(name)
          `)
          .order('created_at', { ascending: false })
      ]);

      // Combine bookings
      const allBookings: Booking[] = [
        ...(regularBookingsRes.data || []).map(b => ({ ...b, type: 'regular' as const })),
        ...(yachtBookingsRes.data || []).map(b => ({ 
          ...b, 
          type: 'yacht' as const,
          yacht_name: b.yachts?.name 
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setBookings(allBookings);

      // Fetch clients with unread message counts
      const { data: clientsData } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          phone,
          created_at,
          user_roles!inner(role_name)
        `)
        .eq('user_roles.role_name', 'client')
        .order('created_at', { ascending: false });

      // Get unread message counts for each client
      const clientsWithUnread = await Promise.all(
        (clientsData || []).map(async (client) => {
          const { count } = await supabase
            .from('manager_client_chats')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', client.id)
            .eq('sender_type', 'client')
            .eq('is_read', false);

          return {
            ...client,
            unread_messages: count || 0
          };
        })
      );

      setClients(clientsWithUnread);

      // Fetch recent chat messages
      const { data: messages } = await supabase
        .from('manager_client_chats')
        .select(`
          *,
          profiles!manager_client_chats_client_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      const messagesWithClientNames = (messages || []).map(msg => ({
        ...msg,
        client_name: `${msg.profiles?.first_name} ${msg.profiles?.last_name}`
      }));

      setChatMessages(messagesWithClientNames);

    } catch (error) {
      console.error('Error fetching manager data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string, bookingType: 'regular' | 'yacht') => {
    try {
      const table = bookingType === 'yacht' ? 'yacht_bookings' : 'bookings';
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;

      // Log the update
      await supabase
        .from('booking_updates')
        .insert({
          booking_id: bookingId,
          booking_type: bookingType,
          updated_by: user?.id,
          update_type: 'status_change',
          new_values: { status: newStatus },
          notes: `Status changed to ${newStatus}`
        });

      fetchManagerData(); // Refresh data
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Error updating booking status');
    }
  };

  const sendMessage = async (clientId: string) => {
    if (!newMessage.trim() || !user) return;

    try {
      const { error } = await supabase
        .from('manager_client_chats')
        .insert({
          client_id: clientId,
          manager_id: user.id,
          message: newMessage,
          sender_type: 'manager'
        });

      if (error) throw error;

      setNewMessage('');
      fetchManagerData(); // Refresh messages
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    }
  };

  const markMessagesAsRead = async (clientId: string) => {
    try {
      await supabase
        .from('manager_client_chats')
        .update({ is_read: true })
        .eq('client_id', clientId)
        .eq('sender_type', 'client')
        .eq('is_read', false);

      fetchManagerData(); // Refresh data
    } catch (error) {
      console.error('Error marking messages as read:', error);
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

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      (booking.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
            Manager Dashboard
          </h1>
          <p className="text-gray-600">Manage bookings, clients, and communications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900">
                  {clients.reduce((sum, client) => sum + client.unread_messages, 0)}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Calendar },
              { id: 'bookings', label: 'All Bookings', icon: Calendar },
              { id: 'clients', label: 'Clients', icon: Users },
              { id: 'chat', label: 'Messages', icon: MessageSquare },
              { id: 'media', label: 'Media Upload', icon: Camera }
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
                {tab.id === 'chat' && clients.reduce((sum, client) => sum + client.unread_messages, 0) > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {clients.reduce((sum, client) => sum + client.unread_messages, 0)}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Bookings */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.profiles?.first_name} {booking.profiles?.last_name} 
                            {booking.customer_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.booking_date || booking.start_date} • {booking.participants} people
                          </p>
                        </div>
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="capitalize">{booking.status}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Clients */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Messages</h3>
                  <div className="space-y-4">
                    {chatMessages.slice(0, 5).map((message) => (
                      <div key={message.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{message.client_name}</p>
                          <p className="text-sm text-gray-600 truncate">{message.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                        {message.sender_type === 'client' && !message.is_read && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">All Bookings</h2>
                <div className="flex space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search bookings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Participants
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <p className="font-medium text-gray-900">
                                {booking.profiles?.first_name} {booking.profiles?.last_name}
                                {booking.customer_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                {booking.profiles?.email || booking.customer_email}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.booking_date || booking.start_date}
                            <br />
                            {booking.time_slot || `${booking.start_time} - ${booking.end_time}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.type === 'yacht' ? booking.yacht_name : 'Racing Experience'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {booking.participants}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            €{booking.total_price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={booking.status}
                              onChange={(e) => updateBookingStatus(booking.id, e.target.value, booking.type)}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-0 focus:ring-2 focus:ring-primary-500 ${getStatusColor(booking.status)}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                  <div key={client.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {client.first_name?.charAt(0)}{client.last_name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {client.first_name} {client.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{client.email}</p>
                        </div>
                      </div>
                      {client.unread_messages > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {client.unread_messages}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      {client.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{client.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Member since {new Date(client.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedClient(client.id);
                          setActiveTab('chat');
                          markMessagesAsRead(client.id);
                        }}
                        className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-300 text-sm"
                      >
                        Chat
                      </button>
                      <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-300 text-sm">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Client List */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Clients</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {clients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => {
                        setSelectedClient(client.id);
                        markMessagesAsRead(client.id);
                      }}
                      className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 ${
                        selectedClient === client.id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {client.first_name} {client.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{client.email}</p>
                        </div>
                        {client.unread_messages > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                            {client.unread_messages}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
                {selectedClient ? (
                  <>
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Chat with {clients.find(c => c.id === selectedClient)?.first_name} {clients.find(c => c.id === selectedClient)?.last_name}
                      </h3>
                    </div>
                    
                    <div className="h-96 overflow-y-auto p-4 space-y-4">
                      {chatMessages
                        .filter(msg => msg.client_id === selectedClient)
                        .map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.sender_type === 'manager' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_type === 'manager'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="text-sm">{message.message}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender_type === 'manager' ? 'text-primary-100' : 'text-gray-500'
                              }`}>
                                {new Date(message.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-gray-200">
                      <div className="flex space-x-4">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage(selectedClient)}
                          placeholder="Type your message..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <button
                          onClick={() => sendMessage(selectedClient)}
                          disabled={!newMessage.trim()}
                          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Select a client to start chatting</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Media Upload Tab */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Upload Client Media</h2>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Upload photos and videos for clients
                  </p>
                  <p className="text-gray-600 mb-4">
                    Select files to upload to client galleries after their sailing experience
                  </p>
                  <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-300">
                    Choose Files
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;