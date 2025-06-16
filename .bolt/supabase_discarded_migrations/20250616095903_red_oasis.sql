/*
  # Create Booking Insert Function

  1. New Functions
    - `insert_booking` - RPC function to insert a new booking with validation
      - Validates input parameters
      - Checks time slot availability
      - Inserts booking record
      - Returns the created booking ID

  2. Security
    - Function is accessible to both authenticated and anonymous users
    - Performs validation checks before insertion
    - Handles error cases gracefully
*/

-- Create a function to insert a booking with validation
CREATE OR REPLACE FUNCTION insert_booking(
  p_user_id uuid DEFAULT NULL,
  p_booking_date date,
  p_time_slot text,
  p_participants integer,
  p_total_price numeric,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text DEFAULT NULL,
  p_special_requests text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking_id uuid;
  v_time_slot_exists boolean;
  v_time_slot_active boolean;
  v_max_participants integer;
  v_current_participants integer;
BEGIN
  -- Validate required parameters
  IF p_booking_date IS NULL THEN
    RAISE EXCEPTION 'Booking date is required';
  END IF;
  
  IF p_time_slot IS NULL THEN
    RAISE EXCEPTION 'Time slot is required';
  END IF;
  
  IF p_participants IS NULL OR p_participants < 1 THEN
    RAISE EXCEPTION 'At least one participant is required';
  END IF;
  
  IF p_total_price IS NULL OR p_total_price <= 0 THEN
    RAISE EXCEPTION 'Valid total price is required';
  END IF;
  
  IF p_customer_name IS NULL OR p_customer_name = '' THEN
    RAISE EXCEPTION 'Customer name is required';
  END IF;
  
  IF p_customer_email IS NULL OR p_customer_email = '' THEN
    RAISE EXCEPTION 'Customer email is required';
  END IF;
  
  -- Check if the time slot exists and is active
  SELECT 
    EXISTS(SELECT 1 FROM time_slots WHERE date = p_booking_date AND time = p_time_slot),
    (SELECT is_active FROM time_slots WHERE date = p_booking_date AND time = p_time_slot),
    (SELECT max_participants FROM time_slots WHERE date = p_booking_date AND time = p_time_slot)
  INTO v_time_slot_exists, v_time_slot_active, v_max_participants;
  
  IF NOT v_time_slot_exists THEN
    RAISE EXCEPTION 'Selected time slot does not exist';
  END IF;
  
  IF NOT v_time_slot_active THEN
    RAISE EXCEPTION 'Selected time slot is not available';
  END IF;
  
  -- Check if there's enough capacity
  SELECT COALESCE(SUM(participants), 0)
  INTO v_current_participants
  FROM bookings
  WHERE booking_date = p_booking_date
  AND time_slot = p_time_slot
  AND status NOT IN ('cancelled');
  
  IF v_current_participants + p_participants > v_max_participants THEN
    RAISE EXCEPTION 'Not enough capacity for this time slot. Only % spots remaining.', 
      v_max_participants - v_current_participants;
  END IF;
  
  -- Insert the booking
  INSERT INTO bookings (
    user_id,
    booking_date,
    time_slot,
    participants,
    total_price,
    customer_name,
    customer_email,
    customer_phone,
    special_requests,
    status,
    deposit_paid,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_booking_date,
    p_time_slot,
    p_participants,
    p_total_price,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_special_requests,
    'pending',
    0,
    now(),
    now()
  )
  RETURNING id INTO v_booking_id;
  
  RETURN v_booking_id;
EXCEPTION
  WHEN others THEN
    -- Re-raise the exception with the original message
    RAISE;
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION insert_booking TO authenticated, anon;