import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminLoginProps {
  onClose: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting admin login with:', email);
      
      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        
        // Handle network-related errors
        if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
          setError('Ошибка подключения к серверу. Проверьте подключение к интернету и конфигурацию Supabase. Убедитесь, что переменные окружения VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY настроены правильно.');
        } else if (error.message === 'Invalid login credentials') {
          setError('Неверный email или пароль. Убедитесь, что пользователь зарегистрирован в системе.');
        } else {
          setError(`Ошибка входа: ${error.message}`);
        }
        return;
      }

      if (data.user) {
        console.log('User authenticated:', data.user.id);
        
        // Get user profile with role information
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            *,
            user_roles(role_name)
          `)
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          
          // Handle network-related errors for profile fetch
          if (profileError.message === 'Failed to fetch' || profileError.message.includes('fetch')) {
            setError('Ошибка подключения при получении профиля. Проверьте подключение к интернету и конфигурацию Supabase.');
          } else {
            setError(`Ошибка при получении профиля пользователя: ${profileError.message}`);
          }
          return;
        }

        console.log('User profile:', profileData);
        
        // Check if user is an admin
        const roleName = profileData?.user_roles?.role_name;
        console.log('User role:', roleName);
        
        if (roleName === 'admin') {
          console.log('Admin access granted');
          alert('Добро пожаловать в административную панель!');
          // Redirect to admin panel
          window.location.href = '/admin';
          onClose();
        } else {
          console.error('Non-admin attempted to access admin panel');
          setError('У вас нет прав администратора');
          await supabase.auth.signOut();
        }
      }
    } catch (error: any) {
      console.error('Unexpected error during login:', error);
      
      // Handle network-related errors in catch block
      if (error.message === 'Failed to fetch' || error.message.includes('fetch') || error.name === 'TypeError') {
        setError('Ошибка подключения к серверу. Проверьте подключение к интернету и убедитесь, что Supabase настроен правильно. Проверьте переменные окружения VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY.');
      } else {
        setError(error.message || 'Неожиданная ошибка входа');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-login-title"
    >
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-md mx-4 animate-slide-up">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-100 p-2 rounded-lg">
                <Lock className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h2 id="admin-login-title" className="text-xl font-bold text-gray-900">Admin Access</h2>
                <p className="text-sm text-gray-600">Вход в административную панель</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Setup Instructions */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  Настройка администратора
                </h3>
                <p className="text-xs text-blue-700 mb-2">
                  Для входа необходимо создать пользователя в Supabase:
                </p>
                <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Откройте Supabase Dashboard</li>
                  <li>Перейдите в Authentication → Users</li>
                  <li>Создайте пользователя с email: admin@gardaracing.com</li>
                  <li>Используйте созданные credentials для входа</li>
                </ol>
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <p className="text-xs text-blue-700 font-medium">
                    Убедитесь, что настроены переменные окружения:
                  </p>
                  <ul className="text-xs text-blue-700 mt-1 space-y-0.5">
                    <li>• VITE_SUPABASE_URL</li>
                    <li>• VITE_SUPABASE_ANON_KEY</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="admin-email">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-gray-900 bg-white placeholder-gray-500"
                placeholder="admin@gardaracing.com"
                required
                aria-required="true"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="admin-password">
                Пароль
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-gray-900 bg-white placeholder-gray-500"
                  placeholder="••••••••"
                  required
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              aria-busy={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Войти</span>
                </>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              Доступ только для администраторов Garda Racing Yacht Club
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;