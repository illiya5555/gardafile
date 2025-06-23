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
        
        // Get user profile which contains role_id - use maybeSingle() to handle missing profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role_id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileError) {
          throw profileError;
        }
        
        // If no profile exists, create one with default role
        if (!profile) {
          // First get the default role (assuming 'client' is the default)
          const { data: defaultRole, error: defaultRoleError } = await supabase
            .from('user_roles')
            .select('id')
            .eq('role_name', 'client')
            .single();
          
          if (defaultRoleError) {
            // If no 'client' role exists, try to get any role as fallback
            const { data: anyRole, error: anyRoleError } = await supabase
              .from('user_roles')
              .select('id')
              .limit(1)
              .single();
            
            if (anyRoleError) {
              console.error('No roles found in user_roles table');
              setRole(null);
              return;
            }
            
            // Create profile with the first available role using upsert to prevent conflicts
            const { error: createProfileError } = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                email: user.email || '',
                role_id: anyRole.id
              }, { onConflict: 'id' });
            
            if (createProfileError) {
              throw createProfileError;
            }
            
            // Get the role name for the created profile
            const { data: createdRoleData, error: createdRoleError } = await supabase
              .from('user_roles')
              .select('role_name')
              .eq('id', anyRole.id)
              .single();
            
            if (createdRoleError) {
              throw createdRoleError;
            }
            
            setRole(createdRoleData?.role_name || null);
            return;
          }
          
          // Create profile with default 'client' role using upsert to prevent conflicts
          const { error: createProfileError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              email: user.email || '',
              role_id: defaultRole.id
            }, { onConflict: 'id' });
          
          if (createProfileError) {
            throw createProfileError;
          }
          
          setRole('client');
          return;
        }
        
        if (!profile.role_id) {
          // Profile exists but no role assigned
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