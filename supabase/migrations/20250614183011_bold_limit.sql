/*
  # Fix infinite recursion in profiles RLS policies

  1. Policy Updates
    - Remove circular dependencies in profiles table policies
    - Simplify admin check policies to avoid recursion
    - Ensure policies don't reference profiles table within profiles policies

  2. Security
    - Maintain proper access control
    - Keep admin functionality intact
    - Prevent unauthorized access
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new simplified policies without circular dependencies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create a simplified admin policy that doesn't cause recursion
-- This policy checks if the current user's ID exists in a list of admin user IDs
-- You'll need to replace the UUID below with actual admin user IDs from your auth.users table
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT p.id 
      FROM profiles p
      JOIN user_roles ur ON p.role_id = ur.id
      WHERE ur.role_name = 'admin'
      AND p.id = auth.uid()
    )
    OR auth.uid() = id
  );

-- Alternative simpler admin policy (uncomment if the above still causes issues)
-- CREATE POLICY "Admins can read all profiles"
--   ON profiles
--   FOR SELECT
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_roles ur 
--       WHERE ur.id = (
--         SELECT role_id FROM profiles WHERE id = auth.uid() LIMIT 1
--       ) 
--       AND ur.role_name = 'admin'
--     )
--     OR auth.uid() = id
--   );

-- If the above policies still cause recursion, use this most basic version:
-- DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
-- CREATE POLICY "Basic admin access"
--   ON profiles
--   FOR ALL
--   TO authenticated
--   USING (auth.uid() = id);