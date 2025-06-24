/*
  # Customer Data Management Functions

  1. Purpose
     - Manages customer data across the system
     - Ensures data consistency between bookings and customer profiles
     - Provides utilities for customer data operations

  2. Features
     - Automatic customer profile creation from bookings
     - Customer statistics updates
     - Customer data validation
     - Customer search functionality
*/

-- Create a function to manage customer data when a booking is created or updated
CREATE OR REPLACE FUNCTION manage_customer_data()
RETURNS TRIGGER AS $$
DECLARE
    customer_id UUID;
BEGIN
    -- Check if customer already exists by email
    SELECT id INTO customer_id
    FROM unified_customers
    WHERE email = NEW.customer_email;
    
    IF customer_id IS NULL THEN
        -- Create new customer record
        INSERT INTO unified_customers (
            email,
            first_name,
            last_name,
            phone,
            total_bookings,
            total_spent,
            last_booking_date,
            source,
            created_at,
            updated_at
        ) VALUES (
            NEW.customer_email,
            SPLIT_PART(NEW.customer_name, ' ', 1),
            NULLIF(REGEXP_REPLACE(NEW.customer_name, '^[^ ]+ ', ''), ''),
            NEW.customer_phone,
            1,
            NEW.total_price,
            NEW.booking_date,
            COALESCE(NEW.booking_source, 'website'),
            NOW(),
            NOW()
        )
        RETURNING id INTO customer_id;
        
        -- Link the booking to the new customer
        NEW.customer_id := customer_id;
    ELSE
        -- Update existing customer record
        UPDATE unified_customers
        SET 
            -- Only update name and phone if they're not already set
            first_name = COALESCE(first_name, SPLIT_PART(NEW.customer_name, ' ', 1)),
            last_name = COALESCE(last_name, NULLIF(REGEXP_REPLACE(NEW.customer_name, '^[^ ]+ ', ''), '')),
            phone = COALESCE(phone, NEW.customer_phone),
            -- Update statistics
            total_bookings = total_bookings + 1,
            total_spent = total_spent + NEW.total_price,
            last_booking_date = GREATEST(last_booking_date, NEW.booking_date),
            updated_at = NOW()
        WHERE id = customer_id;
        
        -- Link the booking to the existing customer
        NEW.customer_id := customer_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to manage customer data when a booking is created or updated
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'manage_customer_data_trigger' 
        AND tgrelid = 'reservations'::regclass
    ) THEN
        CREATE TRIGGER manage_customer_data_trigger
        BEFORE INSERT OR UPDATE ON reservations
        FOR EACH ROW
        EXECUTE FUNCTION manage_customer_data();
    END IF;
END $$;

-- Create a function to validate booking data
CREATE OR REPLACE FUNCTION validate_booking_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate email format
    IF NEW.customer_email !~ '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$' THEN
        RAISE EXCEPTION 'Invalid email format: %', NEW.customer_email;
    END IF;
    
    -- Validate participants count
    IF NEW.participants < 1 OR NEW.participants > 5 THEN
        RAISE EXCEPTION 'Invalid participants count: %. Must be between 1 and 5.', NEW.participants;
    END IF;
    
    -- Validate time slot format (if applicable)
    IF NEW.time_slot IS NOT NULL AND NEW.time_slot NOT IN ('08:30-12:30', '13:30-17:30') THEN
        RAISE EXCEPTION 'Invalid time slot: %. Must be either 08:30-12:30 or 13:30-17:30.', NEW.time_slot;
    END IF;
    
    -- Validate booking date is not in the past
    IF NEW.booking_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Booking date cannot be in the past: %', NEW.booking_date;
    END IF;
    
    -- Check for time slot availability
    IF NEW.status IN ('pending', 'confirmed') AND NEW.type = 'regular' THEN
        -- Check if the time slot exists and is active
        IF NOT EXISTS (
            SELECT 1 FROM time_slots
            WHERE date = NEW.booking_date
            AND time = NEW.time_slot
            AND is_active = true
        ) THEN
            RAISE EXCEPTION 'Time slot % on % is not available', NEW.time_slot, NEW.booking_date;
        END IF;
        
        -- Check if the time slot has enough capacity
        IF EXISTS (
            SELECT 1 FROM time_slots ts
            WHERE ts.date = NEW.booking_date
            AND ts.time = NEW.time_slot
            AND ts.max_participants < (
                SELECT COALESCE(SUM(r.participants), 0) + NEW.participants
                FROM reservations r
                WHERE r.booking_date = NEW.booking_date
                AND r.time_slot = NEW.time_slot
                AND r.status IN ('pending', 'confirmed')
                AND r.id != NEW.id
            )
        ) THEN
            RAISE EXCEPTION 'Time slot % on % does not have enough capacity', NEW.time_slot, NEW.booking_date;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to validate booking data
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'validate_booking_trigger' 
        AND tgrelid = 'reservations'::regclass
    ) THEN
        CREATE TRIGGER validate_booking_trigger
        BEFORE INSERT OR UPDATE ON reservations
        FOR EACH ROW
        EXECUTE FUNCTION validate_booking_data();
    END IF;
