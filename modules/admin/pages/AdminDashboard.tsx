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
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../../../src/lib/supabase';
import HomeContentEditor from '../components/admin/HomeContentEditor';
import EventsContentEditor from '../components/admin/EventsContentEditor';
import ServicesContentEditor from '../components/admin/ServicesContentEditor';
import ContactContentEditor from '../components/admin/ContactContentEditor';
import BookingContentEditor from '../components/admin/BookingContentEditor';
import InquiriesManagement from '../components/admin/InquiriesManagement';
import ClientsManagement from '../components/admin/ClientsManagement';
import BookingsCalendar from '../components/admin/BookingsCalendar';
import MediaLibrary from '../components/admin/MediaLibrary';
import DatabaseManagement from '../components/admin/DatabaseManagement';
import CalendarManagement from '../components/admin/CalendarManagement';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    corporateInquiries: 0,
    monthlyTarget: 220,
    currentMonth: 180,
    conversionRate: 68,
    avgBookingValue: 195,
    mediaFiles: 0,
    websiteViews: 0,
    systemHealth: 98
  });

  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'booking', message: 'New booking from Marco Rossi', time: '2 hours ago', read: false },
    { id: 2, type: 'corporate', message: 'Corporate inquiry from TechCorp', time: '5 hours ago', read: false },
    { id: 3, type: 'review', message: 'New review (5 stars)', time: '1 day ago', read: true },
    { id: 4, type: 'system', message: 'Media library updated', time: '2 days ago', read: true },
    { id: 5, type: 'content', message: 'Homepage content published', time: '3 days ago', read: true }
  ]);

  // Save sidebar state to localStorage
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('adminSidebarCollapsed');
    if (savedSidebarState !== null) {
      setSidebarCollapsed(savedSidebarState === 'true');
    }
  }, []);

  // Update localStorage when sidebar state changes
  useEffect(() => {
    localStorage.setItem('adminSidebarCollapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/');
          return;
        }

        // For a production environment, you might want to check if the user has an admin role
        // by creating the necessary tables (profiles, user_roles) and relationships
        
        setUser(user);
        // Only fetch data after authentication is confirmed
        fetchStats();
        fetchBookings();
        fetchClients();
      } catch (error) {
        console.error('Auth error:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: reservations } = await supabase
        .from('reservations')
        .select('total_price, status, created_at');

      const { count: customersCount } = await supabase
        .from('unified_customers')
        .select('*', { count: 'exact', head: true });

      const { count: corporateCount } = await supabase
        .from('unified_inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'corporate');

      const totalRevenue = reservations?.reduce((sum, booking) => 
        booking.status === 'confirmed' || booking.status === 'completed' 
          ? sum + parseFloat(booking.total_price) 
          : sum, 0) || 0;

      // Count bookings for current month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyBookings = reservations?.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      }).length || 0;

      setStats({
        totalBookings: reservations?.length || 0,
        totalRevenue,
        activeUsers: customersCount || 0,
        corporateInquiries: corporateCount || 0,
        monthlyTarget: 220,
        currentMonth: monthlyBookings,
        conversionRate: 68,
        avgBookingValue: totalRevenue / (reservations?.length || 1),
        mediaFiles: 156, // Mock data
        websiteViews: 12450, // Mock data
        systemHealth: 98 // Mock data
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data } = await supabase
        .from('reservations')
        .select(`
          *,
          unified_customers(first_name, last_name, email, phone)
        `)
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
        .from('unified_customers')
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
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, category: 'main' },
    { id: 'calendar-management', label: 'Calendar Management', icon: Calendar, category: 'main' },
    { id: 'home-editor', label: 'Home Editor', icon: Home, category: 'content' },
    { id: 'events-editor', label: 'Events Editor', icon: CalendarDays, category: 'content' },
    { id: 'services-editor', label: 'Services Editor', icon: Briefcase, category: 'content' },
    { id: 'contact-editor', label: 'Contact Editor', icon: Contact, category: 'content' },
    { id: 'booking-editor', label: 'Booking Editor', icon: BookOpen, category: 'content' },
    { id: 'media-library', label: 'Media Library', icon: Image, category: 'content' },
    { id: 'inquiries', label: 'Inquiries', icon: ClipboardList, category: 'management' },
    { id: 'bookings', label: 'Bookings Calendar', icon: Calendar, category: 'management' },
    { id: 'clients', label: 'Client Management', icon: UserCheck, category: 'management' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, category: 'insights' },
    { id: 'seo', label: 'SEO & Marketing', icon: Globe, category: 'insights' },
    { id: 'payments', label: 'Payments', icon: CreditCard, category: 'business' },
    { id: 'fleet', label: 'Fleet Management', icon: Ship, category: 'business' },
    { id: 'reports', label: 'Reports', icon: FileText, category: 'business' },
    { id: 'database', label: 'Database', icon: Database, category: 'system' },
    { id: 'design', label: 'Design System', icon: Palette, category: 'system' },
    { id: 'security', label: 'Security', icon: Shield, category: 'system' },
    { id: 'notifications', label: 'Notifications', icon: Bell, category: 'system' },
    { id: 'settings', label: 'Settings', icon: Settings, category: 'system' }
  ];

  const menuCategories = [
    { id: 'main', label: 'Main', color: 'text-blue-600' },
    { id: 'content', label: 'Content Management', color: 'text-green-600' },
    { id: 'management', label: 'Business Management', color: 'text-purple-600' },
    { id: 'insights', label: 'Analytics & Insights', color: 'text-orange-600' },
    { id: 'business', label: 'Business Operations', color: 'text-red-600' },
    { id: 'system', label: 'System & Settings', color: 'text-gray-600' }
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
          <p className="text-blue-600 font-medium">Loading admin dashboard...</p>
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
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Anchor className="h-8 w-8 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">Garda Racing</h1>
                <p className="text-xs text-gray-600">Admin Panel</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={`p-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto ${sidebarCollapsed ? 'px-2' : ''}`}>
          {menuCategories.map((category) => (
            <div key={category.id}>
              {!sidebarCollapsed && (
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${category.color}`}>
                  {category.label}
                </h3>
              )}
              <div className="space-y-1">
                {menuItems
                  .filter(item => item.category === category.id)
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3 px-3'} py-2 rounded-lg transition-all duration-300 text-sm ${
                        activeTab === item.id
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                      title={sidebarCollapsed ? item.label : ''}
                    >
                      <item.icon className="h-4 w-4" />
                      {!sidebarCollapsed && (
                        <>
                          <span className="font-medium">{item.label}</span>
                          {item.id === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-auto">
                              {notifications.filter(n => !n.read).length}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Administrator</p>
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
            </>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
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
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:flex text-gray-600 hover:text-gray-900 items-center justify-center p-2 rounded-lg hover:bg-gray-100"
                  title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {sidebarCollapsed ? (
                    <ChevronRight className="h-5 w-5" />
                  ) : (
                    <ChevronLeft className="h-5 w-5" />
                  )}
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
                {/* System Health Indicator */}
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    stats.systemHealth >= 95 ? 'bg-green-500' :
                    stats.systemHealth >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">System: {stats.systemHealth}%</span>
                </div>

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
        <div className={activeTab === 'home-editor' || activeTab === 'events-editor' || activeTab === 'services-editor' || activeTab === 'contact-editor' || activeTab === 'booking-editor' || activeTab === 'media-library' || activeTab === 'database' || activeTab === 'calendar-management' ? '' : 'p-4 sm:p-6 lg:p-8'}>
          {/* Content Editors */}
          {activeTab === 'home-editor' && <HomeContentEditor />}
          {activeTab === 'events-editor' && <EventsContentEditor />}
          {activeTab === 'services-editor' && <ServicesContentEditor />}
          {activeTab === 'contact-editor' && <ContactContentEditor />}
          {activeTab === 'booking-editor' && <BookingContentEditor />}
          {activeTab === 'media-library' && <MediaLibrary />}
          {activeTab === 'database' && <DatabaseManagement />}
          {activeTab === 'calendar-management' && <CalendarManagement />}

          {/* Management Components */}
          {activeTab === 'inquiries' && <InquiriesManagement />}
          {activeTab === 'clients' && <ClientsManagement />}
          {activeTab === 'bookings' && <BookingsCalendar />}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Enhanced Stats Grid */}
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
                      <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</p>
                      <p className="text-xs text-green-600 mt-1">+3% this month</p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-xl">
                      <TrendingUp className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Media Files</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.mediaFiles}</p>
                    </div>
                    <Image className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Website Views</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.websiteViews.toLocaleString()}</p>
                    </div>
                    <Globe className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">System Health</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.systemHealth}%</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Plan vs Fact */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Plan vs Actual (Current Month)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{stats.monthlyTarget}</div>
                    <div className="text-sm text-gray-600">Target</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{stats.currentMonth}</div>
                    <div className="text-sm text-gray-600">Actual</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${
                      stats.currentMonth >= stats.monthlyTarget ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.currentMonth - stats.monthlyTarget > 0 ? '+' : ''}{stats.currentMonth - stats.monthlyTarget}
                    </div>
                    <div className="text-sm text-gray-600">Variance</div>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((stats.currentMonth / stats.monthlyTarget) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>0</span>
                    <span>{Math.round((stats.currentMonth / stats.monthlyTarget) * 100)}%</span>
                    <span>{stats.monthlyTarget}</span>
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
                              {booking.unified_customers?.first_name} {booking.unified_customers?.last_name || booking.customer_name}
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
                      onClick={() => setActiveTab('notifications')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="space-y-4">
                    {notifications.slice(0, 5).map((notification) => (
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('calendar-management')}
                    className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-300"
                  >
                    <Calendar className="h-8 w-8 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-blue-900">Manage Calendar</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('home-editor')}
                    className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-300"
                  >
                    <Edit3 className="h-8 w-8 text-green-600 mb-2" />
                    <span className="text-sm font-medium text-green-900">Edit Homepage</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('media-library')}
                    className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors duration-300"
                  >
                    <Image className="h-8 w-8 text-purple-600 mb-2" />
                    <span className="text-sm font-medium text-purple-900">Media Library</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('database')}
                    className="flex flex-col items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors duration-300"
                  >
                    <Database className="h-8 w-8 text-orange-600 mb-2" />
                    <span className="text-sm font-medium text-orange-900">Database</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Analytics and Reports</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <h4 className="font-semibold text-blue-900 mb-2">Traffic Sources</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Instagram</span>
                        <span className="font-semibold text-blue-900">45%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Website</span>
                        <span className="font-semibold text-blue-900">30%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Referrals</span>
                        <span className="font-semibold text-blue-900">25%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <h4 className="font-semibold text-green-900 mb-2">Conversion</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-green-700">View → Inquiry</span>
                        <span className="font-semibold text-green-900">12%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Inquiry → Payment</span>
                        <span className="font-semibold text-green-900">68%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Overall</span>
                        <span className="font-semibold text-green-900">8.2%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <h4 className="font-semibold text-purple-900 mb-2">Popular Time Slots</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-purple-700">09:00</span>
                        <span className="font-semibold text-purple-900">35%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">14:00</span>
                        <span className="font-semibold text-purple-900">40%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">16:00</span>
                        <span className="font-semibold text-purple-900">25%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs placeholder */}
          {!['dashboard', 'calendar-management', 'home-editor', 'events-editor', 'services-editor', 'contact-editor', 'booking-editor', 'media-library', 'database', 'inquiries', 'bookings', 'clients', 'analytics'].includes(activeTab) && (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {React.createElement(menuItems.find(item => item.id === activeTab)?.icon || Settings, {
                  className: "h-8 w-8 text-blue-600"
                })}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {menuItems.find(item => item.id === activeTab)?.label}
              </h3>
              <p className="text-gray-600 mb-6">
                This section is under development. Full functionality will be available soon.
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

export default AdminDashboard;