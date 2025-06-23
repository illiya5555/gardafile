/*
# Database Optimization Functions

1. Purpose
   - Provides functions to analyze and optimize database performance
   - Identifies missing indexes and slow queries
   - Helps maintain database health

2. Features
   - Table statistics analysis
   - Index usage statistics
   - Query performance monitoring
   - Automatic vacuum recommendations
*/

-- Create a function to analyze table statistics
CREATE OR REPLACE FUNCTION analyze_table_statistics()
RETURNS TABLE (
    table_name TEXT,
    row_count BIGINT,
    total_size TEXT,
    index_size TEXT,
    table_size TEXT,
    bloat_percentage NUMERIC,
    last_vacuum TIMESTAMP,
    last_analyze TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.relname::TEXT AS table_name,
        c.reltuples::BIGINT AS row_count,
        pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size,
        pg_size_pretty(pg_indexes_size(c.oid)) AS index_size,
        pg_size_pretty(pg_relation_size(c.oid)) AS table_size,
        CASE
            WHEN c.reltuples > 0 THEN
                ROUND(100 * (c.relpages - CEIL(c.reltuples / (c.relpages / NULLIF(c.relpages, 0)))) / c.relpages, 2)
            ELSE 0
        END AS bloat_percentage,
        last_vacuum,
        last_analyze
    FROM
        pg_class c
    JOIN
        pg_namespace n ON n.oid = c.relnamespace
    LEFT JOIN
        pg_stat_user_tables s ON s.relname = c.relname
    WHERE
        n.nspname = 'public'
        AND c.relkind = 'r'
    ORDER BY
        pg_total_relation_size(c.oid) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to analyze index usage
CREATE OR REPLACE FUNCTION analyze_index_usage()
RETURNS TABLE (
    table_name TEXT,
    index_name TEXT,
    index_size TEXT,
    index_scans BIGINT,
    rows_fetched BIGINT,
    rows_inserted BIGINT,
    rows_updated BIGINT,
    rows_deleted BIGINT,
    usage_ratio NUMERIC,
    redundant BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH index_stats AS (
        SELECT
            s.relname AS table_name,
            i.indexrelname AS index_name,
            pg_size_pretty(pg_relation_size(i.indexrelid)) AS index_size,
            i.idx_scan AS index_scans,
            i.idx_tup_fetch AS rows_fetched,
            s.n_tup_ins AS rows_inserted,
            s.n_tup_upd AS rows_updated,
            s.n_tup_del AS rows_deleted,
            CASE
                WHEN s.n_tup_ins + s.n_tup_upd + s.n_tup_del > 0 THEN
                    i.idx_scan::NUMERIC / (s.n_tup_ins + s.n_tup_upd + s.n_tup_del)
                ELSE 0
            END AS usage_ratio
        FROM
            pg_stat_user_indexes i
        JOIN
            pg_stat_user_tables s ON i.relname = s.relname
    )
    SELECT
        s.table_name,
        s.index_name,
        s.index_size,
        s.index_scans,
        s.rows_fetched,
        s.rows_inserted,
        s.rows_updated,
        s.rows_deleted,
        s.usage_ratio,
        EXISTS (
            SELECT 1
            FROM pg_index i1
            JOIN pg_index i2 ON i1.indrelid = i2.indrelid
            JOIN pg_class c1 ON i1.indexrelid = c1.oid
            JOIN pg_class c2 ON i2.indexrelid = c2.oid
            WHERE c1.relname = s.index_name
            AND c1.relname != c2.relname
            AND (i1.indkey::int[] <@ i2.indkey::int[] OR i2.indkey::int[] <@ i1.indkey::int[])
        ) AS redundant
    FROM
        index_stats s
    ORDER BY
        s.usage_ratio ASC, pg_relation_size(s.index_name::regclass) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to identify missing indexes
CREATE OR REPLACE FUNCTION identify_missing_indexes()
RETURNS TABLE (
    table_name TEXT,
    column_name TEXT,
    estimated_improvement NUMERIC,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH table_stats AS (
        SELECT
            s.relname AS table_name,
            s.seq_scan AS sequential_scans,
            s.seq_tup_read AS rows_read_seq,
            s.idx_scan AS index_scans,
            s.idx_tup_fetch AS rows_read_idx,
            c.reltuples AS row_count
        FROM
            pg_stat_user_tables s
        JOIN
            pg_class c ON s.relname = c.relname
        WHERE
            s.seq_scan > 0
    ),
    column_stats AS (
        SELECT
            t.table_name,
            a.attname AS column_name,
            t.sequential_scans,
            t.rows_read_seq,
            t.row_count,
            CASE
                WHEN a.attname LIKE '%\_id' OR a.attname = 'id' THEN 3
                WHEN a.attname LIKE '%date%' OR a.attname LIKE '%time%' THEN 2
                WHEN a.attname LIKE '%status%' OR a.attname LIKE '%type%' THEN 2
                ELSE 1
            END AS column_importance
        FROM
            table_stats t
        JOIN
            pg_attribute a ON a.attrelid = t.table_name::regclass
        JOIN
            pg_type ty ON ty.oid = a.atttypid
        WHERE
            a.attnum > 0
            AND NOT a.attisdropped
            AND ty.typcategory IN ('N', 'S', 'D', 'B') -- Numeric, String, Date/Time, Boolean
            AND NOT EXISTS (
                SELECT 1
                FROM pg_index i
                JOIN pg_attribute ia ON ia.attrelid = i.indrelid AND ia.attnum = ANY(i.indkey)
                WHERE i.indrelid = t.table_name::regclass AND ia.attname = a.attname
            )
    )
    SELECT
        s.table_name,
        s.column_name,
        (s.sequential_scans * s.rows_read_seq * s.column_importance / NULLIF(s.row_count, 0))::NUMERIC AS estimated_improvement,
        format('CREATE INDEX idx_%s_%s ON %s(%s);', 
            s.table_name, s.column_name, s.table_name, s.column_name) AS recommendation
    FROM
        column_stats s
    WHERE
        s.sequential_scans > 10
        OR (s.sequential_scans > 1 AND s.rows_read_seq > 10000)
    ORDER BY
        estimated_improvement DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to recommend vacuum operations
CREATE OR REPLACE FUNCTION recommend_vacuum_operations()
RETURNS TABLE (
    table_name TEXT,
    dead_tuples BIGINT,
    live_tuples BIGINT,
    dead_tuple_ratio NUMERIC,
    last_vacuum TIMESTAMP,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.relname::TEXT AS table_name,
        s.n_dead_tup AS dead_tuples,
        s.n_live_tup AS live_tuples,
        CASE
            WHEN s.n_live_tup > 0 THEN
                (s.n_dead_tup::NUMERIC / s.n_live_tup)
            ELSE 0
        END AS dead_tuple_ratio,
        s.last_vacuum,
        CASE
            WHEN s.n_dead_tup > 10000 OR (s.n_live_tup > 0 AND s.n_dead_tup::NUMERIC / s.n_live_tup > 0.2) THEN
                format('VACUUM ANALYZE %I;', s.relname)
            ELSE
                'No vacuum needed'
        END AS recommendation
    FROM
        pg_stat_user_tables s
    WHERE
        s.n_dead_tup > 0
    ORDER BY
        dead_tuple_ratio DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to optimize the database
CREATE OR REPLACE PROCEDURE optimize_database() 
LANGUAGE plpgsql
AS $$
DECLARE
    tbl RECORD;
    idx RECORD;
    vacuum_rec RECORD;
    vacuum_count INT := 0;
    analyze_count INT := 0;
    reindex_count INT := 0;
BEGIN
    -- Vacuum tables with high dead tuple ratios
    FOR vacuum_rec IN
        SELECT * FROM recommend_vacuum_operations()
        WHERE dead_tuple_ratio > 0.1 OR dead_tuples > 10000
    LOOP
        BEGIN
            RAISE NOTICE 'Vacuuming table %...', vacuum_rec.table_name;
            EXECUTE format('VACUUM ANALYZE %I', vacuum_rec.table_name);
            vacuum_count := vacuum_count + 1;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to vacuum table %: %', vacuum_rec.table_name, SQLERRM;
        END;
    END LOOP;
    
    -- Analyze tables that haven't been analyzed recently
    FOR tbl IN
        SELECT table_name
        FROM analyze_table_statistics()
        WHERE last_analyze < NOW() - INTERVAL '7 days'
           OR last_analyze IS NULL
    LOOP
        BEGIN
            RAISE NOTICE 'Analyzing table %...', tbl.table_name;
            EXECUTE format('ANALYZE %I', tbl.table_name);
            analyze_count := analyze_count + 1;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to analyze table %: %', tbl.table_name, SQLERRM;
        END;
    END LOOP;
    
    -- Reindex bloated indexes
    FOR idx IN
        SELECT table_name, index_name
        FROM analyze_index_usage()
        WHERE index_scans > 0 AND redundant = FALSE
    LOOP
        BEGIN
            RAISE NOTICE 'Reindexing index % on table %...', idx.index_name, idx.table_name;
            EXECUTE format('REINDEX INDEX %I', idx.index_name);
            reindex_count := reindex_count + 1;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to reindex %: %', idx.index_name, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Optimization complete: % tables vacuumed, % tables analyzed, % indexes reindexed', 
        vacuum_count, analyze_count, reindex_count;
END;
$$;

-- To execute the optimization, run:
-- CALL optimize_database();