/*
  # Unified Calendar System

  1. New Functions
     - `get_available_dates()` - Returns all available dates with active time slots
     - `get_time_slots_for_date(date)` - Returns all time slots for a specific date
     - `is_date_available(date)` - Checks if a date has any active time slots

  2. Triggers
     - Add trigger to notify clients when time slots are updated
     - Add trigger to update booking availability based on time slot changes

  3. Security
     - Enable RLS for all calendar-related tables
     - Add policies for different user roles
*/

-- Function to get all available dates (dates with active time slots)
CREATE OR REPLACE FUNCTION get_available_dates()
RETURNS SETOF date AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT date
  FROM time_slots
  WHERE is_active = true
  ORDER BY date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all time slots for a specific date
CREATE OR REPLACE FUNCTION get_time_slots_for_date(date_param date)
RETURNS SETOF time_slots AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM time_slots
  WHERE date = date_param
  ORDER BY time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a date has any active time slots
CREATE OR REPLACE FUNCTION is_date_available(date_param date)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM time_slots
    WHERE date = date_param AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure time_slots table has non-null values for max_participants and price_per_person
ALTER TABLE time_slots 
  ALTER COLUMN max_participants SET DEFAULT 5,
  ALTER COLUMN price_per_person SET DEFAULT 195.00;

-- Update any existing NULL values
UPDATE time_slots 
SET max_participants = 5 
WHERE max_participants IS NULL;

UPDATE time_slots 
SET price_per_person = 195.00 
WHERE price_per_person IS NULL;

-- Add NOT NULL constraint to these columns
ALTER TABLE time_slots 
  ALTER COLUMN max_participants SET NOT NULL,
  ALTER COLUMN price_per_person SET NOT NULL;

-- Create a function to handle time slot changes
CREATE OR REPLACE FUNCTION handle_time_slot_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify clients about the change
  PERFORM pg_notify('time_slots_changed', json_build_object(
    'table', TG_TABLE_NAME,
    'type', TG_OP,
    'id', NEW.id,
    'date', NEW.date,
    'time', NEW.time,
    'is_active', NEW.is_active
  )::text);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for time slot changes
DROP TRIGGER IF EXISTS notify_time_slot_change ON time_slots;
CREATE TRIGGER notify_time_slot_change
AFTER INSERT OR UPDATE OR DELETE ON time_slots
FOR EACH ROW EXECUTE FUNCTION handle_time_slot_change();

