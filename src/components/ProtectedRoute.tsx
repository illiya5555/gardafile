import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthRole } from '../hooks/useAuthRole';
import { hasPermission } from '../utils/permissions';

interface ProtectedRouteProps {
  requiredPermission?: string;
  requiredRole?: 'admin' | 'manager' | 'client';
  redirectPath?: string;
  children: React.ReactNode;
}

/**
 * Component to protect routes based on user roles and permissions
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredPermission,
  requiredRole,
  redirectPath = '/',
  children
}) => {
  const { role, loading } = useAuthRole();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Check permission first if specified
  if (requiredPermission && !hasPermission(role, requiredPermission)) {
    return <Navigate to={redirectPath} replace />;
  }
  
  // Check role if permission check passed or no permission was required
  if (requiredRole) {
    const roleWeight = {
      'admin': 3,
      'manager': 2,
      'client': 1,
    };
    
    if (!role || roleWeight[role] < roleWeight[requiredRole]) {
      return <Navigate to={redirectPath} replace />;
    }
  }
  
  // User has the required role/permission, render children
  return <>{children}</>;
};

export default ProtectedRoute;