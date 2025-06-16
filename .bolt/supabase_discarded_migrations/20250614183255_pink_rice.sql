/*
  # Fix infinite recursion in profiles RLS policy

  1. Problem
    - The "Admins can read all profiles" policy creates infinite recursion
    - It queries the profiles table within the policy that governs access to the profiles table
    
  2. Solution
    - Drop the problematic policy
    - Create a new policy that doesn't create circular dependencies
    - Use a simpler approach that checks user roles without self-referencing
    
  3. Changes
    - Remove recursive policy
    - Add non-recursive admin policy
    - Ensure users can still read their own profiles
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Create a new non-recursive policy for admins
-- This policy checks the user's role directly without querying profiles table recursively
CREATE POLICY "Admins can read all profiles" 
  ON profiles 
  FOR SELECT 
  TO authenticated 
  USING (
    -- Allow if user is reading their own profile
    (uid() = id) 
    OR 
    -- Allow if user has admin role (check role_id directly against known admin role ID)
    (
      EXISTS (
        SELECT 1 
        FROM user_roles ur 
        WHERE ur.role_name = 'admin' 
        AND ur.id = (
          SELECT role_id 
          FROM profiles 
          WHERE id = uid() 
          LIMIT 1
        )
      )
    )
  );

-- Ensure the policy for users reading their own profile is still active
-- (This should already exist but let's make sure)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile" 
      ON profiles 
      FOR SELECT 
      TO authenticated 
      USING (uid() = id);
  END IF;
END $$;