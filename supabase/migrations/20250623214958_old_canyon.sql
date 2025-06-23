/*
  # Database Optimizer Function

  1. Purpose
     - Automatically optimizes database performance
     - Creates missing indexes on frequently queried columns
     - Adds constraints for data integrity
     - Performs maintenance operations

  2. Features
     - Identifies and creates missing indexes
     - Adds appropriate constraints
     - Performs VACUUM and ANALYZE operations
     - Updates table statistics
*/

-- Create a function to identify and create missing indexes
CREATE OR REPLACE FUNCTION create_missing_indexes()
RETURNS TABLE (
    table_name TEXT,
    column_name TEXT,
    index_name TEXT,
    index_created BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    missing_index RECORD;
    index_name TEXT;
    success BOOLEAN;
    error_text TEXT;
BEGIN
    FOR missing_index IN
        SELECT 
            s.relname AS table_name,
            a.attname AS column_name,
            s.seq_scan AS sequential_scans,
            s.seq_tup_read AS rows_read_seq
        FROM 
            pg_stat_user_tables s
        JOIN 
            pg_attribute a ON a.attrelid = s.relname::regclass
        JOIN 
            pg_type ty ON ty.oid = a.atttypid
        WHERE 
            a.attnum > 0 AND 
            NOT a.attisdropped AND
            s.seq_scan > 10 AND
            s.seq_tup_read > 1000 AND
            NOT EXISTS (
                SELECT 1
                FROM pg_index i
                JOIN pg_attribute ia ON ia.attrelid = i.indrelid AND ia.attnum = ANY(i.indkey)
                WHERE i.indrelid = s.relname::regclass AND ia.attname = a.attname
            ) AND
            -- Only consider columns that are likely to benefit from indexing
            (
                a.attname LIKE '%\_id' OR 
                a.attname = 'id' OR
                a.attname LIKE '%date%' OR 
                a.attname LIKE '%time%' OR
                a.attname LIKE '%email%' OR
                a.attname LIKE '%name%' OR
                a.attname LIKE '%status%' OR
                a.attname LIKE '%type%'
            )
        ORDER BY s.seq_scan * s.seq_tup_read DESC
        LIMIT 10
    LOOP
        -- Generate index name
        index_name := format('idx_%s_%s', missing_index.table_name, missing_index.column_name);
        
        -- Try to create the index
        BEGIN
            -- Check if index already exists with a different name
            IF NOT EXISTS (
                SELECT 1
                FROM pg_index i
                JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
                WHERE 
                    i.indrelid = missing_index.table_name::regclass AND 
                    a.attname = missing_index.column_name
            ) THEN
                -- Create the index
                EXECUTE format('CREATE INDEX %I ON %I(%I)', 
                              index_name, missing_index.table_name, missing_index.column_name);
                success := TRUE;
                error_text := NULL;
            ELSE
                success := FALSE;
                error_text := 'Index already exists with a different name';
            END IF;
        EXCEPTION WHEN OTHERS THEN
            success := FALSE;
            error_text := SQLERRM;
        END;
        
        -- Return the result
        table_name := missing_index.table_name;
        column_name := missing_index.column_name;
        index_created := success;
        error_message := error_text;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to add missing constraints
CREATE OR REPLACE FUNCTION add_missing_constraints()
RETURNS TABLE (
    table_name TEXT,
    column_name TEXT,
    constraint_name TEXT,
    constraint_created BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    missing_constraint RECORD;
    constraint_name TEXT;
    constraint_def TEXT;
    success BOOLEAN;
    error_text TEXT;
BEGIN
    -- Check for email columns without validation
    FOR missing_constraint IN
        SELECT 
            t.table_name,
            c.column_name
        FROM 
            information_schema.tables t
        JOIN 
            information_schema.columns c ON c.table_name = t.table_name
        WHERE 
            t.table_schema = 'public' AND
            t.table_type = 'BASE TABLE' AND
            c.column_name = 'email' AND
            NOT EXISTS (
                SELECT 1 FROM information_schema.check_constraints cc
                JOIN information_schema.constraint_column_usage ccu 
                    ON cc.constraint_name = ccu.constraint_name
                WHERE ccu.table_name = t.table_name AND ccu.column_name = c.column_name
                    AND cc.check_clause LIKE '%@%'
            )
    LOOP
        -- Generate constraint name and definition
        constraint_name := format('%s_email_check', missing_constraint.table_name);
        constraint_def := format('ALTER TABLE %I ADD CONSTRAINT %I CHECK (email ~* ''^[A-Za-z0-9._%%-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'');', 
                                missing_constraint.table_name, constraint_name);
        
        -- Try to create the constraint
        BEGIN
            EXECUTE constraint_def;
            success := TRUE;
            error_text := NULL;
        EXCEPTION WHEN OTHERS THEN
            success := FALSE;
            error_text := SQLERRM;
        END;
        
        -- Return the result
        table_name := missing_constraint.table_name;
        column_name := missing_constraint.column_name;
        constraint_created := success;
        error_message := error_text;
        RETURN NEXT;
    END LOOP;
    
    -- Check for price columns without minimum value constraint
    FOR missing_constraint IN
        SELECT 
            t.table_name,
            c.column_name
        FROM 
            information_schema.tables t
        JOIN 
            information_schema.columns c ON c.table_name = t.table_name
        WHERE 
            t.table_schema = 'public' AND
            t.table_type = 'BASE TABLE' AND
            (c.column_name LIKE '%price%' OR c.column_name = 'price') AND 
            c.data_type LIKE '%numeric%' AND
            NOT EXISTS (
                SELECT 1 FROM information_schema.check_constraints cc
                JOIN information_schema.constraint_column_usage ccu 
                    ON cc.constraint_name = ccu.constraint_name
                WHERE ccu.table_name = t.table_name AND ccu.column_name = c.column_name
                    AND cc.check_clause LIKE '%>=%'
            )
    LOOP
        -- Generate constraint name and definition
        constraint_name := format('%s_%s_check', missing_constraint.table_name, missing_constraint.column_name);
        constraint_def := format('ALTER TABLE %I ADD CONSTRAINT %I CHECK (%I >= 0);', 
                                missing_constraint.table_name, constraint_name, missing_constraint.column_name);
        
        -- Try to create the constraint
        BEGIN
            EXECUTE constraint_def;
            success := TRUE;
            error_text := NULL;
        EXCEPTION WHEN OTHERS THEN
            success := FALSE;
            error_text := SQLERRM;
        END;
        
        -- Return the result
        table_name := missing_constraint.table_name;
        column_name := missing_constraint.column_name;
        constraint_created := success;
        error_message := error_text;
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a procedure to optimize the database
CREATE OR REPLACE PROCEDURE optimize_database() 
LANGUAGE plpgsql
AS $$
DECLARE
    index_result RECORD;
    constraint_result RECORD;
    index_count INT := 0;
    constraint_count INT := 0;
    vacuum_count INT := 0;
    analyze_count INT := 0;
BEGIN
    -- Create missing indexes
    FOR index_result IN
        SELECT * FROM create_missing_indexes()
    LOOP
        IF index_result.index_created THEN
            index_count := index_count + 1;
            RAISE NOTICE 'Created index % on %.%', 
                index_result.index_name, index_result.table_name, index_result.column_name;
        ELSE
            RAISE NOTICE 'Failed to create index on %.%: %', 
                index_result.table_name, index_result.column_name, index_result.error_message;
        END IF;
    END LOOP;
    
    -- Add missing constraints
    FOR constraint_result IN
        SELECT * FROM add_missing_constraints()
    LOOP
        IF constraint_result.constraint_created THEN
            constraint_count := constraint_count + 1;
            RAISE NOTICE 'Added constraint % to %.%', 
                constraint_result.constraint_name, constraint_result.table_name, constraint_result.column_name;
        ELSE
            RAISE NOTICE 'Failed to add constraint to %.%: %', 
                constraint_result.table_name, constraint_result.column_name, constraint_result.error_message;
        END IF;
    END LOOP;
    
    -- Vacuum tables with high dead tuple ratios
    DECLARE
        tbl RECORD;
    BEGIN
        FOR tbl IN
            SELECT s.relname
            FROM pg_stat_user_tables s
            WHERE s.n_dead_tup > 1000 OR (s.n_live_tup > 0 AND s.n_dead_tup::FLOAT / s.n_live_tup > 0.1)
            ORDER BY s.n_dead_tup::FLOAT / NULLIF(s.n_live_tup, 0) DESC
            LIMIT 5
        LOOP
            BEGIN
                RAISE NOTICE 'Vacuuming table %...', tbl.relname;
                EXECUTE format('VACUUM ANALYZE %I', tbl.relname);
                vacuum_count := vacuum_count + 1;
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING 'Failed to vacuum table %: %', tbl.relname, SQLERRM;
            END;
        END LOOP;
    END;
    
    -- Analyze tables with outdated statistics
    DECLARE
        tbl RECORD;
    BEGIN
        FOR tbl IN
            SELECT s.relname
            FROM pg_stat_user_tables s
            WHERE s.last_analyze IS NULL OR s.last_analyze < now() - interval '7 days'
            ORDER BY s.last_analyze ASC NULLS FIRST
            LIMIT 5
        LOOP
            BEGIN
                RAISE NOTICE 'Analyzing table %...', tbl.relname;
                EXECUTE format('ANALYZE %I', tbl.relname);
                analyze_count := analyze_count + 1;
            EXCEPTION WHEN OTHERS THEN
                RAISE WARNING 'Failed to analyze table %: %', tbl.relname, SQLERRM;
            END;
        END LOOP;
    END;
    
    -- Refresh materialized views if they exist
    BEGIN
        IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'dashboard_stats') THEN
            REFRESH MATERIALIZED VIEW dashboard_stats;
            RAISE NOTICE 'Refreshed dashboard_stats materialized view';
        END IF;
        
        IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'unified_dashboard_stats') THEN
            REFRESH MATERIALIZED VIEW unified_dashboard_stats;
            RAISE NOTICE 'Refreshed unified_dashboard_stats materialized view';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to refresh materialized views: %', SQLERRM;
    END;
    
    RAISE NOTICE 'Database optimization complete: % indexes created, % constraints added, % tables vacuumed, % tables analyzed', 
        index_count, constraint_count, vacuum_count, analyze_count;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_missing_indexes() TO authenticated;
GRANT EXECUTE ON FUNCTION add_missing_constraints() TO authenticated;
GRANT EXECUTE ON PROCEDURE optimize_database() TO authenticated;

-- Return a message to confirm successful creation
SELECT 'Database optimizer functions created successfully' AS result;