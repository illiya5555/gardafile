/*
  # Fix time_slots table migration

  1. Check and update table structure
    - Add missing columns if they don't exist
    - Ensure proper data types and defaults
  
  2. Security
    - Drop existing policies to avoid conflicts
    - Create new RLS policies for proper access control
    - Enable RLS on table
  
  3. Sample Data
    - Add sample time slots for testing
    - Only insert if table is empty or has few records
*/

-- First, check if table exists and create if not
CREATE TABLE IF NOT EXISTS time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  time text NOT NULL,
  max_participants integer DEFAULT 8,
  price_per_person numeric(10,2) DEFAULT 199.00,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  date date
);

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'date'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN date date;
  END IF;

  -- Add max_participants column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'max_participants'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN max_participants integer DEFAULT 8;
  END IF;

  -- Add price_per_person column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'price_per_person'
  ) THEN
    ALTER TABLE time_slots ADD COLUMN price_per_person numeric(10,2) DEFAULT 199.00;
  END IF;
END $$;

-- Update existing records that might have NULL dates
UPDATE time_slots 
SET date = CURRENT_DATE + INTERVAL '1 day'
WHERE date IS NULL;

-- Enable RLS
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read active time slots" ON time_slots;
DROP POLICY IF EXISTS "Authenticated users can read all time slots" ON time_slots;
DROP POLICY IF EXISTS "Admins can manage time slots" ON time_slots;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_time_slots_date ON time_slots(date);
CREATE INDEX IF NOT EXISTS idx_time_slots_active ON time_slots(is_active);
CREATE INDEX IF NOT EXISTS idx_time_slots_date_active ON time_slots(date, is_active);
CREATE INDEX IF NOT EXISTS idx_time_slots_time ON time_slots(time);

-- Create new RLS policies
CREATE POLICY "Anyone can read active time slots"
  ON time_slots
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can read all time slots"
  ON time_slots
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage time slots"
  ON time_slots
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id = (
        SELECT id FROM user_roles WHERE role_name = 'admin'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id = (
        SELECT id FROM user_roles WHERE role_name = 'admin'
      )
    )
  );

-- Insert sample data only if table has few records
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM time_slots) < 5 THEN
    INSERT INTO time_slots (date, time, max_participants, price_per_person, is_active) VALUES
      (CURRENT_DATE + INTERVAL '1 day', '08:30-12:30', 5, 195.00, true),
      (CURRENT_DATE + INTERVAL '1 day', '13:00-17:00', 5, 195.00, true),
      (CURRENT_DATE + INTERVAL '2 days', '09:00-13:00', 5, 195.00, true),
      (CURRENT_DATE + INTERVAL '3 days', '08:30-12:30', 5, 195.00, true),
      (CURRENT_DATE + INTERVAL '3 days', '14:00-18:00', 5, 195.00, true),
      (CURRENT_DATE + INTERVAL '5 days', '09:00-13:00', 5, 195.00, true),
      (CURRENT_DATE + INTERVAL '7 days', '08:30-12:30', 5, 195.00, true),
      (CURRENT_DATE + INTERVAL '7 days', '13:00-17:00', 5, 195.00, true),
      (CURRENT_DATE + INTERVAL '10 days', '09:00-13:00', 5, 195.00, true),
      (CURRENT_DATE + INTERVAL '14 days', '08:30-12:30', 5, 195.00, true);
  END IF;
END $$;