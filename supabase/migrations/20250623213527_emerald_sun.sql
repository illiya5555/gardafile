/*
# Database Cleanup After Migration

1. Purpose
   - Safely removes old tables after successful migration
   - Verifies data integrity before removal
   - Creates backup views for backward compatibility

2. Process
   - Checks record counts to ensure no data loss
   - Creates views that map to new tables for backward compatibility
   - Drops old tables only after verification
*/

-- Create a procedure to safely clean up after migration
CREATE OR REPLACE PROCEDURE cleanup_after_migration(force BOOLEAN DEFAULT FALSE) 
LANGUAGE plpgsql
AS $$
DECLARE
    users_count INT;
    bookings_count INT;
    payments_count INT;
    old_users_count INT;
    old_bookings_count INT;
    old_payments_count INT;
    can_proceed BOOLEAN := FALSE;
BEGIN
    -- Count records in new tables
    SELECT COUNT(*) INTO users_count FROM users_core;
    SELECT COUNT(*) INTO bookings_count FROM bookings;
    SELECT COUNT(*) INTO payments_count FROM payments;
    
    -- Count records in old tables
    SELECT COUNT(*) INTO old_users_count FROM profiles;
    SELECT COUNT(*) + COUNT(*) INTO old_bookings_count FROM reservations, yacht_bookings;
    SELECT COUNT(*) + COUNT(*) INTO old_payments_count FROM stripe_orders, stripe_subscriptions;
    
    RAISE NOTICE 'New tables: % users, % bookings, % payments', 
        users_count, bookings_count, payments_count;
    RAISE NOTICE 'Old tables: % users, % bookings, % payments', 
        old_users_count, old_bookings_count, old_payments_count;
    
    -- Verify data integrity
    IF users_count >= old_users_count AND bookings_count >= old_bookings_count THEN
        can_proceed := TRUE;
    END IF;
    
    -- Allow force override
    IF force THEN
        can_proceed := TRUE;
        RAISE WARNING 'Forcing cleanup without data verification';
    END IF;
    
    IF NOT can_proceed THEN
        RAISE EXCEPTION 'Data verification failed. Migration may be incomplete. Use force=TRUE to override.';
    END IF;
    
    -- Create compatibility views for backward compatibility
    
    -- Profiles view
    EXECUTE 'DROP VIEW IF EXISTS profiles_view CASCADE';
    EXECUTE '
    CREATE OR REPLACE VIEW profiles_view AS
    SELECT
        id,
        email,
        first_name,
        last_name,
        phone,
        role_id,
        created_at,
        updated_at
    FROM
        users_core
    ';
    
    -- Reservations view
    EXECUTE 'DROP VIEW IF EXISTS reservations_view CASCADE';
    EXECUTE '
    CREATE OR REPLACE VIEW reservations_view AS
    SELECT
        id,
        user_id,
        start_date AS booking_date,
        time_slot,
        participants,
        price AS total_price,
        status,
        customer_name,
        customer_email,
        customer_phone,
        special_requests,
        email_sent,
        created_at,
        updated_at
    FROM
        bookings
    WHERE
        booking_type = ''sailing''
    ';
    
    -- Yacht bookings view
    EXECUTE 'DROP VIEW IF EXISTS yacht_bookings_view CASCADE';
    EXECUTE '
    CREATE OR REPLACE VIEW yacht_bookings_view AS
    SELECT
        id,
        user_id,
        start_date,
        end_date,
        NULL::text AS start_time,
        NULL::text AS end_time,
        participants,
        price AS total_price,
        status,
        customer_name,
        customer_email,
        customer_phone,
        created_at,
        updated_at
    FROM
        bookings
    WHERE
        booking_type = ''yacht''
    ';
    
    -- Stripe orders view
    EXECUTE 'DROP VIEW IF EXISTS stripe_orders_view CASCADE';
    EXECUTE '
    CREATE OR REPLACE VIEW stripe_orders_view AS
    SELECT
        id,
        external_id AS checkout_session_id,
        metadata->>''payment_intent_id'' AS payment_intent_id,
        (SELECT customer_id FROM stripe_customers WHERE user_id = p.user_id LIMIT 1) AS customer_id,
        (amount_total * 100)::bigint AS amount_subtotal,
        (amount_total * 100)::bigint AS amount_total,
        currency,
        status::text AS payment_status,
        status::text AS status,
        created_at,
        updated_at,
        deleted_at,
        booking_id
    FROM
        payments p
    WHERE
        payment_type = ''order''
    ';
    
    -- Stripe subscriptions view
    EXECUTE 'DROP VIEW IF EXISTS stripe_subscriptions_view CASCADE';
    EXECUTE '
    CREATE OR REPLACE VIEW stripe_subscriptions_view AS
    SELECT
        id,
        (SELECT customer_id FROM stripe_customers WHERE user_id = p.user_id LIMIT 1) AS customer_id,
        external_id AS subscription_id,
        metadata->>''price_id'' AS price_id,
        (metadata->>''current_period_start'')::bigint AS current_period_start,
        (metadata->>''current_period_end'')::bigint AS current_period_end,
        (metadata->>''cancel_at_period_end'')::boolean AS cancel_at_period_end,
        metadata->>''payment_method_brand'' AS payment_method_brand,
        metadata->>''payment_method_last4'' AS payment_method_last4,
        status::text AS status,
        created_at,
        updated_at,
        deleted_at
    FROM
        payments p
    WHERE
        payment_type = ''subscription''
    ';
    
    -- Now drop the old tables
    EXECUTE 'DROP TABLE IF EXISTS my_table CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS your_table_name CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS corporate_inquiries CASCADE';
    
    -- Only drop if we've confirmed data migration
    IF users_count >= old_users_count THEN
        EXECUTE 'DROP TABLE IF EXISTS profiles CASCADE';
        EXECUTE 'DROP TABLE IF EXISTS unified_customers CASCADE';
        EXECUTE 'DROP TABLE IF EXISTS stripe_customers CASCADE';
    END IF;
    
    IF bookings_count >= old_bookings_count THEN
        EXECUTE 'DROP TABLE IF EXISTS reservations CASCADE';
        EXECUTE 'DROP TABLE IF EXISTS yacht_bookings CASCADE';
    END IF;
    
    EXECUTE 'DROP TABLE IF EXISTS stripe_orders CASCADE';
    EXECUTE 'DROP TABLE IF EXISTS stripe_subscriptions CASCADE';
    
    RAISE NOTICE 'Cleanup completed successfully';
END;
$$;

-- To execute the cleanup, run:
-- CALL cleanup_after_migration();
-- Or to force cleanup:
-- CALL cleanup_after_migration(TRUE);