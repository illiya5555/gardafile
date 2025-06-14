/*
  # User Roles and Management System

  1. New Tables
    - `user_roles`
      - `id` (uuid, primary key)
      - `role_name` (text, unique) - admin, manager, client
      - `description` (text)
      - `permissions` (jsonb)
      - `created_at` (timestamp)
    
    - `manager_client_chats`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to profiles)
      - `manager_id` (uuid, foreign key to profiles)
      - `message` (text)
      - `sender_type` (text) - manager or client
      - `is_read` (boolean)
      - `created_at` (timestamp)
    
    - `client_media`
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key to profiles)
      - `booking_id` (uuid)
      - `booking_type` (text) - regular or yacht
      - `media_url` (text)
      - `media_type` (text) - photo or video
      - `caption` (text)
      - `uploaded_by` (uuid, foreign key to profiles)
      - `created_at` (timestamp)
    
    - `booking_updates`
      - `id` (uuid, primary key)
      - `booking_id` (uuid)
      - `booking_type` (text) - regular or yacht
      - `updated_by` (uuid, foreign key to profiles)
      - `update_type` (text)
      - `old_values` (jsonb)
      - `new_values` (jsonb)
      - `notes` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add policies for role-based access control
    - Add role_id column to profiles table
    - Create helper functions for role management

  3. Changes
    - Add role_id column to profiles table with default client role
    - Update existing profiles to have client role
*/

-- Create user roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name text UNIQUE NOT NULL CHECK (role_name IN ('admin', 'manager', 'client')),
  description text,
  permissions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Insert default roles
INSERT INTO user_roles (role_name, description, permissions) VALUES
  ('admin', 'Full system access', '["all"]'::jsonb),
  ('manager', 'Manage bookings and client communications', '["manage_bookings", "view_clients", "chat_with_clients", "upload_media"]'::jsonb),
  ('client', 'View own bookings and communicate with managers', '["view_own_bookings", "chat_with_manager", "view_own_media"]'::jsonb)
ON CONFLICT (role_name) DO NOTHING;

-- Add role_id to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role_id uuid REFERENCES user_roles(id) DEFAULT (SELECT id FROM user_roles WHERE role_name = 'client');
  END IF;
END $$;

-- Create index on role_id for better performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' AND indexname = 'idx_profiles_role_id'
  ) THEN
    CREATE INDEX idx_profiles_role_id ON profiles(role_id);
  END IF;
END $$;

-- Create manager-client chat table
CREATE TABLE IF NOT EXISTS manager_client_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  manager_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('manager', 'client')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for manager_client_chats
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'manager_client_chats' AND indexname = 'idx_manager_client_chats_client_id'
  ) THEN
    CREATE INDEX idx_manager_client_chats_client_id ON manager_client_chats(client_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'manager_client_chats' AND indexname = 'idx_manager_client_chats_manager_id'
  ) THEN
    CREATE INDEX idx_manager_client_chats_manager_id ON manager_client_chats(manager_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'manager_client_chats' AND indexname = 'idx_manager_client_chats_created_at'
  ) THEN
    CREATE INDEX idx_manager_client_chats_created_at ON manager_client_chats(created_at DESC);
  END IF;
END $$;

-- Create client media table
CREATE TABLE IF NOT EXISTS client_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id uuid, -- Can reference either bookings or yacht_bookings
  booking_type text CHECK (booking_type IN ('regular', 'yacht')),
  media_url text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('photo', 'video')),
  caption text,
  uploaded_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for client_media
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'client_media' AND indexname = 'idx_client_media_client_id'
  ) THEN
    CREATE INDEX idx_client_media_client_id ON client_media(client_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'client_media' AND indexname = 'idx_client_media_booking_id'
  ) THEN
    CREATE INDEX idx_client_media_booking_id ON client_media(booking_id);
  END IF;
END $$;

-- Create booking updates table
CREATE TABLE IF NOT EXISTS booking_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL,
  booking_type text NOT NULL CHECK (booking_type IN ('regular', 'yacht')),
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  update_type text NOT NULL CHECK (update_type IN ('status_change', 'date_change', 'details_change')),
  old_values jsonb,
  new_values jsonb,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for booking_updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'booking_updates' AND indexname = 'idx_booking_updates_booking_id'
  ) THEN
    CREATE INDEX idx_booking_updates_booking_id ON booking_updates(booking_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'booking_updates' AND indexname = 'idx_booking_updates_created_at'
  ) THEN
    CREATE INDEX idx_booking_updates_created_at ON booking_updates(created_at DESC);
  END IF;
END $$;

