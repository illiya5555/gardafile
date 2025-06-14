/*
  # Fix bookings table schema

  1. Table Updates
    - Add missing customer fields to bookings table
    - Ensure all required columns exist
    - Update foreign key relationships

  2. Security
    - Update RLS policies for new columns
    - Ensure proper access control
*/

-- Add missing customer columns to bookings table
DO $$
BEGIN
  -- Add customer_name if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'customer_name'
  ) THEN
    ALTER TABLE bookings ADD COLUMN customer_name text;
  END IF;

  -- Add customer_email if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'customer_email'
  ) THEN
    ALTER TABLE bookings ADD COLUMN customer_email text;
  END IF;

  -- Add customer_phone if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'customer_phone'
  ) THEN
    ALTER TABLE bookings ADD COLUMN customer_phone text;
  END IF;
END $$;

-- Make customer fields required for new bookings
ALTER TABLE bookings 
  ALTER COLUMN customer_name SET NOT NULL,
  ALTER COLUMN customer_email SET NOT NULL;

-- Add email validation constraint
ALTER TABLE bookings 
  ADD CONSTRAINT bookings_email_check 
  CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Users can create own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can read own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;

-- Create new RLS policies
CREATE POLICY "Users can create bookings"
  ON bookings
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can read own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can update own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Allow anonymous users to read their bookings by email
CREATE POLICY "Anonymous users can read bookings by email"
  ON bookings
  FOR SELECT
  TO anon
  USING (false); -- Disabled for security, only authenticated users can read

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_name ON bookings(customer_name);