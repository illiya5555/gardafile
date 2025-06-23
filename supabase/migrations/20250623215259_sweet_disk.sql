/*
  # Booking Data Management Functions

  1. Purpose
     - Manages booking data across the system
     - Ensures data consistency and validation
     - Provides utilities for booking operations

  2. Features
     - Booking validation
     - Availability checking
     - Booking statistics
     - Booking search functionality
*/

-- Create a function to check time slot availability
CREATE OR REPLACE FUNCTION check_time_slot_availability(
    check_date DATE,
    check_time TEXT,
    participants_count INT DEFAULT 1
)
RETURNS TABLE (
    is_available BOOLEAN,
    available_slots INT,
    max_participants INT,
    current_bookings INT,
    remaining_capacity INT
) AS $$
DECLARE
    slot_max_participants INT;
    current_booking_count INT;
    current_participant_count INT;
BEGIN
    -- Get the time slot information
    SELECT max_participants INTO slot_max_participants
    FROM time_slots
    WHERE date = check_date AND time = check_time AND is_active = true;
    
    -- If time slot doesn't exist or is not active
    IF slot_max_participants IS NULL THEN
        is_available := FALSE;
        available_slots := 0;
        max_participants := 0;
        current_bookings := 0;
        remaining_capacity := 0;
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- Get current bookings for this time slot
    SELECT 
        COUNT(*),
        COALESCE(SUM(participants), 0)
    INTO 
        current_booking_count,
        current_participant_count
    FROM 
        reservations
    WHERE 
        booking_date = check_date AND 
        time_slot = check_time AND
        status IN ('pending', 'confirmed');
    
    -- Calculate remaining capacity
    remaining_capacity := GREATEST(0, slot_max_participants - current_participant_count);
    
    -- Check if there's enough capacity for the requested participants
    is_available := remaining_capacity >= participants_count;
    available_slots := CASE WHEN is_available THEN 1 ELSE 0 END;
    max_participants := slot_max_participants;
    current_bookings := current_booking_count;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get available dates
CREATE OR REPLACE FUNCTION get_available_dates(
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE DEFAULT CURRENT_DATE + INTERVAL '90 days',
    min_participants INT DEFAULT 1
)
RETURNS TABLE (
    date DATE,
    available_morning BOOLEAN,
    available_afternoon BOOLEAN,
    morning_capacity INT,
    afternoon_capacity INT
) AS $$
DECLARE
    current_date DATE := start_date;
    morning_slot TEXT := '08:30-12:30';
    afternoon_slot TEXT := '13:30-17:30';
    morning_available BOOLEAN;
    afternoon_available BOOLEAN;
    morning_cap INT;
    afternoon_cap INT;
BEGIN
    -- Loop through each date in the range
    WHILE current_date <= end_date LOOP
        -- Check morning availability
        SELECT 
            is_available,
            remaining_capacity
        INTO 
            morning_available,
            morning_cap
        FROM 
            check_time_slot_availability(current_date, morning_slot, min_participants);
        
        -- Check afternoon availability
        SELECT 
            is_available,
            remaining_capacity
        INTO 
            afternoon_available,
            afternoon_cap
        FROM 
            check_time_slot_availability(current_date, afternoon_slot, min_participants);
        
        -- Return results if at least one slot is available
        IF morning_available OR afternoon_available THEN
            date := current_date;
            available_morning := morning_available;
            available_afternoon := afternoon_available;
            morning_capacity := morning_cap;
            afternoon_capacity := afternoon_cap;
            RETURN NEXT;
        END IF;
        
        -- Move to next date
        current_date := current_date + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get date booking stats
