import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import BookingsCalendar from '../components/admin/BookingsCalendar';
import ClientsManagement from '../components/admin/ClientsManagement';
import MediaLibrary from '../components/admin/MediaLibrary';
import DatabaseManagement from '../components/admin/DatabaseManagement';
import CalendarManagement from '../components/admin/CalendarManagement';
import HomeContentEditor from '../components/admin/HomeContentEditor';
import AdminSecuritySettings from '../components/admin/AdminSecuritySettings';
import { useAdminAccess } from '../hooks/useAdminAccess';
import { supabase } from '../lib/supabase';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { role, loading, error, isAdmin, isManager } = useAdminAccess();
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
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (loading) return;
    
    // If not logged in or doesn't have admin/manager role, redirect to home
    if (!isAdmin && !isManager) {
      navigate('/');
      return;
    }

    // Fetch data after authentication and role verification are confirmed
    fetchStats();
    fetchNotifications();
  }, [loading, isAdmin, isManager, navigate]);

  const fetchStats = async () => {
    try {
      // Fetch dashboard stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_admin_dashboard_stats');

      if (statsError) throw statsError;
      
      if (statsData) {
        setStats({
          ...stats,
          totalBookings: statsData.total_bookings || 0,
          totalRevenue: statsData.total_revenue || 0,
          activeUsers: statsData.total_customers || 0,
          corporateInquiries: statsData.pending_corporate_inquiries || 0,
          currentMonth: statsData.bookings_last_30_days || 0,
          avgBookingValue: statsData.avg_booking_value || 195
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to existing stats
    }
  };

  const fetchNotifications = async () => {
    try {
      // Fetch recent notifications (unseen)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data) {
        setNotifications(data);
      } else {
        // Fallback demo data
        setNotifications([
          { id: 1, type: 'booking', message: 'New booking from Marco Rossi', time: '2 hours ago', read: false },
          { id: 2, type: 'corporate', message: 'Corporate inquiry from TechCorp', time: '5 hours ago', read: false },
          { id: 3, type: 'review', message: 'New review (5 stars)', time: '1 day ago', read: true }
        ]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback data
      setNotifications([
        { id: 1, type: 'booking', message: 'New booking from Marco Rossi', time: '2 hours ago', read: false },
        { id: 2, type: 'corporate', message: 'Corporate inquiry from TechCorp', time: '5 hours ago', read: false },
        { id: 3, type: 'review', message: 'New review (5 stars)', time: '1 day ago', read: true }
      ]);
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

  if (error || (!isAdmin && !isManager)) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}>
        <AdminSidebar 
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSidebarOpen(false);
          }}
          isCollapsed={sidebarCollapsed}
          toggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
          notifications={notifications.filter(n => !n.read).length}
        />
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top Header */}
        <AdminHeader
          title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
          notifications={notifications.filter(n => !n.read).length}
          onMenuToggle={() => setSidebarOpen(true)}
        />

        {/* Content Area */}
        <div className={activeTab === 'home-editor' || activeTab === 'media-library' || activeTab === 'database' ? '' : 'p-4 sm:p-6 lg:p-8'}>
          {/* Different admin components based on activeTab */}
          {activeTab === 'calendar-management' && <CalendarManagement />}
          {activeTab === 'home-editor' && <HomeContentEditor />}
          {activeTab === 'media-library' && <MediaLibrary />}
          {activeTab === 'database' && <DatabaseManagement />}
          {activeTab === 'bookings' && <BookingsCalendar />}
          {activeTab === 'clients' && <ClientsManagement />}
          {activeTab === 'settings' && <AdminSecuritySettings />}
          {activeTab === 'security' && <AdminSecuritySettings />}

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
                      <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
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
                      <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
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
                      <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
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
                      <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Dashboard */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Dashboard</h3>
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
                      aria-label={`Progress: ${Math.round((stats.currentMonth / stats.monthlyTarget) * 100)}%`}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>0</span>
                    <span>{Math.round((stats.currentMonth / stats.monthlyTarget) * 100)}%</span>
                    <span>{stats.monthlyTarget}</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Notifications feed */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                    <button 
                      onClick={() => setActiveTab('notifications')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      aria-label="View all notifications"
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
                    {notifications.length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        No new notifications
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveTab('calendar-management')}
                      className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-300"
                      aria-label="Manage Calendar"
                    >
                      <svg className="h-8 w-8 text-blue-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-blue-900">Manage Calendar</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => setActiveTab('home-editor')}
                        className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-300"
                        aria-label="Edit Homepage"
                      >
                        <svg className="h-8 w-8 text-green-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="text-sm font-medium text-green-900">Edit Homepage</span>
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab('media-library')}
                      className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors duration-300"
                      aria-label="Media Library"
                    >
                      <svg className="h-8 w-8 text-purple-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium text-purple-900">Media Library</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => setActiveTab('database')}
                        className="flex flex-col items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors duration-300"
                        aria-label="Database"
                      >
                        <svg className="h-8 w-8 text-orange-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                        <span className="text-sm font-medium text-orange-900">Database</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {!['dashboard', 'calendar-management', 'home-editor', 'media-library', 'database', 'bookings', 'clients', 'settings', 'security'].includes(activeTab) && (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {activeTab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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