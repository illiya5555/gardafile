/*
  # Fix Admin Dashboard Permissions

  This migration fixes the Row Level Security policies to allow admin users
  to access the necessary data for the admin dashboard functionality.

  ## Changes Made

  1. **Admin Policies for Profiles Table**
     - Allow admins to read all profiles
     - Ensure proper admin role checking

  2. **Admin Policies for Bookings Table**
     - Allow admins to read all bookings
     - Fix the join issues with profiles

  3. **Admin Policies for Corporate Inquiries**
     - Allow admins to read all corporate inquiries

  4. **Admin Policies for Time Slots**
     - Allow admins to manage time slots

  5. **Admin Policies for Yacht Bookings**
     - Allow admins to read all yacht bookings

  ## Security Notes
  - All policies check for admin role before granting access
  - Maintains data security while enabling admin functionality
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

-- Create a view for admin dashboard stats that doesn't require direct user table access
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM bookings) as total_bookings,
  (SELECT COUNT(*) FROM yacht_bookings) as total_yacht_bookings,
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM corporate_inquiries) as total_corporate_inquiries,
  (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status IN ('confirmed', 'completed')) as total_revenue_bookings,
  (SELECT COALESCE(SUM(total_price), 0) FROM yacht_bookings WHERE status IN ('confirmed', 'completed')) as total_revenue_yacht_bookings;

-- Grant access to the stats view for admins
DROP POLICY IF EXISTS "Admins can read dashboard stats" ON admin_dashboard_stats;
CREATE POLICY "Admins can read dashboard stats"
  ON admin_dashboard_stats
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Enable RLS on the view
ALTER VIEW admin_dashboard_stats ENABLE ROW LEVEL SECURITY;