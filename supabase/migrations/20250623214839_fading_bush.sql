/*
  # Database Analyzer Function

  1. Purpose
     - Analyzes database structure and provides optimization recommendations
     - Identifies tables that could benefit from indexing
     - Suggests schema improvements
     - Detects potential performance issues

  2. Features
     - Table analysis (size, row count, bloat)
     - Index analysis (usage, size, redundancy)
     - Query performance analysis
     - Schema optimization suggestions
*/

-- Create a function to analyze the database and provide recommendations
CREATE OR REPLACE FUNCTION analyze_database()
RETURNS TABLE (
    category TEXT,
    object_name TEXT,
    issue TEXT,
    recommendation TEXT,
    priority TEXT
) AS $$
DECLARE
    tbl RECORD;
    idx RECORD;
    col RECORD;
    fk RECORD;
    missing_index RECORD;
    large_table RECORD;
    unused_index RECORD;
    missing_constraint RECORD;
BEGIN
    -- Check for tables without primary keys
    FOR tbl IN
        SELECT t.table_name
        FROM information_schema.tables t
        LEFT JOIN information_schema.table_constraints tc ON 
            tc.table_name = t.table_name AND 
            tc.constraint_type = 'PRIMARY KEY' AND
            tc.table_schema = t.table_schema
        WHERE 
            t.table_schema = 'public' AND 
            t.table_type = 'BASE TABLE' AND
            tc.constraint_name IS NULL
    LOOP
        category := 'Schema';
        object_name := tbl.table_name;
        issue := 'Missing primary key';
        recommendation := format('Add a primary key to table %I', tbl.table_name);
        priority := 'High';
        RETURN NEXT;
    END LOOP;

    -- Check for columns frequently used in WHERE clauses without indexes
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
            NOT EXISTS (
                SELECT 1
                FROM pg_index i
                JOIN pg_attribute ia ON ia.attrelid = i.indrelid AND ia.attnum = ANY(i.indkey)
                WHERE i.indrelid = s.relname::regclass AND ia.attname = a.attname
            )
        ORDER BY s.seq_scan * s.seq_tup_read DESC
        LIMIT 5
    LOOP
        category := 'Performance';
        object_name := format('%s.%s', missing_index.table_name, missing_index.column_name);
        issue := format('Frequently queried column without index (%s sequential scans)', missing_index.sequential_scans);
        recommendation := format('CREATE INDEX idx_%s_%s ON %I(%I);', 
                                missing_index.table_name, missing_index.column_name, 
                                missing_index.table_name, missing_index.column_name);
        priority := 'Medium';
        RETURN NEXT;
    END LOOP;

    -- Check for large tables without partitioning
    FOR large_table IN
        SELECT 
            c.relname AS table_name,
            c.reltuples AS row_count,
            pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size
        FROM 
            pg_class c
        JOIN 
            pg_namespace n ON n.oid = c.relnamespace
        WHERE 
            n.nspname = 'public' AND
            c.relkind = 'r' AND
            c.reltuples > 1000000
        ORDER BY 
            c.reltuples DESC
        LIMIT 3
    LOOP
        category := 'Performance';
        object_name := large_table.table_name;
        issue := format('Large table (%s rows, %s) without partitioning', 
                       large_table.row_count, large_table.total_size);
        recommendation := 'Consider partitioning this table by date or another appropriate column';
        priority := 'Medium';
        RETURN NEXT;
    END LOOP;

    -- Check for unused indexes
    FOR unused_index IN
        SELECT 
            s.relname AS table_name,
            i.indexrelname AS index_name,
            pg_size_pretty(pg_relation_size(i.indexrelid)) AS index_size,
            i.idx_scan AS index_scans
        FROM 
            pg_stat_user_indexes i
        JOIN 
            pg_stat_user_tables s ON i.relname = s.relname
        WHERE 
            i.idx_scan = 0 AND
            NOT EXISTS (
                SELECT 1
                FROM pg_constraint c
                WHERE c.conindid = i.indexrelid AND c.contype IN ('p', 'u')
            )
        ORDER BY 
            pg_relation_size(i.indexrelid) DESC
        LIMIT 5
    LOOP
        category := 'Performance';
        object_name := format('%s.%s', unused_index.table_name, unused_index.index_name);
        issue := format('Unused index (%s size, 0 scans)', unused_index.index_size);
        recommendation := format('Consider dropping: DROP INDEX %I;', unused_index.index_name);
        priority := 'Low';
        RETURN NEXT;
    END LOOP;

    -- Check for foreign keys without indexes
    FOR fk IN
        SELECT 
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM 
            information_schema.table_constraints AS tc 
        JOIN 
            information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
        JOIN 
            information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
        WHERE 
            tc.constraint_type = 'FOREIGN KEY' AND
            tc.table_schema = 'public' AND
            NOT EXISTS (
                SELECT 1
                FROM pg_index i
                JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
                WHERE i.indrelid = tc.table_name::regclass AND a.attname = kcu.column_name
            )
    LOOP
        category := 'Performance';
        object_name := format('%s.%s', fk.table_name, fk.column_name);
        issue := 'Foreign key without index';
        recommendation := format('CREATE INDEX idx_%s_%s ON %I(%I);', 
                                fk.table_name, fk.column_name, fk.table_name, fk.column_name);
        priority := 'Medium';
        RETURN NEXT;
    END LOOP;

    -- Check for tables without statistics
    FOR tbl IN
        SELECT 
            c.relname AS table_name
        FROM 
            pg_class c
        JOIN 
            pg_namespace n ON n.oid = c.relnamespace
        LEFT JOIN 
            pg_stat_user_tables s ON c.relname = s.relname
        WHERE 
            n.nspname = 'public' AND
            c.relkind = 'r' AND
            (s.last_analyze IS NULL OR s.last_analyze < now() - interval '7 days')
        ORDER BY 
            c.reltuples DESC
        LIMIT 5
    LOOP
        category := 'Maintenance';
        object_name := tbl.table_name;
        issue := 'Table statistics are outdated or missing';
        recommendation := format('ANALYZE %I;', tbl.table_name);
        priority := 'Low';
        RETURN NEXT;
    END LOOP;

    -- Check for tables with high bloat
    FOR tbl IN
        SELECT 
            c.relname AS table_name,
            CASE
                WHEN c.reltuples > 0 THEN
                    ROUND(100 * (c.relpages - CEIL(c.reltuples / (c.relpages / NULLIF(c.relpages, 0)))) / c.relpages, 2)
                ELSE 0
            END AS bloat_percentage
        FROM 
            pg_class c
        JOIN 
            pg_namespace n ON n.oid = c.relnamespace
        WHERE 
            n.nspname = 'public' AND
            c.relkind = 'r' AND
            c.relpages > 10
        ORDER BY 
            bloat_percentage DESC
        LIMIT 3
    LOOP
        IF tbl.bloat_percentage > 20 THEN
            category := 'Maintenance';
            object_name := tbl.table_name;
            issue := format('Table has high bloat (%s%%)', tbl.bloat_percentage);
            recommendation := format('VACUUM FULL %I;', tbl.table_name);
            priority := 'Medium';
            RETURN NEXT;
        END IF;
    END LOOP;

    -- Check for missing constraints
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
            (
                (c.column_name = 'email' AND 
                 NOT EXISTS (
                    SELECT 1 FROM information_schema.check_constraints cc
                    JOIN information_schema.constraint_column_usage ccu 
                        ON cc.constraint_name = ccu.constraint_name
                    WHERE ccu.table_name = t.table_name AND ccu.column_name = c.column_name
                        AND cc.check_clause LIKE '%@%'
                 )
                ) OR
                (c.column_name LIKE '%price%' AND c.data_type LIKE '%numeric%' AND
                 NOT EXISTS (
                    SELECT 1 FROM information_schema.check_constraints cc
                    JOIN information_schema.constraint_column_usage ccu 
                        ON cc.constraint_name = ccu.constraint_name
                    WHERE ccu.table_name = t.table_name AND ccu.column_name = c.column_name
                        AND cc.check_clause LIKE '%>=%'
                 )
                )
            )
        LIMIT 5
    LOOP
        category := 'Data Integrity';
        object_name := format('%s.%s', missing_constraint.table_name, missing_constraint.column_name);
        
        IF missing_constraint.column_name = 'email' THEN
            issue := 'Email column without validation constraint';
            recommendation := format('ALTER TABLE %I ADD CONSTRAINT %I_email_check CHECK (email ~* ''^[A-Za-z0-9._%%-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'');', 
                                    missing_constraint.table_name, missing_constraint.table_name);
        ELSIF missing_constraint.column_name LIKE '%price%' THEN
            issue := 'Price column without minimum value constraint';
            recommendation := format('ALTER TABLE %I ADD CONSTRAINT %I_%s_check CHECK (%I >= 0);', 
                                    missing_constraint.table_name, missing_constraint.table_name, 
                                    missing_constraint.column_name, missing_constraint.column_name);
        END IF;
        
        priority := 'Medium';
        RETURN NEXT;
    END LOOP;

    -- Return a summary recommendation if no specific issues found
    IF NOT FOUND THEN
        category := 'General';
        object_name := 'Database';
        issue := 'General optimization';
        recommendation := 'Run ANALYZE on all tables and consider adding indexes to frequently queried columns';
        priority := 'Low';
        RETURN NEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get a summary of database health
