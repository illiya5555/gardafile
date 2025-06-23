export type Role = 'admin' | 'manager' | 'client' | null | undefined;

export interface Permission {
  key: string;
  description: string;
  requiredRole: 'admin' | 'manager' | 'client';
}

// Define all system permissions
export const PERMISSIONS: Record<string, Permission> = {
  VIEW_DASHBOARD: {
    key: 'view_dashboard',
    description: 'Access to view admin dashboard',
    requiredRole: 'manager'
  },
  MANAGE_CALENDAR: {
    key: 'manage_calendar',
    description: 'Create, edit and delete calendar time slots',
    requiredRole: 'manager'
  },
  MANAGE_BOOKINGS: {
    key: 'manage_bookings',
    description: 'View, edit and manage customer bookings',
    requiredRole: 'manager'
  },
  MANAGE_CLIENTS: {
    key: 'manage_clients',
    description: 'View and manage client information',
    requiredRole: 'manager'
  },
  MANAGE_CONTENT: {
    key: 'manage_content',
    description: 'Edit website content and media',
    requiredRole: 'admin'
  },
  VIEW_ANALYTICS: {
    key: 'view_analytics',
    description: 'Access to analytics and reporting',
    requiredRole: 'manager'
  },
  MANAGE_SYSTEM: {
    key: 'manage_system',
    description: 'Access to system settings and database',
    requiredRole: 'admin'
  }
};

/**
 * Check if a user with the given role has a specific permission
 * @param userRole The user's role
 * @param permission The permission key to check
 * @returns Whether the user has the permission
 */
export const hasPermission = (userRole: Role, permission: string): boolean => {
  if (!userRole) return false;
  
  const perm = PERMISSIONS[permission];
  if (!perm) return false;
  
  const roleWeight = {
    'admin': 3,
    'manager': 2,
    'client': 1
  };
  
  // User has permission if their role weight is >= the required role weight
  return roleWeight[userRole] >= roleWeight[perm.requiredRole];
};

/**
 * Get all permissions for a specific role
 * @param role The role to get permissions for
 * @returns Array of permissions available to this role
 */
export const getRolePermissions = (role: Role): Permission[] => {
  if (!role) return [];
  
  return Object.values(PERMISSIONS).filter(
    permission => hasPermission(role, permission.key)
  );
};