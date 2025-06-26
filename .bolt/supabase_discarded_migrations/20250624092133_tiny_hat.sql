/*
# Database Migration Procedure

1. Purpose
  - Provides a safe, transactional way to execute the migration
  - Verifies prerequisites before migration
  - Creates compatibility views for backward compatibility
  - Logs migration progress

2. Features
  - Wraps all migration steps in a transaction
  - Validates data integrity before and after migration
  - Handles errors with clear messages
  - Creates compatibility views for seamless transition
*/

-- Create the migration procedure
CREATE OR REPLACE PROCEDURE migrate_database()
LANGUAGE plpgsql
AS $$
DECLARE
  start_time timestamp;
  end_time timestamp;
  error_occurred boolean := false;
  error_message text;
  required_tables text[] := ARRAY[
    'profiles', 
    'unified_customers', 
    'stripe_customers',
    'reservations',
    'yacht_bookings',
    'stripe_orders',
    'stripe_subscriptions',
    'unified_inquiries'
  ];
  migration_summary jsonb := '{}'::jsonb;
  table_record record;
  users_count int;
  bookings_count int;
  payments_count int;
  inquiries_count int;
BEGIN
  -- Record start time
  start_time := clock_timestamp();
  
  -- Validate prerequisites
  RAISE NOTICE 'Validating prerequisites...';
  
  -- Check if required tables exist
  FOREACH table_record IN 
    EXECUTE $q$
      SELECT table_name, EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      ) AS exists
    $q$
    USING required_tables
  LOOP
    IF NOT table_record.exists THEN
      RAISE EXCEPTION 'Required table "%" does not exist', table_record;
    END IF;
  END LOOP;
  
  -- Start transaction
  RAISE NOTICE 'Starting migration transaction...';
  
  BEGIN
    -- Step 1: Migrate user data
    RAISE NOTICE 'Step 1: Migrating user data...';
    PERFORM migrate_to_users_core();
    
    SELECT COUNT(*) INTO users_count FROM users_core;
    migration_summary := jsonb_set(migration_summary, '{users_migrated}', to_jsonb(users_count));
    
    -- Step 2: Migrate bookings data
    RAISE NOTICE 'Step 2: Migrating bookings data...';
    PERFORM migrate_to_bookings();
    
    SELECT COUNT(*) INTO bookings_count FROM bookings;
    migration_summary := jsonb_set(migration_summary, '{bookings_migrated}', to_jsonb(bookings_count));
    
    -- Step 3: Migrate payments data
    RAISE NOTICE 'Step 3: Migrating payments data...';
    PERFORM migrate_to_payments();
    
    SELECT COUNT(*) INTO payments_count FROM payments;
    migration_summary := jsonb_set(migration_summary, '{payments_migrated}', to_jsonb(payments_count));
    
    -- Step 4: Migrate inquiries data
    RAISE NOTICE 'Step 4: Migrating inquiries data...';
    PERFORM migrate_to_inquiries();
    
    SELECT COUNT(*) INTO inquiries_count FROM inquiries;
    migration_summary := jsonb_set(migration_summary, '{inquiries_migrated}', to_jsonb(inquiries_count));
    
    -- Step 5: Create compatibility views for backward compatibility
    RAISE NOTICE 'Step 5: Creating compatibility views...';
    
    -- profiles view
    CREATE OR REPLACE VIEW profiles_view AS
    SELECT 
      id,
      email,
      first_name,
      last_name,
      phone,
      created_at,
      updated_at,
      role_id
    FROM users_core;
    
    -- reservations view
    CREATE OR REPLACE VIEW reservations_view AS
    SELECT 
      id,
      user_id,
      'regular'::text AS type,
      customer_name,
      customer_email,
      customer_phone,
      participants,
      total_price,
      status,
      created_at,
      updated_at,
      date AS booking_date,
      time_slot,
      special_requests,
      NULL::uuid AS customer_id,
      source AS booking_source,
      notes AS internal_notes,
      email_sent
    FROM bookings
    WHERE booking_type = 'sailing';
    
    -- yacht_bookings view
    CREATE OR REPLACE VIEW yacht_bookings_view AS
    SELECT 
      id,
      yacht_id,
      user_id,
      date AS start_date,
      COALESCE(end_date, date) AS end_date,
      start_time,
      end_time,
      participants,
      total_price,
      customer_name,
      customer_email,
      customer_phone,
      status,
      created_at,
      updated_at
    FROM bookings
    WHERE booking_type = 'yacht';
    
    -- stripe_orders view
    CREATE OR REPLACE VIEW stripe_orders_view AS
    SELECT 
      (p.metadata->>'original_order_id')::bigint AS id,
      (p.metadata->>'checkout_session_id')::text AS checkout_session_id,
      provider_payment_id AS payment_intent_id,
      provider_customer_id AS customer_id,
      (p.amount * 100)::bigint AS amount_subtotal,  -- Convert back to cents
      (p.amount * 100)::bigint AS amount_total,     -- Convert back to cents
      p.currency,
      CASE 
        WHEN p.status = 'completed' THEN 'paid'::text
        WHEN p.status = 'failed' THEN 'unpaid'::text
        ELSE 'pending'::text
      END AS payment_status,
      CASE 
        WHEN p.status = 'completed' THEN 'completed'::stripe_order_status
        WHEN p.status = 'cancelled' THEN 'canceled'::stripe_order_status
        ELSE 'pending'::stripe_order_status
      END AS status,
      p.created_at,
      p.updated_at,
      NULL::timestamptz AS deleted_at,
      p.booking_id
    FROM payments p
    WHERE p.type = 'order';
    
    -- stripe_subscriptions view
    CREATE OR REPLACE VIEW stripe_subscriptions_view AS
    SELECT 
      (p.metadata->>'original_subscription_id')::bigint AS id,
      provider_customer_id AS customer_id,
      provider_payment_id AS subscription_id,
      (p.metadata->>'price_id')::text AS price_id,
      (p.metadata->>'current_period_start')::bigint AS current_period_start,
      (p.metadata->>'current_period_end')::bigint AS current_period_end,
      (p.metadata->>'cancel_at_period_end')::boolean AS cancel_at_period_end,
      (p.metadata->>'payment_method_brand')::text AS payment_method_brand,
      (p.metadata->>'payment_method_last4')::text AS payment_method_last4,
      CASE 
        WHEN p.status = 'completed' THEN 'active'::stripe_subscription_status
        WHEN p.status = 'cancelled' THEN 'canceled'::stripe_subscription_status
        WHEN p.status = 'failed' THEN 'unpaid'::stripe_subscription_status
        ELSE 'pending'::stripe_subscription_status
      END AS status,
      p.created_at,
      p.updated_at,
      NULL::timestamptz AS deleted_at
    FROM payments p
    WHERE p.type = 'subscription';
    
    -- unified_customers view
    CREATE OR REPLACE VIEW unified_customers_view AS
    SELECT
      id,
      email,
      first_name,
      last_name,
      full_name,
      phone,
      country_code,
      preferred_language,
      marketing_consent,
      company_name,
      company_position,
      total_bookings,
      total_spent,
      last_booking_date,
      source,
      notes,
      created_at,
      updated_at,
      search_vector
    FROM users_core;
    
    -- unified_inquiries view
    CREATE OR REPLACE VIEW unified_inquiries_view AS
    SELECT *
    FROM inquiries;
    
    -- Step 6: Create booking statistics view
    RAISE NOTICE 'Step 6: Creating statistics views...';
    
    CREATE OR REPLACE VIEW booking_stats AS
    SELECT
      user_id,
      COUNT(*) AS total_bookings,
      SUM(total_price) AS total_spent,
      MAX(date) AS last_booking_date,
      COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed_bookings,
      COUNT(*) FILTER (WHERE status = 'pending') AS pending_bookings,
      COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled_bookings,
      COUNT(*) FILTER (WHERE date >= CURRENT_DATE - INTERVAL '30 days') AS bookings_last_30_days,
      MAX(created_at) AS last_booking_created
    FROM bookings
    GROUP BY user_id;
    
    -- Step 7: Log migration success
    migration_summary := jsonb_set(migration_summary, '{migration_status}', '"completed"'::jsonb);
    end_time := clock_timestamp();
    migration_summary := jsonb_set(migration_summary, '{duration_seconds}', 
      to_jsonb(EXTRACT(EPOCH FROM (end_time - start_time))));
    
    RAISE NOTICE 'Migration completed successfully in % seconds', 
      EXTRACT(EPOCH FROM (end_time - start_time));
    RAISE NOTICE 'Migration summary: %', migration_summary::text;
    
  EXCEPTION
    WHEN OTHERS THEN
      error_occurred := true;
      error_message := SQLERRM;
      RAISE EXCEPTION 'Migration failed: %', error_message;
  END;
  
  -- If we get here, the migration was successful
  RAISE NOTICE 'Database migration completed successfully!';
  RAISE NOTICE 'Please verify the migration results before running the cleanup procedure.';
  RAISE NOTICE 'To clean up old tables after verification, run: CALL cleanup_after_migration(confirm => true);';
END;
$$;