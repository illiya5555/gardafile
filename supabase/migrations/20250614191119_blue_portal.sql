/*
  # Fix RLS policies for bookings table

  1. Security Changes
    - Drop existing problematic policies that reference auth.users table
    - Create new policies that properly reference profiles table
    - Ensure users can only access their own bookings

  2. Policy Updates
    - Users can read bookings where user_id matches OR customer_email matches their profile email
    - Users can update their own bookings
    - Anonymous users can create bookings
    - Admins can manage all bookings
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;

-- Create new corrected policies
CREATE POLICY "Users can read own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    (user_id = auth.uid()) OR 
    (customer_email = (
      SELECT email FROM profiles WHERE id = auth.uid()
    ))
  );

CREATE POLICY "Users can update own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    (user_id = auth.uid()) OR 
    (customer_email = (
      SELECT email FROM profiles WHERE id = auth.uid()
    ))
  )
  WITH CHECK (
    (user_id = auth.uid()) OR 
    (customer_email = (
      SELECT email FROM profiles WHERE id = auth.uid()
    ))
  );

-- Ensure the policy for clients reading bookings by email is also corrected
DROP POLICY IF EXISTS "Clients can read own bookings by email" ON bookings;

CREATE POLICY "Clients can read own bookings by email"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    customer_email = (
      SELECT email FROM profiles WHERE id = auth.uid()
    )
  );