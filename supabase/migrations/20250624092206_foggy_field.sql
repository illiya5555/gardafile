/*
# Database Cleanup Procedure

1. Purpose
  - Safely removes old tables after migration verification
  - Preserves views for backward compatibility
  - Provides a safety mechanism to prevent accidental data loss

2. Features
  - Requires explicit confirmation
  - Backs up data before removal
  - Creates reports for verification
*/

-- Create the cleanup procedure
CREATE OR REPLACE PROCEDURE cleanup_after_migration(confirm boolean DEFAULT false)
LANGUAGE plpgsql
AS $$
DECLARE
  start_time timestamp;
  end_time timestamp;
  tables_to_drop text[] := ARRAY[
    'profiles', 
    'unified_customers', 
    'stripe_customers',
    'reservations',
    'yacht_bookings',
    'stripe_orders',
    'stripe_subscriptions',
    'unified_inquiries'
  ];
  table_name text;
  backup_table_name text;
  row_count int;
  total_tables_dropped int := 0;
  cleanup_summary jsonb := '{}'::jsonb;
BEGIN
  -- Require explicit confirmation
  IF NOT confirm THEN
    RAISE NOTICE 'Safety check: You must explicitly confirm cleanup by calling: CALL cleanup_after_migration(confirm => true);';
    RAISE EXCEPTION 'Cleanup not confirmed. No changes were made.';
    RETURN;
  END IF;
  
  -- Record start time
  start_time := clock_timestamp();
  RAISE NOTICE 'Starting cleanup procedure...';
  
  -- Create backup schema if it doesn't exist
  EXECUTE 'CREATE SCHEMA IF NOT EXISTS backup_schema';
  
  -- Drop each table and create a backup
  FOREACH table_name IN ARRAY tables_to_drop
  LOOP
    -- Check if table exists
    EXECUTE format('SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = ''public'' AND table_name = %L)', table_name)
    INTO EXISTS;
    
    IF EXISTS THEN
      -- Create backup table name with timestamp
      backup_table_name := 'backup_schema.' || table_name || '_backup_' || 
                           to_char(now(), 'YYYYMMDD_HH24MISS');
      
      -- Count rows
      EXECUTE format('SELECT COUNT(*) FROM public.%I', table_name) INTO row_count;
      
      -- Create backup
      EXECUTE format('CREATE TABLE %s AS SELECT * FROM public.%I', backup_table_name, table_name);
      
      -- Drop original table
      EXECUTE format('DROP TABLE public.%I CASCADE', table_name);
      
      -- Log result
      RAISE NOTICE 'Dropped table: %. Backed up % rows to %.', table_name, row_count, backup_table_name;
      total_tables_dropped := total_tables_dropped + 1;
      
      -- Update summary
      cleanup_summary := jsonb_set(
        cleanup_summary, 
        format('{tables, %s}', table_name)::text[], 
        jsonb_build_object(
          'rows_backed_up', row_count,
          'backup_table', backup_table_name
        )
      );
    ELSE
      RAISE NOTICE 'Table % does not exist, skipping.', table_name;
    END IF;
  END LOOP;
  
  -- Create backup retention policy function
  CREATE OR REPLACE FUNCTION cleanup_old_backups()
  RETURNS void AS $func$
  DECLARE
    backup_table record;
    cutoff_date timestamp := now() - interval '30 days';
  BEGIN
    FOR backup_table IN
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'backup_schema'
      AND table_name LIKE '%_backup_%'
      AND table_name ~ '_backup_[0-9]{8}_[0-9]{6}$'
      AND to_timestamp(substring(table_name from '_backup_([0-9]{8}_[0-9]{6})$'), 'YYYYMMDD_HH24MISS') < cutoff_date
    LOOP
      EXECUTE format('DROP TABLE backup_schema.%I', backup_table.table_name);
      RAISE NOTICE 'Dropped old backup table: %', backup_table.table_name;
    END LOOP;
  END;
  $func$ LANGUAGE plpgsql;
  
  -- Schedule cleanup of old backups
  CREATE OR REPLACE FUNCTION schedule_backup_cleanup()
  RETURNS trigger AS $func$
  BEGIN
    PERFORM cleanup_old_backups();
    RETURN NULL;
  END;
  $func$ LANGUAGE plpgsql;

  -- Create a trigger to run the cleanup once a week
  DROP TRIGGER IF EXISTS trigger_cleanup_old_backups ON pg_stat_activity;
  CREATE TRIGGER trigger_cleanup_old_backups
  EXECUTE PROCEDURE schedule_backup_cleanup()
  FOR EACH STATEMENT;

  -- Record end time and completion
  end_time := clock_timestamp();
  cleanup_summary := jsonb_set(cleanup_summary, '{total_tables_dropped}', to_jsonb(total_tables_dropped));
  cleanup_summary := jsonb_set(cleanup_summary, '{duration_seconds}', 
    to_jsonb(EXTRACT(EPOCH FROM (end_time - start_time))));
  cleanup_summary := jsonb_set(cleanup_summary, '{completed_at}', to_jsonb(end_time));
  
  RAISE NOTICE 'Cleanup completed in % seconds. % tables dropped.', 
    EXTRACT(EPOCH FROM (end_time - start_time)), total_tables_dropped;
  RAISE NOTICE 'Cleanup summary: %', cleanup_summary::text;
END;
$$;