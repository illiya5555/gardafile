import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthRole } from '../../hooks/useAuthRole';
import { Lock, Shield, Key, User, AlertCircle } from 'lucide-react';
import TwoFactorSettings from './TwoFactorSettings';

/**
 * Admin security settings component
 * Includes password management, two-factor authentication, and session management
 */
const AdminSecuritySettings: React.FC = () => {
  const { userId, role } = useAuthRole();
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchActiveSessions();
    }
  }, [userId]);

  /**
   * Fetch active user sessions
   */
  const fetchActiveSessions = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, you would use Supabase Auth API to get sessions
      // For now, we'll just simulate it with mock data
      setActiveSessions([
        {
          id: '1',
          created_at: new Date().toISOString(),
          browser: 'Chrome',
          os: 'Windows',
          ip: '192.168.1.1',
          last_active: new Date().toISOString(),
          is_current: true
        },
        {
          id: '2',
          created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          browser: 'Safari',
          os: 'iOS',
          ip: '192.168.1.2',
          last_active: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          is_current: false
        }
      ]);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Failed to load active sessions');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Revoke a specific session
   */
  const revokeSession = async (sessionId: string) => {
    try {
      setLoading(true);
      
      // In a real implementation, you would use Supabase Auth API to revoke the session
      // For now, we'll just simulate it
      
      setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (error) {
      console.error('Error revoking session:', error);
      setError('Failed to revoke session');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Revoke all sessions except the current one
   */
  const revokeAllSessions = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, you would use Supabase Auth API to revoke all sessions
      // For now, we'll just simulate it
      
      setActiveSessions(prev => prev.filter(session => session.is_current));
    } catch (error) {
      console.error('Error revoking all sessions:', error);
      setError('Failed to revoke all sessions');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Change user password
   */
  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setPasswordError(null);
    setPasswordSuccess(null);
    setPasswordLoading(true);
    
    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      setPasswordLoading(false);
      return;
    }
    
    try {
      // In a real implementation, you would use Supabase Auth API to change the password
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPasswordSuccess('Password updated successfully');
      
      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      setPasswordError(error.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
      
      {/* Password Management */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-start mb-4">
          <div className="bg-primary-100 p-3 rounded-lg mr-4">
            <Key className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Password Management</h2>
            <p className="text-gray-600">Change your password regularly to maintain account security</p>
          </div>
        </div>
        
        <form onSubmit={changePassword} className="mt-6 space-y-4 max-w-md">
          {passwordError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}
          
          {passwordSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {passwordSuccess}
            </div>
          )}
        
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
              minLength={8}
            />
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 8 characters long and include a mix of letters, numbers, and symbols
            </p>
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={passwordLoading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
      
      {/* Two-Factor Authentication */}
      {userId && (
        <TwoFactorSettings userId={userId} />
      )}
      
      {/* Active Sessions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-start mb-4">
          <div className="bg-primary-100 p-3 rounded-lg mr-4">
            <User className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Active Sessions</h2>
            <p className="text-gray-600">Manage your active login sessions across devices</p>
          </div>
        </div>
        
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-3"></div>
            <p className="text-gray-600">Loading sessions...</p>
          </div>
        ) : error ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-4">
              {activeSessions.map(session => (
                <div key={session.id} className={`p-4 border ${session.is_current ? 'border-blue-200 bg-blue-50' : 'border-gray-200'} rounded-lg`}>
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{session.browser} on {session.os}</p>
                      <p className="text-sm text-gray-600">
                        {session.is_current ? (
                          <span className="text-blue-600">Current session</span>
                        ) : (
                          <>Last active: {new Date(session.last_active).toLocaleString()}</>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">IP: {session.ip}</p>
                    </div>
                    <div>
                      {!session.is_current && (
                        <button 
                          onClick={() => revokeSession(session.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {activeSessions.length > 1 && (
              <button
                onClick={revokeAllSessions}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Revoke All Other Sessions
              </button>
            )}
          </>
        )}
      </div>
      
      {/* Security Log */}
      {role === 'admin' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-start mb-4">
            <div className="bg-primary-100 p-3 rounded-lg mr-4">
              <Shield className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Security Audit Log</h2>
              <p className="text-gray-600">View recent security events and login attempts</p>
            </div>
          </div>
          
          <p className="text-gray-700 py-4">
            Security audit log functionality is coming soon. This will allow administrators to view login attempts, permission changes, and other security-related activities.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminSecuritySettings;