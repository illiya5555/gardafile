import React, { useState } from 'react';
import { User, LogIn, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AuthModal from './AuthModal';
import { useAuth } from '../hooks/useAuth';

const AuthButton = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, profile, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/'; // Redirect to home page after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getDashboardUrl = () => {
    if (!profile?.role_name) return '/client-dashboard';
    
    switch (profile.role_name) {
      case 'admin':
        return '/admin';
      case 'manager':
        return '/manager-dashboard';
      case 'client':
        return '/client-dashboard';
      default:
        return '/client-dashboard';
    }
  };

  const getDashboardLabel = () => {
    if (!profile?.role_name) return 'Dashboard';
    
    switch (profile.role_name) {
      case 'admin':
        return 'Admin Dashboard';
      case 'manager':
        return 'Manager Dashboard';
      case 'client':
        return 'My Dashboard';
      default:
        return 'Dashboard';
    }
  };

  if (loading) {
    return (
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
    );
  }

  if (user) {
    return (
      <div className="relative group">
        <button 
          className="flex items-center space-x-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors duration-300"
          aria-expanded="false"
          aria-haspopup="true"
        >
          <User className="h-4 w-4" />
          <span className="hidden sm:block">
            {profile?.first_name || user.email?.split('@')[0]}
          </span>
        </button>
        
        <div 
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="p-4 border-b border-gray-100">
            <p className="font-medium text-gray-900">
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-xs text-primary-600 capitalize">
              {profile?.role_name || 'Client'}
            </p>
          </div>
          <div className="p-2">
            <a
              href={getDashboardUrl()}
              className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-300"
              role="menuitem"
            >
              {getDashboardLabel()}
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors duration-300"
              role="menuitem"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowAuthModal(true)}
        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-300"
        aria-label="Login or create account"
      >
        <LogIn className="h-4 w-4" />
        <span>Login</span>
      </button>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
};

export default AuthButton;