/*
  # Fix Time Slots Row Level Security Policies

  1. Security
    - Add policy for service_role to bypass RLS
    - Fix is_admin_or_manager() function if needed
    - Ensure policies allow proper access to time_slots table

  This migration fixes issues with RLS policies on the time_slots table that prevent
  admins and managers from properly managing calendar availability.
*/

-- First ensure the function for checking admin/manager roles exists and works correctly
CREATE OR REPLACE FUNCTION is_admin_or_manager()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid()
    AND ur.role_name IN ('admin', 'manager')
  );
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles p
    JOIN user_roles ur ON p.role_id = ur.id
    WHERE p.id = auth.uid()
    AND ur.role_name = 'admin'
  );
$$;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Admins and managers can delete time slots" ON time_slots;
DROP POLICY IF EXISTS "Admins and managers can insert time slots" ON time_slots;
DROP POLICY IF EXISTS "Admins and managers can update time slots" ON time_slots;
DROP POLICY IF EXISTS "Authenticated can read all time slots" ON time_slots;
DROP POLICY IF EXISTS "Public can read active time slots" ON time_slots;
DROP POLICY IF EXISTS "Service role can manage time_slots" ON time_slots;

-- Add comprehensive policies
-- 1. Service role can do anything (needed for edge functions)
CREATE POLICY "Service role can manage time_slots"
ON time_slots
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Admin/manager roles can do everything
CREATE POLICY "Admins and managers can delete time slots"
ON time_slots
FOR DELETE
TO authenticated
USING (is_admin_or_manager());

CREATE POLICY "Admins and managers can insert time slots"
ON time_slots
FOR INSERT
TO authenticated
WITH CHECK (is_admin_or_manager());

CREATE POLICY "Admins and managers can update time slots"
ON time_slots
FOR UPDATE
TO authenticated
USING (is_admin_or_manager())
WITH CHECK (is_admin_or_manager());

-- 3. Read policies
CREATE POLICY "Authenticated can read all time slots"
ON time_slots
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Public can read active time slots"
ON time_slots
FOR SELECT
TO anon
USING (is_active = true);

-- Ensure RLS is enabled
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;