CREATE OR REPLACE FUNCTION get_date_booking_stats(date_param DATE)
RETURNS TABLE (
    time_slot TEXT,
    total_bookings INT,
    total_participants INT,
    max_capacity INT,
    remaining_capacity INT,
    is_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ts.time,
        COUNT(r.id) AS total_bookings,
        COALESCE(SUM(r.participants), 0) AS total_participants,
        ts.max_participants,
        GREATEST(0, ts.max_participants - COALESCE(SUM(r.participants), 0)) AS remaining_capacity,
        (ts.is_active AND GREATEST(0, ts.max_participants - COALESCE(SUM(r.participants), 0)) > 0) AS is_available
    FROM
        time_slots ts
    LEFT JOIN
        reservations r ON r.booking_date = ts.date 
                      AND r.time_slot = ts.time 
                      AND r.status IN ('pending', 'confirmed')
    WHERE
        ts.date = date_param
    GROUP BY
        ts.time, ts.max_participants, ts.is_active
    ORDER BY
        ts.time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to search for bookings
CREATE OR REPLACE FUNCTION search_bookings(search_term TEXT)
RETURNS TABLE (
    id UUID,
    booking_date DATE,
    time_slot TEXT,
    customer_name TEXT,
    customer_email TEXT,
    participants INT,
    total_price NUMERIC,
    status TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.booking_date,
        r.time_slot,
        r.customer_name,
        r.customer_email,
        r.participants,
        r.total_price,
        r.status,
        r.created_at
    FROM
        reservations r
    WHERE
        r.customer_name ILIKE '%' || search_term || '%' OR
        r.customer_email ILIKE '%' || search_term || '%' OR
        r.customer_phone ILIKE '%' || search_term || '%' OR
        CAST(r.booking_date AS TEXT) LIKE search_term || '%' OR
        r.time_slot ILIKE '%' || search_term || '%' OR
        r.status ILIKE '%' || search_term || '%'
    ORDER BY
        r.booking_date DESC,
        r.created_at DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to create default time slots for a date
CREATE OR REPLACE FUNCTION create_default_time_slots(date_param DATE)
RETURNS BOOLEAN AS $$
DECLARE
    success BOOLEAN := TRUE;
BEGIN
    -- Check if time slots already exist for this date
    IF EXISTS (SELECT 1 FROM time_slots WHERE date = date_param) THEN
        RETURN FALSE;
    END IF;
    
    -- Create morning time slot
    INSERT INTO time_slots (date, time, max_participants, price_per_person, is_active)
    VALUES (date_param, '08:30-12:30', 5, 195.00, TRUE);
    
    -- Create afternoon time slot
    INSERT INTO time_slots (date, time, max_participants, price_per_person, is_active)
    VALUES (date_param, '13:30-17:30', 5, 195.00, TRUE);
    
    RETURN success;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to bulk update time slots
CREATE OR REPLACE FUNCTION bulk_update_time_slots(
    start_date DATE,
    end_date DATE,
    action TEXT -- 'activate', 'deactivate', or 'delete'
)
RETURNS TABLE (
    date DATE,
    slots_affected INT,
    success BOOLEAN
) AS $$
DECLARE
    current_date DATE := start_date;
    affected_count INT;
BEGIN
    -- Loop through each date in the range
    WHILE current_date <= end_date LOOP
        -- Perform the requested action
        CASE action
            WHEN 'activate' THEN
                -- First check if slots exist
                IF NOT EXISTS (SELECT 1 FROM time_slots WHERE date = current_date) THEN
                    -- Create default slots
                    PERFORM create_default_time_slots(current_date);
                    affected_count := 2; -- Two default slots created
                ELSE
                    -- Activate existing slots
                    UPDATE time_slots
                    SET is_active = TRUE
                    WHERE date = current_date;
                    
                    GET DIAGNOSTICS affected_count = ROW_COUNT;
                END IF;
                
            WHEN 'deactivate' THEN
                UPDATE time_slots
                SET is_active = FALSE
                WHERE date = current_date;
                
                GET DIAGNOSTICS affected_count = ROW_COUNT;
                
            WHEN 'delete' THEN
                DELETE FROM time_slots
                WHERE date = current_date;
                
                GET DIAGNOSTICS affected_count = ROW_COUNT;
                
            ELSE
                RAISE EXCEPTION 'Invalid action: %. Must be "activate", "deactivate", or "delete".', action;
        END CASE;
        
        -- Return results for this date
        date := current_date;
        slots_affected := affected_count;
        success := TRUE;
        RETURN NEXT;
        
        -- Move to next date
        current_date := current_date + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION check_time_slot_availability(DATE, TEXT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_available_dates(DATE, DATE, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_date_booking_stats(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION search_bookings(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_default_time_slots(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_update_time_slots(DATE, DATE, TEXT) TO authenticated;

-- Return a message to confirm successful creation
SELECT 'Booking data management functions created successfully' AS result;