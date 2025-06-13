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
  AlertCircle,
  XCircle,
  Edit3,
  Home
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import HomeContentEditor from '../components/admin/HomeContentEditor';

const AdminDashboard = () => {
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
    avgBookingValue: 199
  });

  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'booking', message: 'Новое бронирование от Marco Rossi', time: '2 часа назад', read: false },
    { id: 2, type: 'corporate', message: 'Корпоративный запрос от TechCorp', time: '5 часов назад', read: false },
    { id: 3, type: 'review', message: 'Новый отзыв (5 звезд)', time: '1 день назад', read: true }
  ]);

  useEffect(() => {
    checkAuth();
    fetchStats();
    fetchBookings();
    fetchClients();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.email !== 'admin@gardaracing.com') {
        navigate('/');
        return;
      }
      
      setUser(user);
    } catch (error) {
      console.error('Auth error:', error);
      navigate('/');
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

      // Подсчет бронирований за текущий месяц
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
        .select(`
          *,
          profiles(first_name, last_name, email, phone)
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
    { id: 'dashboard', label: 'Дашборд', icon: BarChart3 },
    { id: 'home-editor', label: 'Редактор главной', icon: Home },
    { id: 'bookings', label: 'Бронирования', icon: Calendar },
    { id: 'clients', label: 'Клиенты', icon: Users },
    { id: 'analytics', label: 'Аналитика', icon: TrendingUp },
    { id: 'payments', label: 'Платежи', icon: CreditCard },
    { id: 'fleet', label: 'Флот', icon: Ship },
    { id: 'media', label: 'Медиа', icon: Camera },
    { id: 'reports', label: 'Отчеты', icon: FileText },
    { id: 'notifications', label: 'Уведомления', icon: Bell },
    { id: 'settings', label: 'Настройки', icon: Settings }
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
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Загрузка панели управления...</p>
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
              <p className="text-xs text-gray-600">Admin Panel</p>
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
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
              {item.id === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
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
              <p className="text-sm font-medium text-gray-900 truncate">Администратор</p>
              <p className="text-xs text-gray-600 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300"
          >
            <LogOut className="h-4 w-4" />
            <span>Выйти</span>
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
                    {menuItems.find(item => item.id === activeTab)?.label || 'Дашборд'}
                  </h1>
                  <p className="text-gray-600">
                    {new Date().toLocaleDateString('ru-RU', { 
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
        <div className={activeTab === 'home-editor' ? '' : 'p-4 sm:p-6 lg:p-8'}>
          {/* Home Content Editor */}
          {activeTab === 'home-editor' && <HomeContentEditor />}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Бронирования</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                      <p className="text-xs text-green-600 mt-1">+12% за месяц</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Доход</p>
                      <p className="text-3xl font-bold text-gray-900">€{stats.totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-green-600 mt-1">+8% за месяц</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-xl">
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Клиенты</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
                      <p className="text-xs text-blue-600 mt-1">+15% за месяц</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-xl">
                      <Users className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Конверсия</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.conversionRate}%</p>
                      <p className="text-xs text-green-600 mt-1">+3% за месяц</p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-xl">
                      <TrendingUp className="h-8 w-8 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan vs Fact */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">План-факт (текущий месяц)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{stats.monthlyTarget}</div>
                    <div className="text-sm text-gray-600">План</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{stats.currentMonth}</div>
                    <div className="text-sm text-gray-600">Факт</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold mb-2 ${
                      stats.currentMonth >= stats.monthlyTarget ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stats.currentMonth - stats.monthlyTarget > 0 ? '+' : ''}{stats.currentMonth - stats.monthlyTarget}
                    </div>
                    <div className="text-sm text-gray-600">Отклонение</div>
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
                    <h3 className="text-xl font-bold text-gray-900">Последние бронирования</h3>
                    <button 
                      onClick={() => setActiveTab('bookings')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Все →
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
                              {booking.profiles?.first_name} {booking.profiles?.last_name}
                            </p>
                            <p className="text-sm text-gray-600">{booking.booking_date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">€{booking.total_price}</p>
                          <p className="text-xs text-gray-600">{booking.participants} чел.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Уведомления</h3>
                    <button 
                      onClick={() => setActiveTab('notifications')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Все →
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
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {/* Filters and Actions */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Поиск бронирований..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Filter className="h-4 w-4" />
                      <span>Фильтры</span>
                    </button>
                  </div>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Plus className="h-4 w-4" />
                    <span>Новое бронирование</span>
                  </button>
                </div>
              </div>

              {/* Bookings Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Клиент</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Дата</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Время</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Участники</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Сумма</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Статус</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bookings.map((booking: any) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900">
                                {booking.profiles?.first_name} {booking.profiles?.last_name}
                              </p>
                              <p className="text-sm text-gray-600">{booking.profiles?.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-900">{booking.booking_date}</td>
                          <td className="px-6 py-4 text-gray-900">{booking.time_slot}</td>
                          <td className="px-6 py-4 text-gray-900">{booking.participants}</td>
                          <td className="px-6 py-4 font-semibold text-gray-900">€{booking.total_price}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              <span className="capitalize">{booking.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                <Trash2 className="h-4 w-4" />
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
              {/* Client Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">{stats.activeUsers}</div>
                    <div className="text-sm text-gray-600">Всего клиентов</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">85%</div>
                    <div className="text-sm text-gray-600">Повторные клиенты</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">4.8</div>
                    <div className="text-sm text-gray-600">Средний рейтинг</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-2">€{Math.round(stats.avgBookingValue)}</div>
                    <div className="text-sm text-gray-600">Средний чек</div>
                  </div>
                </div>
              </div>

              {/* Clients Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">База клиентов</h3>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Download className="h-4 w-4" />
                        <span>Экспорт</span>
                      </button>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Plus className="h-4 w-4" />
                        <span>Добавить клиента</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Клиент</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Контакты</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Регистрация</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Бронирования</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {clients.map((client: any) => (
                        <tr key={client.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {client.first_name?.charAt(0) || client.email?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {client.first_name} {client.last_name}
                                </p>
                                <p className="text-sm text-gray-600">{client.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Mail className="h-4 w-4" />
                                <span>{client.email}</span>
                              </div>
                              {client.phone && (
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <Phone className="h-4 w-4" />
                                  <span>{client.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-900">
                            {new Date(client.created_at).toLocaleDateString('ru-RU')}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              0 бронирований
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                                <Mail className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg">
                                <MessageSquare className="h-4 w-4" />
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

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Аналитика и отчеты</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <h4 className="font-semibold text-blue-900 mb-2">Источники трафика</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Instagram</span>
                        <span className="font-semibold text-blue-900">45%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Сайт</span>
                        <span className="font-semibold text-blue-900">30%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Рекомендации</span>
                        <span className="font-semibold text-blue-900">25%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <h4 className="font-semibold text-green-900 mb-2">Конверсия</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-green-700">Просмотр → Заявка</span>
                        <span className="font-semibold text-green-900">12%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Заявка → Оплата</span>
                        <span className="font-semibold text-green-900">68%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Общая</span>
                        <span className="font-semibold text-green-900">8.2%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <h4 className="font-semibold text-purple-900 mb-2">Популярные слоты</h4>
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
          {!['dashboard', 'home-editor', 'bookings', 'clients', 'analytics'].includes(activeTab) && (
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
                Этот раздел находится в разработке. Скоро здесь появится полный функционал.
              </p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300">
                Уведомить о готовности
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;