/*
  # Fix time_slots RLS policies for admin access

  1. Security Updates
    - Drop existing overly permissive policies on time_slots table
    - Add proper role-based policies for admins and managers
    - Ensure public can only read active time slots
    - Allow authenticated users to read all time slots
    - Restrict insert/update/delete to admin/manager roles only

  2. Changes
    - Remove policies that allow anon users to modify data
    - Add admin/manager-only policies for data modification
    - Maintain public read access for booking functionality
*/

-- Drop existing policies that are too permissive
DROP POLICY IF EXISTS "Authenticated and public access to active time slots" ON time_slots;
DROP POLICY IF EXISTS "Authenticated can delete time slots" ON time_slots;
DROP POLICY IF EXISTS "Authenticated can insert time slots" ON time_slots;
DROP POLICY IF EXISTS "Authenticated can update time slots" ON time_slots;
DROP POLICY IF EXISTS "Public can view all time slots" ON time_slots;
DROP POLICY IF EXISTS "Public read active time slots" ON time_slots;

-- Create new restrictive policies

-- Public/anonymous users can only read active time slots (for booking)
CREATE POLICY "Public can read active time slots"
  ON time_slots
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Authenticated users can read all time slots
CREATE POLICY "Authenticated can read all time slots"
  ON time_slots
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins and managers can insert time slots
CREATE POLICY "Admins and managers can insert time slots"
  ON time_slots
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_manager());

-- Only admins and managers can update time slots
CREATE POLICY "Admins and managers can update time slots"
  ON time_slots
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_manager())
  WITH CHECK (is_admin_or_manager());

-- Only admins and managers can delete time slots
CREATE POLICY "Admins and managers can delete time slots"
  ON time_slots
  FOR DELETE
  TO authenticated
  USING (is_admin_or_manager());