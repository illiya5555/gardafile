/*
# Database Maintenance Schedule

1. Purpose
   - Establishes a regular maintenance schedule for the database
   - Automates routine maintenance tasks
   - Ensures optimal database performance

2. Features
   - Daily, weekly, and monthly maintenance tasks
   - Automatic statistics updates
   - Regular vacuum operations
   - Performance monitoring
*/

-- Create a function for daily maintenance
CREATE OR REPLACE FUNCTION perform_daily_maintenance()
RETURNS VOID AS $$
DECLARE
    tbl RECORD;
BEGIN
    RAISE NOTICE 'Starting daily maintenance at %', NOW();
    
    -- Update statistics for frequently modified tables
    FOR tbl IN
        SELECT table_name
        FROM database_monitoring
        WHERE rows_inserted + rows_updated + rows_deleted > 1000
    LOOP
        RAISE NOTICE 'Analyzing table %...', tbl.table_name;
        EXECUTE format('ANALYZE %I', tbl.table_name);
    END LOOP;
    
    -- Vacuum tables with high dead tuple ratios
    FOR tbl IN
        SELECT table_name
        FROM database_monitoring
        WHERE dead_row_percentage > 10
        ORDER BY dead_row_percentage DESC
        LIMIT 5
    LOOP
        RAISE NOTICE 'Vacuuming table %...', tbl.table_name;
        EXECUTE format('VACUUM %I', tbl.table_name);
    END LOOP;
    
    -- Update booking statistics materialized view
    REFRESH MATERIALIZED VIEW IF EXISTS booking_stats;
    
    RAISE NOTICE 'Daily maintenance completed at %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function for weekly maintenance
CREATE OR REPLACE FUNCTION perform_weekly_maintenance()
RETURNS VOID AS $$
DECLARE
    tbl RECORD;
BEGIN
    RAISE NOTICE 'Starting weekly maintenance at %', NOW();
    
    -- Analyze all tables
    FOR tbl IN
        SELECT table_name
        FROM database_monitoring
    LOOP
        RAISE NOTICE 'Analyzing table %...', tbl.table_name;
        EXECUTE format('ANALYZE %I', tbl.table_name);
    END LOOP;
    
    -- Vacuum all tables
    FOR tbl IN
        SELECT table_name
        FROM database_monitoring
        WHERE dead_row_percentage > 5
        ORDER BY dead_row_percentage DESC
    LOOP
        RAISE NOTICE 'Vacuuming table %...', tbl.table_name;
        EXECUTE format('VACUUM %I', tbl.table_name);
    END LOOP;
    
    -- Refresh all materialized views
    REFRESH MATERIALIZED VIEW IF EXISTS booking_stats;
    REFRESH MATERIALIZED VIEW IF EXISTS dashboard_stats;
    REFRESH MATERIALIZED VIEW IF EXISTS unified_dashboard_stats;
    
    RAISE NOTICE 'Weekly maintenance completed at %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function for monthly maintenance
CREATE OR REPLACE FUNCTION perform_monthly_maintenance()
RETURNS VOID AS $$
DECLARE
    tbl RECORD;
    idx RECORD;
BEGIN
    RAISE NOTICE 'Starting monthly maintenance at %', NOW();
    
    -- Full vacuum analyze on all tables
    FOR tbl IN
        SELECT table_name
        FROM database_monitoring
        ORDER BY estimated_row_count DESC
    LOOP
        RAISE NOTICE 'Full vacuum analyzing table %...', tbl.table_name;
        EXECUTE format('VACUUM ANALYZE %I', tbl.table_name);
    END LOOP;
    
    -- Reindex bloated indexes
    FOR idx IN
        SELECT table_name, index_name
        FROM analyze_index_usage()
        WHERE index_scans > 0
        ORDER BY table_name, index_name
    LOOP
        RAISE NOTICE 'Reindexing index % on table %...', idx.index_name, idx.table_name;
        EXECUTE format('REINDEX INDEX %I', idx.index_name);
    END LOOP;
    
    -- Run optimization procedure
    CALL optimize_database();
    
    RAISE NOTICE 'Monthly maintenance completed at %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to schedule maintenance
CREATE OR REPLACE FUNCTION schedule_maintenance()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if it's time for daily maintenance (every day at 3 AM)
    IF EXTRACT(HOUR FROM NEW.now) = 3 AND EXTRACT(MINUTE FROM NEW.now) BETWEEN 0 AND 5 THEN
        PERFORM perform_daily_maintenance();
    END IF;
    
    -- Check if it's time for weekly maintenance (Sunday at 4 AM)
    IF EXTRACT(DOW FROM NEW.now) = 0 AND EXTRACT(HOUR FROM NEW.now) = 4 AND EXTRACT(MINUTE FROM NEW.now) BETWEEN 0 AND 5 THEN
        PERFORM perform_weekly_maintenance();
    END IF;
    
    -- Check if it's time for monthly maintenance (1st of month at 2 AM)
    IF EXTRACT(DAY FROM NEW.now) = 1 AND EXTRACT(HOUR FROM NEW.now) = 2 AND EXTRACT(MINUTE FROM NEW.now) BETWEEN 0 AND 5 THEN
        PERFORM perform_monthly_maintenance();
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a table to track maintenance history
CREATE TABLE IF NOT EXISTS maintenance_history (
    id SERIAL PRIMARY KEY,
    maintenance_type TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    status TEXT,
    details TEXT
);

-- Create a procedure to run maintenance with logging
CREATE OR REPLACE PROCEDURE run_maintenance(maintenance_type TEXT) 
LANGUAGE plpgsql
AS $$
DECLARE
    start_time TIMESTAMPTZ;
    history_id INT;
BEGIN
    start_time := NOW();
    
    -- Log start of maintenance
    INSERT INTO maintenance_history (maintenance_type, start_time, status)
    VALUES (maintenance_type, start_time, 'Running')
    RETURNING id INTO history_id;
    
    BEGIN
        -- Run the appropriate maintenance function
        CASE maintenance_type
            WHEN 'daily' THEN
                PERFORM perform_daily_maintenance();
            WHEN 'weekly' THEN
                PERFORM perform_weekly_maintenance();
            WHEN 'monthly' THEN
                PERFORM perform_monthly_maintenance();
            ELSE
                RAISE EXCEPTION 'Unknown maintenance type: %', maintenance_type;
        END CASE;
        
        -- Log successful completion
        UPDATE maintenance_history
        SET end_time = NOW(),
            status = 'Completed',
            details = format('Maintenance completed successfully in %s', NOW() - start_time)
        WHERE id = history_id;
    EXCEPTION WHEN OTHERS THEN
        -- Log error
        UPDATE maintenance_history
        SET end_time = NOW(),
            status = 'Failed',
            details = format('Error: %s', SQLERRM)
        WHERE id = history_id;
        
        RAISE;
    END;
END;
$$;

-- To manually run maintenance:
-- CALL run_maintenance('daily');
-- CALL run_maintenance('weekly');
-- CALL run_maintenance('monthly');