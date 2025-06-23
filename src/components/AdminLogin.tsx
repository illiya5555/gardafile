import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, User, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import TwoFactorAuth from './TwoFactorAuth';

interface AdminLoginProps {
  onClose: () => void;
}

/**
 * Admin login component with two-factor authentication support
 */
const AdminLogin: React.FC<AdminLoginProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Check if 2FA is required
        // In a real implementation, you would check if the user has 2FA enabled
        const needsTwoFactor = false; // Placeholder - would come from Supabase MFA check
        
        if (needsTwoFactor) {
          // Show 2FA verification screen
          setShowTwoFactor(true);
          setLoading(false);
          return;
        }
        
        // Get user role from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role_id')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        // Get role name from user_roles table
        const { data: role, error: roleError } = await supabase
          .from('user_roles')
          .select('role_name')
          .eq('id', profile.role_id)
          .single();

        if (roleError) {
          throw roleError;
        }

        // Check if user has admin or manager role
        if (role.role_name !== 'admin' && role.role_name !== 'manager') {
          throw new Error('Access denied: You do not have permission to access the admin area');
        }
        
        // Close modal and navigate to admin dashboard
        onClose();
        navigate('/admin');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  const handleTwoFactorSuccess = () => {
    // 2FA verification was successful, complete login
    setShowTwoFactor(false);
    onClose();
    navigate('/admin');
  };

  if (showTwoFactor) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <TwoFactorAuth
            email={credentials.email}
            onSuccess={handleTwoFactorSuccess}
            onCancel={() => setShowTwoFactor(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 md:p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <Lock className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Admin Access</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter email"
                required
                aria-required="true"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                id="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter password"
                required
                aria-required="true"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              aria-busy={loading}
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;