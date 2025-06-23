/*
  # Fix infinite recursion in user_roles RLS policy

  1. Problem
    - The "Only admins can manage roles" policy creates infinite recursion
    - Policy tries to JOIN user_roles table from within user_roles table policy
    - This causes the Supabase request to fail with infinite recursion error

  2. Solution
    - Remove the problematic recursive policy
    - Create a security definer function to safely check admin status
    - Add a new non-recursive policy for admin operations
    - Keep the existing public read policy intact

  3. Security
    - Maintain admin-only access for managing roles
    - Ensure public read access remains available
    - Use security definer function to bypass RLS for role checking
*/

-- First, create a security definer function to check if user is admin
-- This function runs with elevated privileges and can bypass RLS
CREATE OR REPLACE FUNCTION is_user_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Direct query without RLS to avoid recursion
  RETURN EXISTS (
    SELECT 1 
    FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_uuid 
    AND ur.role_name = 'admin'
  );
END;
$$;

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Only admins can manage roles" ON user_roles;

-- Create new non-recursive admin policy using the security definer function
CREATE POLICY "Admins can manage roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (is_user_admin())
  WITH CHECK (is_user_admin());

-- Ensure the public read policy exists (it should already exist)
DO $$
BEGIN
  -- Check if the public read policy exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles' 
    AND policyname = 'Public can read user roles'
  ) THEN
    CREATE POLICY "Public can read user roles"
      ON user_roles
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- Grant necessary permissions to the function
GRANT EXECUTE ON FUNCTION is_user_admin(uuid) TO authenticated, anon;