END $$;

-- Create a function to search for customers
CREATE OR REPLACE FUNCTION search_customers(search_term TEXT)
RETURNS TABLE (
    id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    phone TEXT,
    total_bookings INT,
    total_spent NUMERIC,
    last_booking_date DATE,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.email,
        c.first_name,
        c.last_name,
        COALESCE(c.full_name, CONCAT(c.first_name, ' ', c.last_name)) AS full_name,
        c.phone,
        c.total_bookings,
        c.total_spent,
        c.last_booking_date,
        c.created_at
    FROM
        unified_customers c
    WHERE
        c.search_vector @@ plainto_tsquery('english', search_term) OR
        c.email ILIKE '%' || search_term || '%' OR
        c.first_name ILIKE '%' || search_term || '%' OR
        c.last_name ILIKE '%' || search_term || '%' OR
        c.full_name ILIKE '%' || search_term || '%' OR
        c.phone ILIKE '%' || search_term || '%' OR
        c.company_name ILIKE '%' || search_term || '%'
    ORDER BY
        CASE
            WHEN c.email = search_term THEN 1
            WHEN c.email ILIKE search_term || '%' THEN 2
            WHEN c.full_name ILIKE search_term || '%' THEN 3
            ELSE 4
        END,
        c.total_bookings DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get customer booking history
CREATE OR REPLACE FUNCTION get_customer_booking_history(customer_email TEXT)
RETURNS TABLE (
    id UUID,
    booking_date DATE,
    time_slot TEXT,
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
        r.participants,
        r.total_price,
        r.status,
        r.created_at
    FROM
        reservations r
    WHERE
        r.customer_email = customer_email
    ORDER BY
        r.booking_date DESC,
        r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to merge duplicate customers
CREATE OR REPLACE FUNCTION merge_duplicate_customers(
    primary_customer_id UUID,
    duplicate_customer_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    primary_email TEXT;
    duplicate_email TEXT;
    success BOOLEAN := FALSE;
BEGIN
    -- Get customer emails
    SELECT email INTO primary_email FROM unified_customers WHERE id = primary_customer_id;
    SELECT email INTO duplicate_email FROM unified_customers WHERE id = duplicate_customer_id;
    
    -- Validate input
    IF primary_email IS NULL OR duplicate_email IS NULL THEN
        RAISE EXCEPTION 'One or both customer IDs are invalid';
    END IF;
    
    -- Begin transaction
    BEGIN
        -- Update bookings to point to primary customer
        UPDATE reservations
        SET customer_id = primary_customer_id
        WHERE customer_id = duplicate_customer_id;
        
        -- Update inquiries to use primary customer email
        UPDATE unified_inquiries
        SET customer_email = primary_email
        WHERE customer_email = duplicate_email;
        
        -- Update customer statistics
        UPDATE unified_customers
        SET
            total_bookings = total_bookings + COALESCE((SELECT total_bookings FROM unified_customers WHERE id = duplicate_customer_id), 0),
            total_spent = total_spent + COALESCE((SELECT total_spent FROM unified_customers WHERE id = duplicate_customer_id), 0),
            last_booking_date = GREATEST(
                last_booking_date,
                (SELECT last_booking_date FROM unified_customers WHERE id = duplicate_customer_id)
            ),
            updated_at = NOW()
        WHERE id = primary_customer_id;
        
        -- Delete duplicate customer
        DELETE FROM unified_customers WHERE id = duplicate_customer_id;
        
        success := TRUE;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Error merging customers: %', SQLERRM;
        success := FALSE;
    END;
    
    RETURN success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION search_customers(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_booking_history(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION merge_duplicate_customers(UUID, UUID) TO authenticated;

-- Return a message to confirm successful creation
SELECT 'Customer data management functions created successfully' AS result;