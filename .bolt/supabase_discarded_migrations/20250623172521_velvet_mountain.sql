/*
  # Add User Roles System

  1. New Tables
    - `user_roles`
      - `id` (uuid, primary key)
      - `role_name` (text, unique) - admin, manager, client
      - `description` (text)
      - `created_at` (timestamp)

  2. Schema Changes
    - Add `role_id` column to `profiles` table
    - Add foreign key constraint from profiles.role_id to user_roles.id

  3. Security
    - Enable RLS on `user_roles` table
    - Add policies for role management
    - Update existing profiles policies

  4. Data
    - Insert default roles (admin, manager, client)
    - Set default role for existing profiles
*/

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Add role_id column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role_id uuid;
  END IF;
END $$;

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Insert default roles
INSERT INTO user_roles (role_name, description) VALUES
  ('admin', 'Full system access with all permissions'),
  ('manager', 'Management access with booking and client management'),
  ('client', 'Standard client access for bookings and profile management')
ON CONFLICT (role_name) DO NOTHING;

-- Get the client role ID for setting as default
DO $$
DECLARE
  client_role_id uuid;
BEGIN
  SELECT id INTO client_role_id FROM user_roles WHERE role_name = 'client';
  
  -- Set default role_id for existing profiles without a role
  UPDATE profiles 
  SET role_id = client_role_id 
  WHERE role_id IS NULL;
  
  -- Set default value for future profiles
  ALTER TABLE profiles ALTER COLUMN role_id SET DEFAULT client_role_id;
END $$;

-- Add foreign key constraint
ALTER TABLE profiles 
ADD CONSTRAINT fk_profiles_role_id 
FOREIGN KEY (role_id) REFERENCES user_roles(id) ON DELETE SET NULL;

-- RLS Policies for user_roles
CREATE POLICY "Public can read user roles"
  ON user_roles
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Only admins can manage roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.role_name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.role_name = 'admin'
    )
  );

-- Update profiles policies to work with roles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow admins to view and manage all profiles
CREATE POLICY "Admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.role_name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.role_name = 'admin'
    )
  );

-- Allow managers to view all profiles but only update non-admin profiles
CREATE POLICY "Managers can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_roles ur ON p.role_id = ur.id
      WHERE p.id = auth.uid() AND ur.role_name IN ('admin', 'manager')
    )
  );

CREATE POLICY "Managers can update non-admin profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles manager_p
      JOIN user_roles manager_ur ON manager_p.role_id = manager_ur.id
      WHERE manager_p.id = auth.uid() AND manager_ur.role_name = 'manager'
    )
    AND NOT EXISTS (
      SELECT 1 FROM user_roles target_ur
      WHERE target_ur.id = role_id AND target_ur.role_name = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles manager_p
      JOIN user_roles manager_ur ON manager_p.role_id = manager_ur.id
      WHERE manager_p.id = auth.uid() AND manager_ur.role_name = 'manager'
    )
    AND NOT EXISTS (
      SELECT 1 FROM user_roles target_ur
      WHERE target_ur.id = role_id AND target_ur.role_name = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_name ON user_roles(role_name);

-- Add helpful function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT ur.role_name
  FROM profiles p
  JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = user_id;
$$;

-- Add function to check if user has role
CREATE OR REPLACE FUNCTION user_has_role(user_id uuid, required_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = user_id AND ur.role_name = required_role
  );
$$;