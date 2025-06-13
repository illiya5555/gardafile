import React, { useState } from 'react';
import { User, LogOut, Calendar, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user || !profile) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-colors duration-300"
      >
        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <span className="hidden sm:inline font-medium">
          {profile.first_name || 'User'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="font-semibold text-gray-900">
              {profile.first_name} {profile.last_name}
            </p>
            <p className="text-sm text-gray-600">{profile.email}</p>
          </div>
          
          <div className="py-2">
            <Link
              to="/my-bookings"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-300"
            >
              <Calendar className="h-4 w-4" />
              <span>My Bookings</span>
            </Link>
            
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-300"
            >
              <Settings className="h-4 w-4" />
              <span>Profile Settings</span>
            </Link>
          </div>
          
          <div className="border-t border-gray-200 pt-2">
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-300 w-full text-left"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;