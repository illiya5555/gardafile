/*
  # Fix Admin Dashboard Permissions

  1. Security
    - Create admin check function
    - Update all RLS policies to allow admin access
    - Create dashboard stats function instead of view

  2. Changes
    - Add proper admin policies for all tables
    - Remove problematic view RLS
    - Create secure function for dashboard stats
*/

-- First, ensure we have the proper admin role check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid() AND ur.role_name = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update profiles policies to allow admin access
DROP POLICY IF EXISTS "Admin users can read all profiles" ON profiles;
CREATE POLICY "Admin users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Update bookings policies to allow admin access
DROP POLICY IF EXISTS "Admins can read all bookings" ON bookings;
CREATE POLICY "Admins can read all bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Add admin update policy for bookings
DROP POLICY IF EXISTS "Admins can update all bookings" ON bookings;
CREATE POLICY "Admins can update all bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update yacht bookings policies
DROP POLICY IF EXISTS "Admins can read all yacht bookings" ON yacht_bookings;
CREATE POLICY "Admins can read all yacht bookings"
  ON yacht_bookings
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Add admin update policy for yacht bookings
DROP POLICY IF EXISTS "Admins can update all yacht bookings" ON yacht_bookings;
CREATE POLICY "Admins can update all yacht bookings"
  ON yacht_bookings
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update corporate inquiries policies
DROP POLICY IF EXISTS "Admins can read all corporate inquiries" ON corporate_inquiries;
CREATE POLICY "Admins can read all corporate inquiries"
  ON corporate_inquiries
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Add admin update policy for corporate inquiries
DROP POLICY IF EXISTS "Admins can update all corporate inquiries" ON corporate_inquiries;
CREATE POLICY "Admins can update all corporate inquiries"
  ON corporate_inquiries
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update time slots policies
DROP POLICY IF EXISTS "Admins can manage time slots" ON time_slots;
CREATE POLICY "Admins can manage time slots"
  ON time_slots
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update testimonials policies for admin access
DROP POLICY IF EXISTS "Admins can manage testimonials" ON testimonials;
CREATE POLICY "Admins can manage testimonials"
  ON testimonials
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update yachts policies for admin access
DROP POLICY IF EXISTS "Admins can manage yachts" ON yachts;
CREATE POLICY "Admins can manage yachts"
  ON yachts
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update chat messages policies for admin access
DROP POLICY IF EXISTS "Admins can read all chat messages" ON chat_messages;
CREATE POLICY "Admins can read all chat messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Update contact inquiries policies for admin access
DROP POLICY IF EXISTS "Admins can read all contact inquiries" ON contact_inquiries;
CREATE POLICY "Admins can read all contact inquiries"
  ON contact_inquiries
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Add admin update policy for contact inquiries
DROP POLICY IF EXISTS "Admins can update contact inquiries" ON contact_inquiries;
CREATE POLICY "Admins can update contact inquiries"
  ON contact_inquiries
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Ensure admin can read user roles
DROP POLICY IF EXISTS "Admins can read all user roles" ON user_roles;
CREATE POLICY "Admins can read all user roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Create a function for admin dashboard stats instead of a view
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  -- Only allow admins to call this function
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  SELECT json_build_object(
    'total_bookings', (SELECT COUNT(*) FROM bookings),
    'total_yacht_bookings', (SELECT COUNT(*) FROM yacht_bookings),
    'total_users', (SELECT COUNT(*) FROM profiles),
    'total_corporate_inquiries', (SELECT COUNT(*) FROM corporate_inquiries),
    'total_revenue_bookings', (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status IN ('confirmed', 'completed')),
    'total_revenue_yacht_bookings', (SELECT COALESCE(SUM(total_price), 0) FROM yacht_bookings WHERE status IN ('confirmed', 'completed'))
  ) INTO stats;

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;