CREATE OR REPLACE FUNCTION get_database_health()
RETURNS TABLE (
    total_tables INT,
    total_indexes INT,
    total_size TEXT,
    largest_table TEXT,
    largest_table_size TEXT,
    oldest_stats_table TEXT,
    oldest_stats_date TIMESTAMP,
    health_score INT,
    recommendations TEXT[]
) AS $$
DECLARE
    rec_list TEXT[] := ARRAY[]::TEXT[];
    health_points INT := 100;
BEGIN
    -- Get database size and table counts
    SELECT 
        COUNT(DISTINCT c.relname)::INT,
        COUNT(DISTINCT i.indexrelname)::INT,
        pg_size_pretty(SUM(pg_total_relation_size(c.oid))),
        (SELECT relname FROM pg_class WHERE relkind = 'r' ORDER BY pg_total_relation_size(oid) DESC LIMIT 1),
        pg_size_pretty((SELECT pg_total_relation_size(oid) FROM pg_class WHERE relkind = 'r' ORDER BY pg_total_relation_size(oid) DESC LIMIT 1)),
        (SELECT relname FROM pg_class c JOIN pg_stat_user_tables s ON c.relname = s.relname WHERE s.last_analyze IS NOT NULL ORDER BY s.last_analyze ASC LIMIT 1),
        (SELECT s.last_analyze FROM pg_class c JOIN pg_stat_user_tables s ON c.relname = s.relname WHERE s.last_analyze IS NOT NULL ORDER BY s.last_analyze ASC LIMIT 1)
    INTO
        total_tables,
        total_indexes,
        total_size,
        largest_table,
        largest_table_size,
        oldest_stats_table,
        oldest_stats_date
    FROM 
        pg_class c
    LEFT JOIN
        pg_stat_user_indexes i ON c.relname = i.relname
    WHERE 
        c.relkind = 'r' AND
        c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    
    -- Check for tables without primary keys
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables t
        LEFT JOIN information_schema.table_constraints tc ON 
            tc.table_name = t.table_name AND 
            tc.constraint_type = 'PRIMARY KEY' AND
            tc.table_schema = t.table_schema
        WHERE 
            t.table_schema = 'public' AND 
            t.table_type = 'BASE TABLE' AND
            tc.constraint_name IS NULL
        LIMIT 1
    ) THEN
        rec_list := array_append(rec_list, 'Add primary keys to tables missing them');
        health_points := health_points - 10;
    END IF;
    
    -- Check for tables with outdated statistics
    IF EXISTS (
        SELECT 1
        FROM pg_stat_user_tables
        WHERE last_analyze IS NULL OR last_analyze < now() - interval '7 days'
        LIMIT 1
    ) THEN
        rec_list := array_append(rec_list, 'Run ANALYZE on tables with outdated statistics');
        health_points := health_points - 5;
    END IF;
    
    -- Check for unused indexes
    IF EXISTS (
        SELECT 1
        FROM pg_stat_user_indexes i
        JOIN pg_stat_user_tables s ON i.relname = s.relname
        WHERE 
            i.idx_scan = 0 AND
            NOT EXISTS (
                SELECT 1
                FROM pg_constraint c
                WHERE c.conindid = i.indexrelid AND c.contype IN ('p', 'u')
            )
        LIMIT 1
    ) THEN
        rec_list := array_append(rec_list, 'Consider dropping unused indexes to reduce overhead');
        health_points := health_points - 3;
    END IF;
    
    -- Check for foreign keys without indexes
    IF EXISTS (
        SELECT 1
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
        WHERE 
            tc.constraint_type = 'FOREIGN KEY' AND
            tc.table_schema = 'public' AND
            NOT EXISTS (
                SELECT 1
                FROM pg_index i
                JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
                WHERE i.indrelid = tc.table_name::regclass AND a.attname = kcu.column_name
            )
        LIMIT 1
    ) THEN
        rec_list := array_append(rec_list, 'Add indexes to foreign key columns for better join performance');
        health_points := health_points - 7;
    END IF;
    
    -- Check for tables with high bloat
    IF EXISTS (
        SELECT 1
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE 
            n.nspname = 'public' AND
            c.relkind = 'r' AND
            c.relpages > 10 AND
            c.reltuples > 0 AND
            (c.relpages - CEIL(c.reltuples / (c.relpages / NULLIF(c.relpages, 0)))) / c.relpages > 0.2
        LIMIT 1
    ) THEN
        rec_list := array_append(rec_list, 'Run VACUUM FULL on tables with high bloat');
        health_points := health_points - 8;
    END IF;
    
    -- Add general recommendations
    IF array_length(rec_list, 1) IS NULL OR array_length(rec_list, 1) < 3 THEN
        rec_list := array_append(rec_list, 'Regularly run ANALYZE to keep statistics up to date');
        rec_list := array_append(rec_list, 'Monitor query performance with pg_stat_statements');
        rec_list := array_append(rec_list, 'Consider implementing table partitioning for large tables');
    END IF;
    
    -- Ensure health score is within bounds
    health_score := GREATEST(0, LEAST(100, health_points));
    
    RETURN QUERY SELECT 
        total_tables,
        total_indexes,
        total_size,
        largest_table,
        largest_table_size,
        oldest_stats_table,
        oldest_stats_date,
        health_score,
        rec_list;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get the most expensive queries
