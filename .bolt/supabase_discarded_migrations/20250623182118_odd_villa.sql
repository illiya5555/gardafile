/*
  # Create missing tables and functions

  1. New Tables
    - `notifications` - For system notifications
  2. New Functions
    - `get_admin_dashboard_stats` - For admin dashboard statistics
  3. Security
    - Enable RLS on new tables
    - Add appropriate policies
*/

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  message text NOT NULL,
  time text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Authenticated users can delete notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications (is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications (type);

-- Create admin dashboard stats function
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_bookings', (SELECT COUNT(*) FROM reservations),
    'total_revenue', (SELECT COALESCE(SUM(total_price), 0) FROM reservations),
    'total_customers', (SELECT COUNT(*) FROM unified_customers),
    'bookings_last_30_days', (SELECT COUNT(*) FROM reservations WHERE created_at > NOW() - INTERVAL '30 days'),
    'avg_booking_value', (
      SELECT CASE 
        WHEN COUNT(*) > 0 THEN ROUND(SUM(total_price) / COUNT(*), 2)
        ELSE 0
      END 
      FROM reservations
    ),
    'pending_corporate_inquiries', (
      SELECT COUNT(*) 
      FROM unified_inquiries 
      WHERE type = 'corporate' AND status = 'new'
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create yachts table if it doesn't exist
CREATE TABLE IF NOT EXISTS yachts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  model text NOT NULL,
  capacity integer NOT NULL DEFAULT 8,
  hourly_rate numeric(10,2) NOT NULL DEFAULT 199.00,
  is_active boolean DEFAULT true,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on yachts table
ALTER TABLE yachts ENABLE ROW LEVEL SECURITY;

-- Create policy for yachts
CREATE POLICY "Anyone can read active yachts"
  ON yachts
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Create index for yachts
CREATE INDEX IF NOT EXISTS idx_yachts_is_active ON yachts (is_active);

-- Create yacht_bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS yacht_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  yacht_id uuid REFERENCES yachts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  participants integer NOT NULL DEFAULT 1,
  total_price numeric(10,2) NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT yacht_bookings_status_check CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'))
);

-- Enable RLS on yacht_bookings table
ALTER TABLE yacht_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for yacht_bookings
CREATE POLICY "Anyone can create yacht bookings"
  ON yacht_bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read own yacht bookings"
  ON yacht_bookings
  FOR SELECT
  TO authenticated
  USING ((user_id = uid()) OR (customer_email = (SELECT email FROM profiles WHERE id = uid())));

-- Create indexes for yacht_bookings
CREATE INDEX IF NOT EXISTS idx_yacht_bookings_dates ON yacht_bookings (start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_yacht_bookings_status ON yacht_bookings (status);
CREATE INDEX IF NOT EXISTS idx_yacht_bookings_user_id ON yacht_bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_yacht_bookings_yacht_id ON yacht_bookings (yacht_id);

-- Insert sample data for testing
INSERT INTO yachts (name, model, capacity, hourly_rate, description, is_active)
VALUES 
  ('Adriatic Wind', 'Bavaria 34', 8, 199.00, 'Comfortable cruising yacht perfect for day trips', true),
  ('Blue Horizon', 'Beneteau Oceanis 38', 10, 249.00, 'Spacious sailing yacht with modern amenities', true),
  ('Sea Spirit', 'Jeanneau Sun Odyssey 40', 12, 299.00, 'Premium sailing experience with luxurious cabin', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (type, message, time, is_read, created_at)
VALUES 
  ('booking', 'New booking from Marco Rossi', '2 hours ago', false, now() - interval '2 hours'),
  ('corporate', 'Corporate inquiry from TechCorp', '5 hours ago', false, now() - interval '5 hours'),
  ('review', 'New review (5 stars)', '1 day ago', true, now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;