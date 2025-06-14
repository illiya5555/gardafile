import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Bell, 
  Search,
  Filter,
  ChevronDown,
  CheckCircle,
  Clock,
  XCircle,
  Ship,
  User,
  Mail,
  Phone,
  Edit,
  Eye,
  Download,
  RefreshCw,
  Plus,
  Camera,
  Upload
} from 'lucide-react';
import { supabase } from '../lib/supabase';

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

interface Client {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  created_at: string;
  bookings_count?: number;
  total_spent?: number;
  last_booking?: string;
}

interface ChatMessage {
  id: string;
  client_id: string;
  manager_id: string;
  message: string;
  sender_type: 'manager' | 'client';
  is_read: boolean;
  created_at: string;
  client?: {
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
}

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New booking from Marco Rossi', time: '2 hours ago', read: false },
    { id: 2, message: 'Client message from Sarah Johnson', time: '5 hours ago', read: false },
    { id: 3, message: 'Booking status updated', time: '1 day ago', read: true }
  ]);

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
      
      // Check if user has manager role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role_name)
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        navigate('/login');
        return;
      }

      if (!profile.user_roles || profile.user_roles.role_name !== 'manager') {
        console.error('Access denied: User is not a manager');
        navigate('/dashboard');
        return;
      }
      
      setUser(user);
      fetchData();
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchBookings(),
        fetchClients(),
        fetchChats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('booking_date', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out admin and manager profiles
      const clientProfiles = await Promise.all(
        (data || []).filter(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role_name')
            .eq('id', profile.role_id)
            .single();
          
          return roleData?.role_name === 'client';
        })
      );
      
      // Get booking statistics for each client
      const clientsWithStats = await Promise.all(
        clientProfiles.map(async (client) => {
          const { data: bookings } = await supabase
            .from('bookings')
            .select('total_price, created_at')
            .eq('user_id', client.id)
            .order('created_at', { ascending: false });

          const bookingsCount = bookings?.length || 0;
          const totalSpent = bookings?.reduce((sum, booking) => 
            sum + parseFloat(booking.total_price), 0) || 0;
          const lastBooking = bookings && bookings.length > 0 ? bookings[0].created_at : null;

          return {
            ...client,
            bookings_count: bookingsCount,
            total_spent: totalSpent,
            last_booking: lastBooking
          };
        })
      );

      setClients(clientsWithStats);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchChats = async () => {
    try {
      const { data, error } = await supabase
        .from('manager_client_chats')
        .select(`
          *,
          client:client_id(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChats(data || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (error) throw error;
      
      // Update local state
      setBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus as any }
            : booking
        )
      );

      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus as any });
      }

      alert(`Booking status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      alert('Error updating status: ' + error.message);
    }
  };

  const sendMessage = async () => {
    if (!chatMessage.trim() || !activeChat || !user) return;

    try {
      const newMessage = {
        client_id: activeChat,
        manager_id: user.id,
        message: chatMessage,
        sender_type: 'manager',
        is_read: false
      };

      const { data, error } = await supabase
        .from('manager_client_chats')
        .insert(newMessage)
        .select(`
          *,
          client:client_id(
            id,
            first_name,
            last_name,
            email
          )
        `)
        .single();

      if (error) throw error;

      // Update local state
      setChats(prev => [data, ...prev]);
      setChatMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert('Error sending message: ' + error.message);
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
      case 'completed': return <CheckCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
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

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || (() => {
      const bookingDate = new Date(booking.booking_date);
      const now = new Date();
      switch (dateFilter) {
        case 'today':
          return bookingDate.toDateString() === now.toDateString();
        case 'tomorrow':
          const tomorrow = new Date(now);
          tomorrow.setDate(now.getDate() + 1);
          return bookingDate.toDateString() === tomorrow.toDateString();
        case 'thisWeek':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return bookingDate >= weekStart && bookingDate <= weekEnd;
        case 'upcoming':
          return bookingDate >= now;
        case 'past':
          return bookingDate < now;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const filteredClients = clients.filter(client => {
    const fullName = `${client.first_name || ''} ${client.last_name || ''}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone && client.phone.includes(searchTerm))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 font-medium">Loading manager dashboard...</p>
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
                  M
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Manager</h2>
                  <p className="text-gray-600 text-sm">{user?.email}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2 mb-6">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-300 ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-300 ${
                    activeTab === 'bookings'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Ship className="h-5 w-5" />
                  <span>Bookings</span>
                </button>
                <button
                  onClick={() => setActiveTab('clients')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-300 ${
                    activeTab === 'clients'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users className="h-5 w-5" />
                  <span>Clients</span>
                </button>
                <button
                  onClick={() => setActiveTab('messages')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-300 ${
                    activeTab === 'messages'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Messages</span>
                  {chats.filter(chat => !chat.is_read && chat.sender_type === 'client').length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-auto">
                      {chats.filter(chat => !chat.is_read && chat.sender_type === 'client').length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-300 ${
                    activeTab === 'settings'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </button>
              </nav>

              {/* Notifications */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>Notifications</span>
                  <span className="bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-1">
                    {notifications.filter(n => !n.read).length}
                  </span>
                </h3>
                <div className="space-y-3 max-h-[200px] overflow-y-auto">
                  {notifications.slice(0, 3).map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-3 rounded-lg text-sm ${notification.read ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-500'}`}
                    >
                      <p className={`${notification.read ? 'text-gray-700' : 'text-gray-900 font-medium'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  ))}
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
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Today's Bookings</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {bookings.filter(b => new Date(b.booking_date).toDateString() === new Date().toDateString()).length}
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Pending Confirmations</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {bookings.filter(b => b.status === 'pending').length}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Unread Messages</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {chats.filter(chat => !chat.is_read && chat.sender_type === 'client').length}
                        </p>
                      </div>
                      <MessageSquare className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {bookings.slice(0, 5).map((booking) => (
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
                              <h3 className="font-semibold text-gray-900">{booking.customer_name}</h3>
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
                          </div>
                        </div>
                      </div>
                    ))}
                    {bookings.length === 0 && (
                      <div className="p-8 text-center">
                        <p className="text-gray-600">No bookings found</p>
                      </div>
                    )}
                  </div>
                  {bookings.length > 5 && (
                    <div className="p-4 border-t border-gray-200 text-center">
                      <button 
                        onClick={() => setActiveTab('bookings')}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View all bookings
                      </button>
                    </div>
                  )}
                </div>

                {/* Recent Clients */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Clients</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {clients.slice(0, 5).map((client) => (
                      <div 
                        key={client.id} 
                        className="p-6 hover:bg-gray-50 transition-colors duration-300 cursor-pointer"
                        onClick={() => {
                          setSelectedClient(client);
                          setShowClientDetails(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {client.first_name?.[0] || client.email[0].toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {client.first_name && client.last_name 
                                  ? `${client.first_name} ${client.last_name}` 
                                  : client.email}
                              </h3>
                              <p className="text-gray-600 text-sm">{client.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {client.bookings_count || 0} bookings
                            </p>
                            {client.last_booking && (
                              <p className="text-xs text-gray-500">
                                Last: {new Date(client.last_booking).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {clients.length === 0 && (
                      <div className="p-8 text-center">
                        <p className="text-gray-600">No clients found</p>
                      </div>
                    )}
                  </div>
                  {clients.length > 5 && (
                    <div className="p-4 border-t border-gray-200 text-center">
                      <button 
                        onClick={() => setActiveTab('clients')}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View all clients
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Bookings Management</h1>
                  <a 
                    href="/booking" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Booking</span>
                  </a>
                </div>

                {/* Filters */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Dates</option>
                      <option value="today">Today</option>
                      <option value="tomorrow">Tomorrow</option>
                      <option value="thisWeek">This Week</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="past">Past</option>
                    </select>
                  </div>
                </div>

                {/* Bookings Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Client
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Participants
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredBookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{booking.customer_name}</div>
                                  <div className="text-sm text-gray-500">{booking.customer_email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatDate(booking.booking_date)}</div>
                              <div className="text-sm text-gray-500">{booking.time_slot}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{booking.participants}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={booking.status}
                                onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                                className={`text-sm font-medium px-3 py-1 rounded-full border ${getStatusColor(booking.status)}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              €{booking.total_price}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowBookingDetails(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="View Details"
                                >
                                  <Eye className="h-5 w-5" />
                                </button>
                                <button
                                  className="text-green-600 hover:text-green-900"
                                  title="Send Email"
                                >
                                  <Mail className="h-5 w-5" />
                                </button>
                                <button
                                  className="text-purple-600 hover:text-purple-900"
                                  title="Upload Photos"
                                >
                                  <Camera className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredBookings.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-gray-600">No bookings found matching your filters</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Clients Tab */}
            {activeTab === 'clients' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
                </div>

                {/* Search */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search clients by name, email or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Clients Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Client
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bookings
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Spent
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Booking
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredClients.map((client) => (
                          <tr key={client.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                  {client.first_name?.[0] || client.email[0].toUpperCase()}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {client.first_name && client.last_name 
                                      ? `${client.first_name} ${client.last_name}` 
                                      : 'Unnamed Client'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Client since {new Date(client.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{client.email}</div>
                              <div className="text-sm text-gray-500">{client.phone || 'No phone'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{client.bookings_count || 0}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              €{client.total_spent || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {client.last_booking 
                                ? new Date(client.last_booking).toLocaleDateString() 
                                : 'Never'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedClient(client);
                                    setShowClientDetails(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="View Details"
                                >
                                  <Eye className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveChat(client.id);
                                    setActiveTab('messages');
                                  }}
                                  className="text-green-600 hover:text-green-900"
                                  title="Message Client"
                                >
                                  <MessageSquare className="h-5 w-5" />
                                </button>
                                <button
                                  className="text-purple-600 hover:text-purple-900"
                                  title="Send Email"
                                >
                                  <Mail className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {filteredClients.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-gray-600">No clients found matching your search</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Client Messages</h1>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
                    {/* Client List */}
                    <div className="border-r border-gray-200 overflow-y-auto">
                      <div className="p-4 border-b border-gray-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search clients..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {clients.map((client) => {
                          const unreadCount = chats.filter(
                            chat => chat.client_id === client.id && 
                            chat.sender_type === 'client' && 
                            !chat.is_read
                          ).length;
                          
                          const lastMessage = chats.find(chat => 
                            chat.client_id === client.id
                          );
                          
                          return (
                            <div 
                              key={client.id} 
                              onClick={() => setActiveChat(client.id)}
                              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-300 ${
                                activeChat === client.id ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    {client.first_name?.[0] || client.email[0].toUpperCase()}
                                  </div>
                                  {unreadCount > 0 && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                                      {unreadCount}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {client.first_name && client.last_name 
                                      ? `${client.first_name} ${client.last_name}` 
                                      : client.email}
                                  </p>
                                  {lastMessage && (
                                    <p className="text-xs text-gray-500 truncate">
                                      {lastMessage.message.length > 30 
                                        ? lastMessage.message.substring(0, 30) + '...' 
                                        : lastMessage.message}
                                    </p>
                                  )}
                                </div>
                                {lastMessage && (
                                  <p className="text-xs text-gray-500">
                                    {new Date(lastMessage.created_at).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {clients.length === 0 && (
                          <div className="p-8 text-center">
                            <p className="text-gray-600">No clients found</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Chat Area */}
                    <div className="col-span-2 flex flex-col">
                      {activeChat ? (
                        <>
                          {/* Chat Header */}
                          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {clients.find(c => c.id === activeChat)?.first_name?.[0] || 
                                 clients.find(c => c.id === activeChat)?.email[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {clients.find(c => c.id === activeChat)?.first_name && 
                                   clients.find(c => c.id === activeChat)?.last_name
                                    ? `${clients.find(c => c.id === activeChat)?.first_name} ${clients.find(c => c.id === activeChat)?.last_name}`
                                    : clients.find(c => c.id === activeChat)?.email}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {clients.find(c => c.id === activeChat)?.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                                <Phone className="h-5 w-5" />
                              </button>
                              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                                <Mail className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Chat Messages */}
                          <div className="flex-1 p-4 overflow-y-auto">
                            <div className="space-y-4">
                              {chats
                                .filter(chat => chat.client_id === activeChat)
                                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                                .map((chat) => (
                                  <div 
                                    key={chat.id} 
                                    className={`flex ${chat.sender_type === 'manager' ? 'justify-end' : 'justify-start'}`}
                                  >
                                    <div 
                                      className={`max-w-xs rounded-lg p-3 ${
                                        chat.sender_type === 'manager' 
                                          ? 'bg-blue-600 text-white' 
                                          : 'bg-gray-100 text-gray-800'
                                      }`}
                                    >
                                      <p className="text-sm">{chat.message}</p>
                                      <p className={`text-xs mt-1 ${
                                        chat.sender_type === 'manager' ? 'text-blue-200' : 'text-gray-500'
                                      }`}>
                                        {new Date(chat.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              {chats.filter(chat => chat.client_id === activeChat).length === 0 && (
                                <div className="text-center py-8">
                                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                  <p className="text-gray-500">No messages yet</p>
                                  <p className="text-sm text-gray-400">Start the conversation with this client</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Chat Input */}
                          <div className="p-4 border-t border-gray-200">
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={chatMessage}
                                onChange={(e) => setChatMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                              />
                              <button
                                onClick={sendMessage}
                                disabled={!chatMessage.trim()}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Send
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No chat selected</h3>
                            <p className="text-gray-600">
                              Select a client from the list to start messaging
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Manager Account Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">Email Notifications</p>
                            <p className="text-sm text-gray-600">Receive booking and message notifications via email</p>
                          </div>
                          <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
                            <input 
                              type="checkbox" 
                              className="sr-only" 
                              defaultChecked={true}
                            />
                            <span className="block w-6 h-6 bg-white rounded-full shadow-md transform translate-x-6"></span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">Booking Alerts</p>
                            <p className="text-sm text-gray-600">Get notified when new bookings are made</p>
                          </div>
                          <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
                            <input 
                              type="checkbox" 
                              className="sr-only" 
                              defaultChecked={true}
                            />
                            <span className="block w-6 h-6 bg-white rounded-full shadow-md transform translate-x-6"></span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">Client Messages</p>
                            <p className="text-sm text-gray-600">Get notified when clients send messages</p>
                          </div>
                          <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200">
                            <input 
                              type="checkbox" 
                              className="sr-only" 
                              defaultChecked={true}
                            />
                            <span className="block w-6 h-6 bg-white rounded-full shadow-md transform translate-x-6"></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Account Security</h3>
                      <div className="space-y-4">
                        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                          <span>Change Password</span>
                        </button>
                        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                          <span>Enable Two-Factor Authentication</span>
                        </button>
                      </div>
                    </div>
                  </div>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedBooking.status)}
                    <span className="font-medium capitalize">{selectedBooking.status}</span>
                  </div>
                  <select
                    value={selectedBooking.status}
                    onChange={(e) => updateBookingStatus(selectedBooking.id, e.target.value)}
                    className="bg-white px-3 py-1 rounded-md text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
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
                <h4 className="text-sm font-medium text-gray-500 mb-3">Manager Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="flex items-center justify-center space-x-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-300">
                    <Mail className="h-5 w-5" />
                    <span>Send Email</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-300">
                    <Upload className="h-5 w-5" />
                    <span>Upload Photos</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors duration-300">
                    <Download className="h-5 w-5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 flex justify-end">
                <button
                  onClick={() => setShowBookingDetails(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {showClientDetails && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Client Details</h3>
                <button
                  onClick={() => setShowClientDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {selectedClient.first_name?.[0] || selectedClient.email[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedClient.first_name && selectedClient.last_name 
                      ? `${selectedClient.first_name} ${selectedClient.last_name}` 
                      : 'Unnamed Client'}
                  </h2>
                  <p className="text-gray-600">
                    Client since {new Date(selectedClient.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                  <p className="text-lg text-gray-900">{selectedClient.email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Phone</h4>
                  <p className="text-lg text-gray-900">{selectedClient.phone || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Total Bookings</h4>
                  <p className="text-lg text-gray-900">{selectedClient.bookings_count || 0}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Total Spent</h4>
                  <p className="text-lg text-gray-900">€{selectedClient.total_spent || 0}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Client Bookings</h4>
                <div className="space-y-4">
                  {bookings
                    .filter(booking => 
                      booking.customer_email === selectedClient.email
                    )
                    .slice(0, 3)
                    .map(booking => (
                      <div key={booking.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">{formatDate(booking.booking_date)}</p>
                            <p className="text-sm text-gray-600">{booking.time_slot} • {booking.participants} participants</p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  {bookings.filter(booking => booking.customer_email === selectedClient.email).length === 0 && (
                    <p className="text-gray-600 text-center py-4">No bookings found for this client</p>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Manager Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => {
                      setActiveChat(selectedClient.id);
                      setActiveTab('messages');
                      setShowClientDetails(false);
                    }}
                    className="flex items-center justify-center space-x-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-300"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Message</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-300">
                    <Mail className="h-5 w-5" />
                    <span>Send Email</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors duration-300">
                    <Calendar className="h-5 w-5" />
                    <span>Create Booking</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 flex justify-end">
                <button
                  onClick={() => setShowClientDetails(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;