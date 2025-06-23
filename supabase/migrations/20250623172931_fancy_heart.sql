/*
  # Fix infinite recursion in profiles table RLS policies

  1. Problem
    - Current admin/manager policies query the profiles table within their conditions
    - This creates infinite recursion when RLS tries to evaluate the policies
    
  2. Solution
    - Drop the recursive policies
    - Create simpler policies that avoid self-referencing queries
    - Use a security definer function to check roles without triggering RLS
    
  3. Changes
    - Remove problematic admin/manager policies
    - Create a security definer function to check user roles
    - Add new non-recursive policies for admin access
*/

-- First, drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Managers can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Managers can update non-admin profiles" ON profiles;

-- Create a security definer function to check user roles without triggering RLS
CREATE OR REPLACE FUNCTION check_user_role(target_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.role_name = target_role
  );
$$;

-- Create a security definer function to check if user is admin or manager
CREATE OR REPLACE FUNCTION is_admin_or_manager()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() 
    AND ur.role_name IN ('admin', 'manager')
  );
$$;

-- Create new non-recursive policies

-- Admin policy using the security definer function
CREATE POLICY "Admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (check_user_role('admin'))
  WITH CHECK (check_user_role('admin'));

-- Manager policy for viewing profiles
CREATE POLICY "Managers can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin_or_manager());

-- Manager policy for updating non-admin profiles
-- This requires a more complex function to avoid recursion
CREATE OR REPLACE FUNCTION can_manager_update_profile(target_profile_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    -- User must be a manager or admin
    EXISTS (
      SELECT 1 
      FROM profiles p
      JOIN user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() 
      AND ur.role_name IN ('admin', 'manager')
    )
    AND
    -- Target profile must not be an admin (unless current user is admin)
    (
      check_user_role('admin') 
      OR 
      NOT EXISTS (
        SELECT 1
        FROM profiles p
        JOIN user_roles ur ON p.role_id = ur.id
        WHERE p.id = target_profile_id
        AND ur.role_name = 'admin'
      )
    );
$$;

CREATE POLICY "Managers can update non-admin profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (can_manager_update_profile(id))
  WITH CHECK (can_manager_update_profile(id));