/*
  # Fix Admin Dashboard Permissions

  1. Security Updates
    - Add admin policies for bookings table to allow full access
    - Add admin policies for profiles table to allow full access
    - Ensure admins can read all data needed for dashboard

  2. Changes
    - Add admin SELECT policy for bookings table
    - Add admin SELECT policy for profiles table
    - These policies check if the user has admin role before granting access
*/

-- Add admin policy for bookings table
CREATE POLICY "Admins can read all bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id = (
        SELECT id FROM user_roles WHERE role_name = 'admin'
      )
    )
  );

-- Add admin policy for profiles table  
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role_id = (
        SELECT id FROM user_roles WHERE role_name = 'admin'
      )
    )
  );

-- Add admin policy for corporate_inquiries table
CREATE POLICY "Admins can read all corporate inquiries"
  ON corporate_inquiries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id = (
        SELECT id FROM user_roles WHERE role_name = 'admin'
      )
    )
  );

-- Add admin policy for yacht_bookings table
CREATE POLICY "Admins can read all yacht bookings"
  ON yacht_bookings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id = (
        SELECT id FROM user_roles WHERE role_name = 'admin'
      )
    )
  );