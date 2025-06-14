/*
  # Create time_slots table for calendar management

  1. New Tables
    - `time_slots`
      - `id` (uuid, primary key)
      - `date` (date) - The date for this time slot
      - `time` (text) - Time range like "09:00-13:00"
      - `max_participants` (integer) - Maximum number of participants
      - `price_per_person` (numeric) - Price per person for this slot
      - `is_active` (boolean) - Whether this slot is available for booking
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `time_slots` table
    - Add policies for admin management and public reading of active slots

  3. Indexes
    - Add index on date for efficient querying
    - Add index on is_active for filtering
*/

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

-- Insert some sample time slots for the current month
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