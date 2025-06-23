import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UseAuthRoleReturn {
  role: string | null;
  userId: string | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch and manage the user's role
 * @returns Current user's role information
 */
export const useAuthRole = (): UseAuthRoleReturn => {
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }
        
        if (!user) {
          // No user is logged in
          setRole(null);
          setUserId(null);
          return;
        }

        setUserId(user.id);
        
        // Get user profile which contains role_id
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role_id')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          throw profileError;
        }
        
        if (!profile || !profile.role_id) {
          // No profile or no role assigned
          setRole(null);
          return;
        }
        
        // Get role name from user_roles table
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role_name')
          .eq('id', profile.role_id)
          .single();
        
        if (roleError) {
          throw roleError;
        }
        
        setRole(roleData?.role_name || null);
      } catch (err) {
        console.error('Error fetching user role:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch user role'));
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    // Fetch role initially
    fetchUserRole();

    // Set up subscription for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          // Fetch user role when auth state changes
          fetchUserRole();
        } else if (event === 'SIGNED_OUT') {
          setRole(null);
          setUserId(null);
        }
      }
    );

    // Clean up subscription
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return { role, userId, loading, error };
};

export default useAuthRole;