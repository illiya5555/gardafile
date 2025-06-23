import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRole } from './useAuthRole';

/**
 * Hook to check if the current user has admin access
 * Will redirect to home page if not
 * @returns User role information and access status
 */
export const useAdminAccess = () => {
  const { role, userId, loading, error } = useAuthRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !error) {
      if (role !== 'admin' && role !== 'manager') {
        console.error('Unauthorized access attempt: User does not have required role');
        navigate('/');
      }
    }
  }, [role, loading, error, navigate]);

  return { 
    role, 
    userId,
    loading, 
    error, 
    isAdmin: role === 'admin',
    isManager: role === 'manager' || role === 'admin',
    // Even client role has access to basic features
    isAuthenticated: !!role
  };
};

export default useAdminAccess;