/*
  # User Roles and Authentication System

  1. New Tables
    - `user_roles` - Defines available roles in the system
    - `user_profiles` - Extended user profile information with role assignment
    - `manager_client_chats` - Chat messages between managers and clients
    - `client_media` - Media files shared with clients after regattas
    - `booking_updates` - Track booking changes made by managers

  2. Security
    - Enable RLS on all new tables
    - Add policies for role-based access control
    - Ensure proper data isolation between roles

  3. Functions
    - Function to assign roles to users
    - Function to check user permissions
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

-- Add role_id to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role_id uuid REFERENCES user_roles(id) DEFAULT (SELECT id FROM user_roles WHERE role_name = 'client');
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

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_client_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Anyone can read user roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for manager_client_chats
CREATE POLICY "Users can read own chat messages"
  ON manager_client_chats
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid() OR manager_id = auth.uid());

CREATE POLICY "Clients can insert messages to managers"
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

CREATE POLICY "Managers can insert messages to clients"
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

CREATE POLICY "Users can update read status of their messages"
  ON manager_client_chats
  FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid() OR manager_id = auth.uid())
  WITH CHECK (client_id = auth.uid() OR manager_id = auth.uid());

-- RLS Policies for client_media
CREATE POLICY "Clients can read own media"
  ON client_media
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Managers can read all client media"
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

CREATE POLICY "Managers can insert client media"
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

CREATE POLICY "Managers can update client media"
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
CREATE POLICY "Users can read booking updates for their bookings"
  ON booking_updates
  FOR SELECT
  TO authenticated
  USING (
    -- Clients can see updates for their own bookings
    (
      booking_type = 'regular' AND
      EXISTS (
        SELECT 1 FROM bookings 
        WHERE id = booking_updates.booking_id::uuid 
        AND user_id = auth.uid()
      )
    ) OR
    (
      booking_type = 'yacht' AND
      EXISTS (
        SELECT 1 FROM yacht_bookings 
        WHERE id = booking_updates.booking_id::uuid 
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

CREATE POLICY "Managers can insert booking updates"
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