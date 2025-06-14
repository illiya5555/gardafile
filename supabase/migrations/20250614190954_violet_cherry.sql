/*
  # Client Dashboard Support

  1. New Functions
    - Create function to check if user is client
  
  2. Security
    - Add policies for client access to bookings
    - Add policies for client access to profiles
    - Add policies for client access to chat messages
*/

-- Create function to check if user is client
CREATE OR REPLACE FUNCTION is_client()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.role_name = 'client'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure client role exists
INSERT INTO user_roles (role_name, description, permissions)
VALUES (
  'client',
  'Regular client with basic access',
  '["read_own_data", "create_bookings"]'::jsonb
)
ON CONFLICT (role_name) DO NOTHING;

-- Add client policies for bookings
CREATE POLICY "Clients can read own bookings by email"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    customer_email = (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );

-- Add client policies for profiles
CREATE POLICY "Clients can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Add client policies for chat messages
CREATE POLICY "Clients can read own chat messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Add client policies for chat messages
CREATE POLICY "Clients can create chat messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);