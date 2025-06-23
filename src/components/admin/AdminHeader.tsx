import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRole } from '../../hooks/useAuthRole';
import { Bell, LogOut, Settings, ChevronDown, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  notifications?: number;
  onMenuToggle: () => void;
}

/**
 * Header component for the admin dashboard
 */
const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  title, 
  subtitle, 
  notifications = 0,
  onMenuToggle 
}) => {
  const navigate = useNavigate();
  const { role } = useAuthRole();
  const [showDropdown, setShowDropdown] = React.useState(false);
  
  // Get current date formatted nicely
  const currentDate = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(new Date());

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            {/* Menu toggle for mobile */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden text-gray-600 hover:text-gray-900"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {subtitle ? (
                <p className="text-gray-600">{subtitle}</p>
              ) : (
                <p className="text-gray-600">{currentDate}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            {role === 'admin' || role === 'manager' ? (
              <div className="relative">
                <button 
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-300"
                  aria-label={`Notifications (${notifications} unread)`}
                  onClick={() => navigate('/admin/notifications')}
                >
                  <Bell className="h-6 w-6" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications > 9 ? '9+' : notifications}
                    </span>
                  )}
                </button>
              </div>
            ) : null}

            {/* User menu */}
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                aria-expanded={showDropdown}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden md:block font-medium">
                  {role === 'admin' ? 'Administrator' : role === 'manager' ? 'Manager' : 'User'}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {showDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1"
                  onBlur={() => setShowDropdown(false)}
                >
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/admin/settings');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;