-- Create a function to check booking conflicts
CREATE OR REPLACE FUNCTION check_booking_conflicts()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the time slot is active
  IF NOT EXISTS (
    SELECT 1 FROM time_slots 
    WHERE date = NEW.booking_date 
    AND time = NEW.time_slot 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Selected time slot is not available';
  END IF;
  
  -- Check if the time slot has enough capacity
  IF (
    SELECT COUNT(*) 
    FROM bookings 
    WHERE booking_date = NEW.booking_date 
    AND time_slot = NEW.time_slot 
    AND status NOT IN ('cancelled')
  ) + NEW.participants > (
    SELECT max_participants 
    FROM time_slots 
    WHERE date = NEW.booking_date 
    AND time = NEW.time_slot
  ) THEN
    RAISE EXCEPTION 'Not enough capacity for this time slot';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking validation
DROP TRIGGER IF EXISTS validate_booking ON bookings;
CREATE TRIGGER validate_booking
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION check_booking_conflicts();

-- Create a function to update time slot availability based on bookings
CREATE OR REPLACE FUNCTION update_time_slot_availability()
RETURNS TRIGGER AS $$
DECLARE
  current_participants INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Get current number of participants for this time slot
  SELECT COALESCE(SUM(participants), 0) INTO current_participants
  FROM bookings
  WHERE booking_date = NEW.booking_date
  AND time_slot = NEW.time_slot
  AND status NOT IN ('cancelled');
  
  -- Get max participants allowed for this time slot
  SELECT max_participants INTO max_allowed
  FROM time_slots
  WHERE date = NEW.booking_date
  AND time = NEW.time_slot;
  
  -- If time slot is full, mark it as inactive
  IF current_participants >= max_allowed THEN
    UPDATE time_slots
    SET is_active = false
    WHERE date = NEW.booking_date
    AND time = NEW.time_slot;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating time slot availability
DROP TRIGGER IF EXISTS update_slot_availability ON bookings;
CREATE TRIGGER update_slot_availability
AFTER INSERT OR UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_time_slot_availability();

-- Add RLS policies for time_slots table
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage time slots" ON time_slots;
DROP POLICY IF EXISTS "Anyone can read active time slots" ON time_slots;
DROP POLICY IF EXISTS "Authenticated users can read all time slots" ON time_slots;
DROP POLICY IF EXISTS "Managers can manage time slots" ON time_slots;

-- Create policies for time_slots
CREATE POLICY "Admins can manage time slots"
  ON time_slots
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Managers can manage time slots"
  ON time_slots
  USING (is_manager())
  WITH CHECK (is_manager());

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

-- Create a function to bulk update time slots
CREATE OR REPLACE FUNCTION bulk_update_time_slots(
  start_date date,
  end_date date,
  action text -- 'activate', 'deactivate', or 'delete'
)
RETURNS integer AS $$
DECLARE
  affected_rows integer;
BEGIN
  IF action = 'activate' THEN
    UPDATE time_slots
    SET is_active = true
    WHERE date BETWEEN start_date AND end_date;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
  ELSIF action = 'deactivate' THEN
    UPDATE time_slots
    SET is_active = false
    WHERE date BETWEEN start_date AND end_date;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
  ELSIF action = 'delete' THEN
    DELETE FROM time_slots
    WHERE date BETWEEN start_date AND end_date;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
  ELSE
    RAISE EXCEPTION 'Invalid action: must be activate, deactivate, or delete';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to create default time slots for a date
CREATE OR REPLACE FUNCTION create_default_time_slots(date_param date)
RETURNS integer AS $$
DECLARE
  inserted_rows integer;
BEGIN
  INSERT INTO time_slots (date, time, max_participants, price_per_person, is_active)
  VALUES
    (date_param, '08:30-12:30', 5, 195.00, true),
    (date_param, '13:30-17:30', 5, 195.00, true)
  ON CONFLICT (date, time) DO NOTHING;
  
  GET DIAGNOSTICS inserted_rows = ROW_COUNT;
  RETURN inserted_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get booking statistics for a date
CREATE OR REPLACE FUNCTION get_date_booking_stats(date_param date)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'date', date_param,
    'total_slots', COUNT(ts.id),
    'active_slots', COUNT(ts.id) FILTER (WHERE ts.is_active = true),
    'total_bookings', COUNT(b.id),
    'total_participants', COALESCE(SUM(b.participants), 0),
    'available_capacity', SUM(
      CASE WHEN ts.is_active THEN 
        ts.max_participants - COALESCE((
          SELECT SUM(b2.participants) 
          FROM bookings b2 
          WHERE b2.booking_date = ts.date 
          AND b2.time_slot = ts.time
          AND b2.status NOT IN ('cancelled')
        ), 0)
      ELSE 0 END
    )
  ) INTO result
  FROM time_slots ts
  LEFT JOIN bookings b ON ts.date = b.booking_date AND ts.time = b.time_slot AND b.status NOT IN ('cancelled')
  WHERE ts.date = date_param
  GROUP BY ts.date;
  
  RETURN COALESCE(result, json_build_object(
    'date', date_param,
    'total_slots', 0,
    'active_slots', 0,
    'total_bookings', 0,
    'total_participants', 0,
    'available_capacity', 0
  ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add unique constraint to prevent duplicate time slots
ALTER TABLE time_slots 
DROP CONSTRAINT IF EXISTS time_slots_date_time_key;

ALTER TABLE time_slots 
ADD CONSTRAINT time_slots_date_time_key UNIQUE (date, time);