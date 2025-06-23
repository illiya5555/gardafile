/*
  # Fix Admin Dashboard Database Issues

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `type` (text, notification type like 'booking', 'corporate', 'review')
      - `message` (text, notification message)
      - `time` (text, time description like '2 hours ago')
      - `is_read` (boolean, default false)
      - `created_at` (timestamp)

  2. New Functions
    - `get_admin_dashboard_stats()` - Returns aggregated statistics for admin dashboard

  3. Security
    - Enable RLS on `notifications` table
    - Add policies for authenticated users to manage notifications
    - Function is accessible to authenticated users
*/

-- Create notifications table
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

-- Add RLS policies for notifications
CREATE POLICY "Authenticated users can view notifications"
  ON notifications
  FOR SELECT
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

CREATE POLICY "Authenticated users can delete notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Create get_admin_dashboard_stats function
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE (
  total_bookings bigint,
  total_revenue numeric,
  total_customers bigint,
  pending_corporate_inquiries bigint,
  bookings_last_30_days bigint,
  avg_booking_value numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Total bookings from reservations
    (SELECT COUNT(*) FROM reservations WHERE status IN ('confirmed', 'completed'))::bigint AS total_bookings,
    
    -- Total revenue from completed/confirmed bookings
    (SELECT COALESCE(SUM(total_price), 0) FROM reservations WHERE status IN ('confirmed', 'completed'))::numeric AS total_revenue,
    
    -- Total customers
    (SELECT COUNT(*) FROM unified_customers)::bigint AS total_customers,
    
    -- Pending corporate inquiries
    (SELECT COUNT(*) FROM unified_inquiries WHERE type = 'corporate' AND status = 'new')::bigint AS pending_corporate_inquiries,
    
    -- Bookings in last 30 days
    (SELECT COUNT(*) FROM reservations 
     WHERE created_at >= NOW() - INTERVAL '30 days' 
     AND status IN ('confirmed', 'completed', 'pending'))::bigint AS bookings_last_30_days,
    
    -- Average booking value
    (SELECT COALESCE(AVG(total_price), 0) FROM reservations WHERE status IN ('confirmed', 'completed'))::numeric AS avg_booking_value;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;

-- Insert some sample notifications for testing
INSERT INTO notifications (type, message, time, is_read) VALUES
  ('booking', 'New booking from Marco Rossi', '2 hours ago', false),
  ('corporate', 'Corporate inquiry from TechCorp', '5 hours ago', false),
  ('review', 'New review (5 stars)', '1 day ago', true)
ON CONFLICT DO NOTHING;