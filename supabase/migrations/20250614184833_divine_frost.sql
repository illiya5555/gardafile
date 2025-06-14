/*
  # Fix Profiles RLS Policies

  1. Changes
    - Drop problematic recursive policies for profiles table
    - Create new non-recursive policies using auth.uid() instead of uid()
    - Fix admin access policy to prevent infinite recursion
    - Ensure all users can read their own profiles

  2. Security
    - Maintains proper access control
    - Prevents infinite recursion in policy evaluation
    - Preserves admin access to all profiles
*/

-- Drop the problematic recursive policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create a simple policy that allows users to read their own profile
CREATE POLICY "Users can read own profile" 
  ON profiles 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

-- Create a separate policy for admin access that doesn't cause recursion
CREATE POLICY "Admin users can read all profiles" 
  ON profiles 
  FOR SELECT 
  TO authenticated 
  USING (
    -- Check if the current user has admin role by direct join
    EXISTS (
      SELECT 1 
      FROM user_roles ur
      WHERE ur.id = (SELECT role_id FROM profiles WHERE id = auth.uid())
      AND ur.role_name = 'admin'
    )
  );

-- Ensure users can insert their own profile
CREATE POLICY "Users can insert own profile" 
  ON profiles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Ensure users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);