/*
# User Statistics Update Function

1. Purpose
   - Automatically updates user statistics when bookings change
   - Maintains consistency between bookings and user_core tables
   - Triggered on booking insert, update, or delete

2. Features
   - Updates total_bookings count
   - Updates total_spent amount
   - Updates last_booking_date
   - Handles all booking status changes
*/

-- Create function to update user statistics
CREATE OR REPLACE FUNCTION update_user_booking_stats()
RETURNS TRIGGER AS $$
DECLARE
    user_uuid UUID;
    booking_count INT;
    total_amount NUMERIC(10,2);
    last_date DATE;
BEGIN
    -- Determine which user to update
    IF TG_OP = 'DELETE' THEN
        user_uuid := OLD.user_id;
    ELSE
        user_uuid := NEW.user_id;
    END IF;
    
    -- Skip if no user associated
    IF user_uuid IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Calculate new statistics
    SELECT 
        COUNT(*),
        COALESCE(SUM(price), 0),
        MAX(start_date)
    INTO 
        booking_count,
        total_amount,
        last_date
    FROM 
        bookings
    WHERE 
        user_id = user_uuid
        AND status IN ('confirmed', 'completed');
    
    -- Update user record
    UPDATE users_core
    SET 
        total_bookings = booking_count,
        total_spent = total_amount,
        last_booking_date = last_date,
        updated_at = NOW()
    WHERE 
        id = user_uuid;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on bookings table
DO $$
BEGIN
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS trigger_update_user_booking_stats ON bookings;
    
    -- Create new trigger
    CREATE TRIGGER trigger_update_user_booking_stats
    AFTER INSERT OR UPDATE OR DELETE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_booking_stats();
END
$$;

-- Create function to update customer record when booking is created
CREATE OR REPLACE FUNCTION create_or_update_customer_from_booking()
RETURNS TRIGGER AS $$
DECLARE
    existing_user_id UUID;
    new_user_id UUID;
BEGIN
    -- Check if we already have a user with this email
    SELECT id INTO existing_user_id
    FROM users_core
    WHERE email = NEW.customer_email;
    
    IF existing_user_id IS NULL THEN
        -- Create new user record
        INSERT INTO users_core (
            id,
            email,
            first_name,
            last_name,
            phone,
            total_bookings,
            total_spent,
            last_booking_date,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            NEW.customer_email,
            SPLIT_PART(NEW.customer_name, ' ', 1),
            NULLIF(REGEXP_REPLACE(NEW.customer_name, '^[^ ]+ ', ''), ''),
            NEW.customer_phone,
            CASE WHEN NEW.status IN ('confirmed', 'completed') THEN 1 ELSE 0 END,
            CASE WHEN NEW.status IN ('confirmed', 'completed') THEN NEW.price ELSE 0 END,
            CASE WHEN NEW.status IN ('confirmed', 'completed') THEN NEW.start_date ELSE NULL END,
            NOW(),
            NOW()
        )
        RETURNING id INTO new_user_id;
        
        -- Link booking to new user
        NEW.user_id = new_user_id;
    ELSE
        -- Link booking to existing user
        NEW.user_id = existing_user_id;
        
        -- Statistics will be updated by the other trigger
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to create/update customer when booking is created
DO $$
BEGIN
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS trigger_create_customer_from_booking ON bookings;
    
    -- Create new trigger
    CREATE TRIGGER trigger_create_customer_from_booking
    BEFORE INSERT ON bookings
    FOR EACH ROW
    WHEN (NEW.user_id IS NULL)
    EXECUTE FUNCTION create_or_update_customer_from_booking();
END
$$;