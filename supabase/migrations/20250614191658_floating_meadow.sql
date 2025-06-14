/*
  # Add manager role and policies

  1. New Policies
    - Manager access policies for bookings, clients, and chat messages
    - Ensure managers can view and manage client data
    - Add chat functionality between managers and clients
  
  2. Role Setup
    - Ensure manager role exists in user_roles table
    - Create function to check if user is a manager
*/

-- Ensure manager role exists
INSERT INTO user_roles (role_name, description, permissions)
VALUES (
  'manager',
  'Manager with elevated access',
  '["read_all_data", "manage_bookings", "manage_clients"]'::jsonb
)
ON CONFLICT (role_name) DO NOTHING;

-- Create function to check if user is manager
CREATE OR REPLACE FUNCTION is_manager()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.role_name = 'manager'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add manager policies for bookings
CREATE POLICY "Managers can read all bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (is_manager());

CREATE POLICY "Managers can update all bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (is_manager())
  WITH CHECK (is_manager());

-- Add manager policies for profiles (to view client data)
CREATE POLICY "Managers can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_manager());

-- Add manager policies for chat messages
CREATE POLICY "Managers can read all chat messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (is_manager());

-- Create manager-client chat table if it doesn't exist
CREATE TABLE IF NOT EXISTS manager_client_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  manager_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('manager', 'client')),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_manager_client_chats_client_id ON manager_client_chats(client_id);
CREATE INDEX IF NOT EXISTS idx_manager_client_chats_manager_id ON manager_client_chats(manager_id);
CREATE INDEX IF NOT EXISTS idx_manager_client_chats_created_at ON manager_client_chats(created_at DESC);

-- Enable RLS on manager_client_chats
ALTER TABLE manager_client_chats ENABLE ROW LEVEL SECURITY;

-- Add policies for manager_client_chats
CREATE POLICY "Managers can insert messages to clients"
  ON manager_client_chats
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (manager_id = auth.uid()) AND 
    (sender_type = 'manager') AND
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND
      profiles.role_id = (SELECT id FROM user_roles WHERE role_name = 'manager')
    ))
  );

CREATE POLICY "Managers can read chat messages"
  ON manager_client_chats
  FOR SELECT
  TO authenticated
  USING (
    manager_id = auth.uid() AND
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND
      profiles.role_id = (SELECT id FROM user_roles WHERE role_name = 'manager')
    ))
  );

CREATE POLICY "Managers can update read status"
  ON manager_client_chats
  FOR UPDATE
  TO authenticated
  USING (
    manager_id = auth.uid() AND
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND
      profiles.role_id = (SELECT id FROM user_roles WHERE role_name = 'manager')
    ))
  );

-- Add client policies for manager_client_chats
CREATE POLICY "Clients can insert messages to managers"
  ON manager_client_chats
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (client_id = auth.uid()) AND 
    (sender_type = 'client')
  );

CREATE POLICY "Clients can read own chat messages"
  ON manager_client_chats
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Clients can update read status of their messages"
  ON manager_client_chats
  FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid());