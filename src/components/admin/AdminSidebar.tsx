import React from 'react';
import { useAuthRole } from '../../hooks/useAuthRole';
import { 
  Home, Settings, BarChart3, Calendar, 
  Users, Database, Image, FileText,
  ChevronLeft, ChevronRight, User, Shield,
  Bell, Activity
} from 'lucide-react';

interface MenuItemProps {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  requiredRole?: 'admin' | 'manager';
  onClick: (id: string) => void;
  isActive: boolean;
  isCollapsed: boolean;
}

/**
 * Menu item component with role-based visibility
 */
const MenuItem: React.FC<MenuItemProps> = ({
  id, 
  label, 
  icon: Icon, 
  requiredRole,
  onClick, 
  isActive,
  isCollapsed
}) => {
  const { role } = useAuthRole();
  
  // Hide item if user doesn't have required role
  if (requiredRole === 'admin' && role !== 'admin') {
    return null;
  }
  
  if (requiredRole === 'manager' && role !== 'admin' && role !== 'manager') {
    return null;
  }

  return (
    <button
      onClick={() => onClick(id)}
      className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start space-x-3 px-3'} py-2 rounded-lg transition-all duration-300 text-sm ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg scale-105'
          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
      }`}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
      {!isCollapsed && (
        <span className="font-medium">{label}</span>
      )}
    </button>
  );
};

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  toggleCollapsed: () => void;
  notifications?: number;
}

/**
 * Admin sidebar with role-based menu items
 */
const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  toggleCollapsed,
  notifications = 0
}) => {
  const { role } = useAuthRole();
  
  const menuCategories = [
    { id: 'main', label: 'Main', color: 'text-blue-600' },
    { id: 'content', label: 'Content Management', color: 'text-green-600' },
    { id: 'management', label: 'Business Management', color: 'text-purple-600' },
    { id: 'system', label: 'System & Settings', color: 'text-gray-600' }
  ];
  
  const menuItems = [
    // Main
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, category: 'main', requiredRole: 'manager' },
    { id: 'calendar-management', label: 'Calendar', icon: Calendar, category: 'main', requiredRole: 'manager' },
    
    // Content Management
    { id: 'home-editor', label: 'Home Editor', icon: Home, category: 'content', requiredRole: 'admin' },
    { id: 'media-library', label: 'Media Library', icon: Image, category: 'content', requiredRole: 'manager' },
    
    // Business Management
    { id: 'bookings', label: 'Bookings', icon: Calendar, category: 'management', requiredRole: 'manager' },
    { id: 'clients', label: 'Clients', icon: Users, category: 'management', requiredRole: 'manager' },
    
    // System & Settings
    { id: 'database', label: 'Database', icon: Database, category: 'system', requiredRole: 'admin' },
    { id: 'users', label: 'User Management', icon: User, category: 'system', requiredRole: 'admin' },
    { id: 'security', label: 'Security', icon: Shield, category: 'system', requiredRole: 'admin' },
    { id: 'notifications', label: 'Notifications', icon: Bell, category: 'system', requiredRole: 'manager', badge: notifications },
    { id: 'activity', label: 'Activity Log', icon: Activity, category: 'system', requiredRole: 'admin' },
    { id: 'settings', label: 'Settings', icon: Settings, category: 'system', requiredRole: 'manager' }
  ];
  
  return (
    <div className={`h-full flex flex-col bg-white shadow-lg transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-4 border-b border-gray-200">
        <h2 className={`${isCollapsed ? 'text-center' : ''} font-bold text-lg truncate`}>
          {isCollapsed ? 'GR' : 'Garda Racing'}
        </h2>
        {!isCollapsed && <p className="text-xs text-gray-500">Admin Panel</p>}
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        {menuCategories.map(category => {
          // Get items for this category
          const categoryItems = menuItems.filter(item => item.category === category.id);
          
          // Skip rendering category if no visible items for user's role
          if (!categoryItems.some(item => {
            if (item.requiredRole === 'admin') return role === 'admin';
            if (item.requiredRole === 'manager') return role === 'admin' || role === 'manager';
            return true;
          })) {
            return null;
          }
          
          return (
            <div key={category.id} className="mb-6">
              {!isCollapsed && (
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${category.color}`}>
                  {category.label}
                </h3>
              )}
              <div className="space-y-1">
                {categoryItems.map(item => (
                  <MenuItem 
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    icon={item.icon}
                    requiredRole={item.requiredRole}
                    onClick={setActiveTab}
                    isActive={activeTab === item.id}
                    isCollapsed={isCollapsed}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={toggleCollapsed}
          className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <><ChevronLeft className="h-5 w-5 mr-2" /> <span>Collapse</span></>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;