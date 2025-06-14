/*
  # Create time_slots table with policies

  1. New Tables
    - `time_slots`
      - `id` (uuid, primary key)
      - `date` (date, not null)
      - `time` (text, not null)
      - `max_participants` (integer, default 5)
      - `price_per_person` (numeric, default 195.00)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `time_slots` table
    - Add policies for reading active time slots (public)
    - Add policies for authenticated users to read all time slots
    - Add policies for admins to manage time slots

  3. Sample Data
    - Insert sample time slots for the next 2 weeks
*/

-- Create time_slots table if it doesn't exist
CREATE TABLE IF NOT EXISTS time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  time text NOT NULL,
  max_participants integer DEFAULT 5 NOT NULL,
  price_per_person numeric(10,2) DEFAULT 195.00 NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_time_slots_date ON time_slots(date);
CREATE INDEX IF NOT EXISTS idx_time_slots_active ON time_slots(is_active);
CREATE INDEX IF NOT EXISTS idx_time_slots_date_active ON time_slots(date, is_active);
CREATE INDEX IF NOT EXISTS idx_time_slots_time ON time_slots(time);

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Anyone can read active time slots" ON time_slots;
DROP POLICY IF EXISTS "Authenticated users can read all time slots" ON time_slots;
DROP POLICY IF EXISTS "Admins can manage time slots" ON time_slots;

-- Policies for time_slots
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
  USING (is_admin())
  WITH CHECK (is_admin());

-- Insert sample time slots only if the table is empty
INSERT INTO time_slots (date, time, max_participants, price_per_person, is_active)
SELECT * FROM (VALUES
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
) AS new_slots(date, time, max_participants, price_per_person, is_active)
WHERE NOT EXISTS (SELECT 1 FROM time_slots LIMIT 1);