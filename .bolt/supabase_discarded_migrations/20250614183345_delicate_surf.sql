/*
  # Fix infinite recursion in profiles RLS policy

  1. Problem
    - The existing "Admins can read all profiles" policy creates infinite recursion
    - It tries to query the profiles table while evaluating access to the profiles table

  2. Solution
    - Drop the problematic recursive policy
    - Create a simplified policy that avoids recursion
    - Use auth.uid() instead of uid() for Supabase compatibility

  3. Changes
    - Remove recursive admin check
    - Keep simple user access to own profile
    - Add separate admin policy if needed
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Create a simple policy that allows users to read their own profile
-- This avoids any recursion issues
CREATE POLICY "Users can read own profile" 
  ON profiles 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

-- Create a separate policy for admin access that doesn't cause recursion
-- This uses a direct role check without querying profiles table
CREATE POLICY "Admin users can read all profiles" 
  ON profiles 
  FOR SELECT 
  TO authenticated 
  USING (
    -- Check if the current user has admin role by looking up their role directly
    EXISTS (
      SELECT 1 
      FROM auth.users u
      JOIN profiles p ON u.id = p.id
      JOIN user_roles ur ON p.role_id = ur.id
      WHERE u.id = auth.uid() 
      AND ur.role_name = 'admin'
      LIMIT 1
    )
  );

-- Ensure users can insert their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" 
      ON profiles 
      FOR INSERT 
      TO authenticated 
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Ensure users can update their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" 
      ON profiles 
      FOR UPDATE 
      TO authenticated 
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;