-- Enable RLS on all new tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_client_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_updates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DO $$
BEGIN
  -- Drop user_roles policies
  DROP POLICY IF EXISTS "Anyone can read user roles" ON user_roles;
  
  -- Drop manager_client_chats policies
  DROP POLICY IF EXISTS "Users can read own chat messages" ON manager_client_chats;
  DROP POLICY IF EXISTS "Clients can insert messages to managers" ON manager_client_chats;
  DROP POLICY IF EXISTS "Managers can insert messages to clients" ON manager_client_chats;
  DROP POLICY IF EXISTS "Users can update read status of their messages" ON manager_client_chats;
  
  -- Drop client_media policies
  DROP POLICY IF EXISTS "Clients can read own media" ON client_media;
  DROP POLICY IF EXISTS "Managers can read all client media" ON client_media;
  DROP POLICY IF EXISTS "Managers can insert client media" ON client_media;
  DROP POLICY IF EXISTS "Managers can update client media" ON client_media;
  
  -- Drop booking_updates policies
  DROP POLICY IF EXISTS "Users can read booking updates for their bookings" ON booking_updates;
  DROP POLICY IF EXISTS "Managers can insert booking updates" ON booking_updates;
END $$;

-- RLS Policies for user_roles
CREATE POLICY "user_roles_select_policy"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for manager_client_chats
CREATE POLICY "manager_client_chats_select_policy"
  ON manager_client_chats
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid() OR manager_id = auth.uid());

CREATE POLICY "manager_client_chats_insert_client_policy"
  ON manager_client_chats
  FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id = auth.uid() AND 
    sender_type = 'client' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = manager_client_chats.manager_id 
      AND role_id = (SELECT id FROM user_roles WHERE role_name = 'manager')
    )
  );

CREATE POLICY "manager_client_chats_insert_manager_policy"
  ON manager_client_chats
  FOR INSERT
  TO authenticated
  WITH CHECK (
    manager_id = auth.uid() AND 
    sender_type = 'manager' AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role_id = (SELECT id FROM user_roles WHERE role_name = 'manager')
    )
  );

CREATE POLICY "manager_client_chats_update_policy"
  ON manager_client_chats
  FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid() OR manager_id = auth.uid())
  WITH CHECK (client_id = auth.uid() OR manager_id = auth.uid());

-- RLS Policies for client_media
CREATE POLICY "client_media_select_client_policy"
  ON client_media
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "client_media_select_manager_policy"
  ON client_media
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role_id = (SELECT id FROM user_roles WHERE role_name IN ('manager', 'admin'))
    )
  );

CREATE POLICY "client_media_insert_policy"
  ON client_media
  FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role_id = (SELECT id FROM user_roles WHERE role_name IN ('manager', 'admin'))
    )
  );

CREATE POLICY "client_media_update_policy"
  ON client_media
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role_id = (SELECT id FROM user_roles WHERE role_name IN ('manager', 'admin'))
    )
  );

-- RLS Policies for booking_updates
CREATE POLICY "booking_updates_select_policy"
  ON booking_updates
  FOR SELECT
  TO authenticated
  USING (
    -- Clients can see updates for their own bookings
    (
      booking_type = 'regular' AND
      EXISTS (
        SELECT 1 FROM bookings 
        WHERE id = booking_updates.booking_id 
        AND user_id = auth.uid()
      )
    ) OR
    (
      booking_type = 'yacht' AND
      EXISTS (
        SELECT 1 FROM yacht_bookings 
        WHERE id = booking_updates.booking_id 
        AND user_id = auth.uid()
      )
    ) OR
    -- Managers and admins can see all updates
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role_id = (SELECT id FROM user_roles WHERE role_name IN ('manager', 'admin'))
    )
  );

CREATE POLICY "booking_updates_insert_policy"
  ON booking_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    updated_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role_id = (SELECT id FROM user_roles WHERE role_name IN ('manager', 'admin'))
    )
  );

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT ur.role_name INTO user_role
  FROM profiles p
  JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = user_id;
  
  RETURN COALESCE(user_role, 'client');
END;
$$;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(user_id uuid, permission text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_permission boolean := false;
  user_permissions jsonb;
BEGIN
  SELECT ur.permissions INTO user_permissions
  FROM profiles p
  JOIN user_roles ur ON p.role_id = ur.id
  WHERE p.id = user_id;
  
  -- Check if user has 'all' permissions or specific permission
  IF user_permissions ? 'all' OR user_permissions ? permission THEN
    has_permission := true;
  END IF;
  
  RETURN has_permission;
END;
$$;

-- Update existing profiles to have client role by default
UPDATE profiles 
SET role_id = (SELECT id FROM user_roles WHERE role_name = 'client')
WHERE role_id IS NULL;