CREATE OR REPLACE FUNCTION get_expensive_queries(
    min_calls INT DEFAULT 10,
    limit_count INT DEFAULT 10
)
RETURNS TABLE (
    query_id TEXT,
    calls BIGINT,
    total_time DOUBLE PRECISION,
    mean_time DOUBLE PRECISION,
    rows_processed BIGINT,
    query TEXT,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        LEFT(md5(query), 10) AS query_id,
        s.calls,
        s.total_time,
        s.mean_time,
        s.rows,
        s.query,
        CASE
            WHEN s.mean_time > 100 AND s.calls > 100 THEN 'Consider optimizing this frequently used slow query'
            WHEN s.mean_time > 1000 THEN 'This query is very slow and should be optimized'
            WHEN s.rows > 10000 AND s.mean_time > 50 THEN 'This query returns many rows and is slow'
            ELSE 'Monitor this query for performance issues'
        END AS recommendation
    FROM
        pg_stat_statements s
    WHERE
        s.calls >= min_calls
    ORDER BY
        s.total_time DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get table bloat information
CREATE OR REPLACE FUNCTION get_table_bloat()
RETURNS TABLE (
    table_name TEXT,
    table_size TEXT,
    bloat_size TEXT,
    bloat_percentage NUMERIC,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.relname::TEXT AS table_name,
        pg_size_pretty(pg_relation_size(c.oid)) AS table_size,
        pg_size_pretty(
            CASE
                WHEN c.reltuples > 0 THEN
                    pg_relation_size(c.oid) * 
                    (c.relpages - CEIL(c.reltuples / (c.relpages / NULLIF(c.relpages, 0)))) / c.relpages
                ELSE 0
            END
        ) AS bloat_size,
        CASE
            WHEN c.reltuples > 0 THEN
                ROUND(100 * (c.relpages - CEIL(c.reltuples / (c.relpages / NULLIF(c.relpages, 0)))) / c.relpages, 2)
            ELSE 0
        END AS bloat_percentage,
        CASE
            WHEN c.reltuples > 0 AND 
                 (c.relpages - CEIL(c.reltuples / (c.relpages / NULLIF(c.relpages, 0)))) / c.relpages > 0.2
            THEN format('VACUUM FULL %I;', c.relname)
            WHEN c.reltuples > 0 AND 
                 (c.relpages - CEIL(c.reltuples / (c.relpages / NULLIF(c.relpages, 0)))) / c.relpages > 0.1
            THEN format('VACUUM %I;', c.relname)
            ELSE 'No action needed'
        END AS recommendation
    FROM
        pg_class c
    JOIN
        pg_namespace n ON n.oid = c.relnamespace
    WHERE
        n.nspname = 'public' AND
        c.relkind = 'r' AND
        c.relpages > 10
    ORDER BY
        bloat_percentage DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to run a quick database optimization
CREATE OR REPLACE PROCEDURE quick_optimize_database() 
LANGUAGE plpgsql
AS $$
DECLARE
    tbl RECORD;
    idx RECORD;
    vacuum_count INT := 0;
    analyze_count INT := 0;
BEGIN
    -- Vacuum tables with high dead tuple ratios
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
    
    -- Analyze tables with outdated statistics
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
    
    RAISE NOTICE 'Quick optimization complete: % tables vacuumed, % tables analyzed', 
        vacuum_count, analyze_count;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION analyze_database() TO authenticated;
GRANT EXECUTE ON FUNCTION get_database_health() TO authenticated;
GRANT EXECUTE ON FUNCTION get_expensive_queries(INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_table_bloat() TO authenticated;
GRANT EXECUTE ON PROCEDURE quick_optimize_database() TO authenticated;

-- Return a message to confirm successful creation
SELECT 'Database analysis and optimization functions created successfully' AS result;