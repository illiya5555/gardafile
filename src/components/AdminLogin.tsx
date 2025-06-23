import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, User, AlertCircle, Shield, Users, Person } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminLoginProps {
  onClose: () => void;
}

type LoginRole = 'client' | 'manager' | 'admin';

const AdminLogin: React.FC<AdminLoginProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<LoginRole | null>(null);

  const handleRoleSelection = (role: LoginRole) => {
    setSelectedRole(role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Attempt to sign in with provided credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Check if user has admin or manager role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            role_id,
            user_roles(role_name)
          `)
          .eq('id', data.user.id)
          .maybeSingle();
          
        if (profileError) throw profileError;
        
        // If no profile exists, create one with default role
        if (!profileData) {
          // Get client role ID
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('id')
            .eq('role_name', 'client')
            .maybeSingle();
            
          if (roleData) {
            // Use upsert to handle possible race conditions with auth triggers
            await supabase
              .from('profiles')
              .upsert({
                id: data.user.id,
                email: data.user.email,
                role_id: roleData.id
              }, { onConflict: 'id' });
          }
          
          if (selectedRole !== 'client') {
            throw new Error('Access denied: User does not have required permissions');
          }
          
          // Success for client login
          onClose();
          navigate('/dashboard');
          return;
        }
        
        // Check if user has the required role for selected portal
        const roleName = profileData.user_roles?.role_name;
        
        if (selectedRole === 'admin' && roleName !== 'admin') {
          throw new Error('Access denied: Admin privileges required');
        }
        
        if (selectedRole === 'manager' && roleName !== 'admin' && roleName !== 'manager') {
          throw new Error('Access denied: Manager privileges required');
        }
        
        // Success! Close modal and navigate to appropriate dashboard
        onClose();
        if (selectedRole === 'client') {
          navigate('/dashboard');
        } else {
          navigate('/admin');
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {selectedRole ? (
          <div>
            <div className="flex justify-between items-center bg-primary-600 text-white px-6 py-4">
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <h2 className="text-xl font-semibold">
                  {selectedRole === 'client' ? 'Client Portal' : 
                   selectedRole === 'manager' ? 'Manager Dashboard' : 
                   'Admin Control Panel'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-1"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mt-4 mx-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
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
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-70"
                >
                  {loading ? 'Signing in...' : 'Login'}
                </button>
              </div>
              
              {selectedRole === 'client' && (
                <div className="text-center mt-4 text-sm text-gray-600">
                  <p>Don't have an account? <a href="/signup" className="text-primary-600 hover:text-primary-800 font-medium">Sign up</a></p>
                </div>
              )}
            </form>
          </div>
        ) : (
          <div>
            <div className="bg-primary-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Dashboard Login</h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-1"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-gray-600 mb-4 text-center">Select your access level to continue:</p>
              
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => handleRoleSelection('client')}
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
                >
                  <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <Person className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Client Portal</h3>
                    <p className="text-sm text-gray-600">Access your bookings and profile</p>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelection('manager')}
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
                >
                  <div className="bg-green-100 p-3 rounded-full mr-4">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Manager Dashboard</h3>
                    <p className="text-sm text-gray-600">Manage bookings and clients</p>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelection('admin')}
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
                >
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Admin Control Panel</h3>
                    <p className="text-sm text-gray-600">Full system administration</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;