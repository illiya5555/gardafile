import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  LogOut, 
  Settings,
  BarChart3,
  MessageSquare,
  Building,
  Star,
  Anchor,
  Menu,
  X,
  Bell,
  Camera,
  FileText,
  Ship,
  CreditCard,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Edit3,
  Home,
  CalendarDays,
  Briefcase,
  Contact,
  ClipboardList,
  UserCheck,
  BookOpen,
  Image,
  Globe,
  Palette,
  Database,
  Shield,
  Activity
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import BookingsCalendar from '../components/admin/BookingsCalendar';
import ClientsManagement from '../components/admin/ClientsManagement';
import InquiriesManagement from '../components/admin/InquiriesManagement';
import CalendarManagement from '../components/admin/CalendarManagement';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    corporateInquiries: 0,
    monthlyTarget: 220,
    currentMonth: 180,
    conversionRate: 68,
    avgBookingValue: 195
  });

  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'booking', message: 'New booking from Marco Rossi', time: '2 hours ago', read: false },
    { id: 2, type: 'corporate', message: 'Corporate inquiry from TechCorp', time: '5 hours ago', read: false },
    { id: 3, type: 'review', message: 'New review (5 stars)', time: '1 day ago', read: true }
  ]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
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

      if (!profile || !profile.user_roles || profile.user_roles.role_name !== 'manager') {
        console.error('Access denied: User is not a manager');
        navigate('/login');
        return;
      }
      
      setUser(user);
      // Only fetch data after authentication is confirmed
      fetchStats();
      fetchBookings();
      fetchClients();
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('total_price, status, created_at');

      const { count: profilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: corporateCount } = await supabase
        .from('corporate_inquiries')
        .select('*', { count: 'exact', head: true });

      const totalRevenue = bookings?.reduce((sum, booking) => 
        booking.status === 'confirmed' || booking.status === 'completed' 
          ? sum + parseFloat(booking.total_price) 
          : sum, 0) || 0;

      // Count bookings for current month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyBookings = bookings?.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      }).length || 0;

      setStats({
        totalBookings: bookings?.length || 0,
        totalRevenue,
        activeUsers: profilesCount || 0,
        corporateInquiries: corporateCount || 0,
        monthlyTarget: 220,
        currentMonth: monthlyBookings,
        conversionRate: 68,
        avgBookingValue: totalRevenue / (bookings?.length || 1)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'calendar-management', label: 'Calendar Management', icon: Calendar },
    { id: 'bookings', label: 'Bookings Calendar', icon: CalendarDays },
    { id: 'clients', label: 'Client Management', icon: UserCheck },
    { id: 'inquiries', label: 'Inquiries', icon: ClipboardList },
    { id: 'messages', label: 'Client Messages', icon: MessageSquare }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Loading manager dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Anchor className="h-8 w-8 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Garda Racing</h1>
              <p className="text-xs text-gray-600">Manager Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
              {item.id === 'messages' && notifications.filter(n => !n.read).length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-auto">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Manager</p>
              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-600 hover:text-gray-900"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-gray-600">
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-300">
                    <Bell className="h-6 w-6" />
                    {notifications.filter(n => !n.read).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className={activeTab === 'calendar-management' || activeTab === 'bookings' || activeTab === 'clients' || activeTab === 'inquiries' ? '' : 'p-4 sm:p-6 lg:p-8'}>
          {/* Management Components */}
          {activeTab === 'calendar-management' && <CalendarManagement />}
          {activeTab === 'bookings' && <BookingsCalendar />}
          {activeTab === 'clients' && <ClientsManagement />}
          {activeTab === 'inquiries' && <InquiriesManagement />}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                      <p className="text-xs text-green-600 mt-1">+12% this month</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold text-gray-900">€{stats.totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-green-600 mt-1">+8% this month</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-xl">
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Active Clients</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
                      <p className="text-xs text-blue-600 mt-1">+15% this month</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-xl">
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Corporate Inquiries</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.corporateInquiries}</p>
                      <p className="text-xs text-green-600 mt-1">+5 new</p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-xl">
                      <Building className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Recent Bookings</h3>
                    <button 
                      onClick={() => setActiveTab('bookings')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking: any) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {booking.customer_name}
                            </p>
                            <p className="text-sm text-gray-600">{booking.booking_date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">€{booking.total_price}</p>
                          <p className="text-xs text-gray-600">{booking.participants} people</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                    <button 
                      onClick={() => setActiveTab('messages')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`p-4 rounded-xl border-l-4 ${
                        notification.read ? 'bg-gray-50 border-gray-300' : 'bg-blue-50 border-blue-500'
                      }`}>
                        <p className="font-medium text-gray-900">{notification.message}</p>
                        <p className="text-sm text-gray-600 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('calendar-management')}
                    className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-300"
                  >
                    <Calendar className="h-8 w-8 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-blue-900">Manage Calendar</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('clients')}
                    className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-300"
                  >
                    <UserCheck className="h-8 w-8 text-green-600 mb-2" />
                    <span className="text-sm font-medium text-green-900">Client Management</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('inquiries')}
                    className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors duration-300"
                  >
                    <ClipboardList className="h-8 w-8 text-purple-600 mb-2" />
                    <span className="text-sm font-medium text-purple-900">Inquiries</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Client Messages
              </h3>
              <p className="text-gray-600 mb-6">
                This section is under development. Full messaging functionality will be available soon.
              </p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300">
                Notify When Ready
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;