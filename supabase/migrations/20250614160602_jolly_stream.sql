/*
  # Fix time_slots table structure

  1. Check existing table structure and add missing columns if needed
  2. Create indexes for better performance  
  3. Set up RLS policies for time slot management
  4. Insert sample data for testing

  This migration works with the existing time_slots table structure.
*/

-- First, let's check if we need to add any missing columns to the existing time_slots table
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
    ALTER TABLE time_slots ADD COLUMN max_participants integer DEFAULT 5 NOT NULL;
  END IF;

  -- Add price_per_person column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'time_slots' AND column_name = 'price_per_person'  
  ) THEN
    ALTER TABLE time_slots ADD COLUMN price_per_person numeric(10,2) DEFAULT 195.00 NOT NULL;
  END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_time_slots_date ON time_slots(date);
CREATE INDEX IF NOT EXISTS idx_time_slots_active ON time_slots(is_active);
CREATE INDEX IF NOT EXISTS idx_time_slots_date_active ON time_slots(date, is_active);
CREATE INDEX IF NOT EXISTS idx_time_slots_time ON time_slots(time);

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read active time slots" ON time_slots;
DROP POLICY IF EXISTS "Authenticated users can read all time slots" ON time_slots;
DROP POLICY IF EXISTS "Admins can manage time slots" ON time_slots;

-- Create new policies for time_slots
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

-- Update existing records to have date values if they don't have them
UPDATE time_slots 
SET date = CURRENT_DATE + INTERVAL '1 day'
WHERE date IS NULL;

-- Insert sample time slots only if the table is empty or has very few records
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM time_slots WHERE date >= CURRENT_DATE) < 5 THEN
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
      (CURRENT_DATE + INTERVAL '14 days', '08:30-12:30', 5, 195.00, true)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;