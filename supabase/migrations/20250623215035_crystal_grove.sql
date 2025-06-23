/*
  # Database Monitor Function

  1. Purpose
     - Monitors database performance metrics
     - Tracks query execution times
     - Identifies slow queries
     - Provides insights into database health

  2. Features
     - Query performance tracking
     - Table and index usage statistics
     - Connection monitoring
     - Resource utilization metrics
*/

-- Create a function to monitor query performance
CREATE OR REPLACE FUNCTION monitor_query_performance()
RETURNS TABLE (
    query_id TEXT,
    calls BIGINT,
    total_time DOUBLE PRECISION,
    mean_time DOUBLE PRECISION,
    max_time DOUBLE PRECISION,
    stddev_time DOUBLE PRECISION,
    rows_processed BIGINT,
    shared_blks_hit BIGINT,
    shared_blks_read BIGINT,
    query TEXT,
    is_slow BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        LEFT(md5(s.query), 10) AS query_id,
        s.calls,
        s.total_time,
        s.mean_time,
        s.max_time,
        s.stddev_time,
        s.rows,
        s.shared_blks_hit,
        s.shared_blks_read,
        s.query,
        (s.mean_time > 100 OR s.max_time > 1000) AS is_slow
    FROM
        pg_stat_statements s
    WHERE
        s.dbid = (SELECT oid FROM pg_database WHERE datname = current_database())
        AND s.calls > 10
    ORDER BY
        s.mean_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to monitor table usage
CREATE OR REPLACE FUNCTION monitor_table_usage()
RETURNS TABLE (
    table_name TEXT,
    row_count BIGINT,
    sequential_scans BIGINT,
    sequential_rows_read BIGINT,
    index_scans BIGINT,
    index_rows_fetched BIGINT,
    rows_inserted BIGINT,
    rows_updated BIGINT,
    rows_deleted BIGINT,
    live_rows BIGINT,
    dead_rows BIGINT,
    last_vacuum TIMESTAMP,
    last_analyze TIMESTAMP,
    needs_vacuum BOOLEAN,
    needs_analyze BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.relname::TEXT AS table_name,
        s.n_live_tup AS row_count,
        s.seq_scan AS sequential_scans,
        s.seq_tup_read AS sequential_rows_read,
        s.idx_scan AS index_scans,
        s.idx_tup_fetch AS index_rows_fetched,
        s.n_tup_ins AS rows_inserted,
        s.n_tup_upd AS rows_updated,
        s.n_tup_del AS rows_deleted,
        s.n_live_tup AS live_rows,
        s.n_dead_tup AS dead_rows,
        s.last_vacuum,
        s.last_analyze,
        (s.n_dead_tup > 1000 OR (s.n_live_tup > 0 AND s.n_dead_tup::FLOAT / s.n_live_tup > 0.1)) AS needs_vacuum,
        (s.last_analyze IS NULL OR s.last_analyze < now() - interval '7 days') AS needs_analyze
    FROM
        pg_stat_user_tables s
    ORDER BY
        s.n_live_tup DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to monitor index usage
CREATE OR REPLACE FUNCTION monitor_index_usage()
RETURNS TABLE (
    table_name TEXT,
    index_name TEXT,
    index_size TEXT,
    index_scans BIGINT,
    rows_read BIGINT,
    rows_fetched BIGINT,
    efficiency NUMERIC,
    is_unused BOOLEAN,
    is_redundant BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH index_stats AS (
        SELECT
            s.relname AS table_name,
            i.indexrelname AS index_name,
            pg_size_pretty(pg_relation_size(i.indexrelid)) AS index_size,
            i.idx_scan AS index_scans,
            i.idx_tup_read AS rows_read,
            i.idx_tup_fetch AS rows_fetched,
            CASE
                WHEN i.idx_tup_read > 0 THEN
                    i.idx_tup_fetch::NUMERIC / i.idx_tup_read
                ELSE 0
            END AS efficiency,
            (i.idx_scan = 0) AS is_unused,
            EXISTS (
                SELECT 1
                FROM pg_index i1
                JOIN pg_index i2 ON i1.indrelid = i2.indrelid
                JOIN pg_class c1 ON i1.indexrelid = c1.oid
                JOIN pg_class c2 ON i2.indexrelid = c2.oid
                WHERE c1.relname = i.indexrelname
                AND c1.relname != c2.relname
                AND (i1.indkey::int[] <@ i2.indkey::int[] OR i2.indkey::int[] <@ i1.indkey::int[])
            ) AS is_redundant
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
        s.rows_read,
        s.rows_fetched,
        s.efficiency,
        s.is_unused,
        s.is_redundant
    FROM
        index_stats s
    ORDER BY
        s.is_unused ASC,
        s.index_scans DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to monitor database connections
CREATE OR REPLACE FUNCTION monitor_connections()
RETURNS TABLE (
    database_name TEXT,
    total_connections INT,
    active_connections INT,
    idle_connections INT,
    idle_in_transaction INT,
    max_connections INT,
    connection_utilization NUMERIC
) AS $$
DECLARE
    max_conn INT;
BEGIN
    -- Get max_connections setting
    SELECT setting::INT INTO max_conn FROM pg_settings WHERE name = 'max_connections';
    
    RETURN QUERY
    SELECT
        d.datname AS database_name,
        COUNT(*) AS total_connections,
        COUNT(*) FILTER (WHERE state = 'active') AS active_connections,
        COUNT(*) FILTER (WHERE state = 'idle') AS idle_connections,
        COUNT(*) FILTER (WHERE state = 'idle in transaction') AS idle_in_transaction,
        max_conn AS max_connections,
        ROUND(100 * COUNT(*)::NUMERIC / max_conn, 2) AS connection_utilization
    FROM
        pg_stat_activity a
    JOIN
        pg_database d ON d.oid = a.datid
    GROUP BY
        d.datname, max_conn;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get a real-time database performance snapshot
CREATE OR REPLACE FUNCTION get_database_performance_snapshot()
RETURNS TABLE (
    metric_name TEXT,
    metric_value TEXT,
    metric_unit TEXT,
    metric_description TEXT
) AS $$
DECLARE
    db_size BIGINT;
    cache_hit_ratio NUMERIC;
    index_usage_ratio NUMERIC;
    tup_returned BIGINT;
    tup_fetched BIGINT;
    active_connections INT;
    max_connections INT;
    uptime_seconds BIGINT;
BEGIN
    -- Get database size
    SELECT pg_database_size(current_database()) INTO db_size;
    
    -- Get cache hit ratio
    SELECT 
        CASE 
            WHEN sum(blks_hit + blks_read) > 0 
            THEN round(100 * sum(blks_hit) / sum(blks_hit + blks_read), 2)
            ELSE 0
        END INTO cache_hit_ratio
    FROM pg_stat_database
    WHERE datname = current_database();
    
    -- Get index usage ratio
    SELECT 
        CASE 
            WHEN sum(idx_scan + seq_scan) > 0 
            THEN round(100 * sum(idx_scan) / sum(idx_scan + seq_scan), 2)
            ELSE 0
        END INTO index_usage_ratio
    FROM pg_stat_user_tables;
    
    -- Get tuples returned vs fetched
    SELECT 
        sum(tup_returned), sum(tup_fetched) INTO tup_returned, tup_fetched
    FROM pg_stat_database
    WHERE datname = current_database();
    
    -- Get connection info
    SELECT 
        COUNT(*) FILTER (WHERE state = 'active'),
        setting::INT
    INTO 
        active_connections,
        max_connections
    FROM 
        pg_stat_activity,
        pg_settings
    WHERE 
        pg_settings.name = 'max_connections';
    
    -- Get uptime
    SELECT extract(epoch from current_timestamp - pg_postmaster_start_time()) INTO uptime_seconds;
    
    -- Return metrics
    metric_name := 'database_size';
    metric_value := pg_size_pretty(db_size);
    metric_unit := 'bytes';
    metric_description := 'Total size of the database';
    RETURN NEXT;
    
    metric_name := 'cache_hit_ratio';
    metric_value := cache_hit_ratio::TEXT;
    metric_unit := '%';
    metric_description := 'Percentage of blocks read from buffer cache vs. disk';
    RETURN NEXT;
    
    metric_name := 'index_usage_ratio';
    metric_value := index_usage_ratio::TEXT;
    metric_unit := '%';
    metric_description := 'Percentage of table accesses using an index';
    RETURN NEXT;
    
    metric_name := 'tuples_returned_vs_fetched_ratio';
    metric_value := CASE WHEN tup_fetched > 0 THEN round(tup_returned::NUMERIC / tup_fetched, 2)::TEXT ELSE '0' END;
    metric_unit := 'ratio';
    metric_description := 'Ratio of tuples returned to tuples fetched (lower is better)';
    RETURN NEXT;
    
    metric_name := 'active_connections';
    metric_value := active_connections::TEXT;
    metric_unit := 'connections';
    metric_description := 'Number of active database connections';
    RETURN NEXT;
    
    metric_name := 'connection_utilization';
    metric_value := round(100 * active_connections::NUMERIC / max_connections, 2)::TEXT;
    metric_unit := '%';
    metric_description := 'Percentage of max connections currently in use';
    RETURN NEXT;
    
    metric_name := 'database_uptime';
    metric_value := (uptime_seconds / 3600)::TEXT;
    metric_unit := 'hours';
    metric_description := 'Database uptime in hours';
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for database performance monitoring
CREATE OR REPLACE VIEW database_performance_monitor AS
WITH table_stats AS (
    SELECT
        s.relname AS table_name,
        s.seq_scan AS sequential_scans,
        s.seq_tup_read AS sequential_rows_read,
        s.idx_scan AS index_scans,
        s.idx_tup_fetch AS index_rows_fetched,
        s.n_tup_ins AS rows_inserted,
        s.n_tup_upd AS rows_updated,
        s.n_tup_del AS rows_deleted,
        s.n_live_tup AS live_rows,
        s.n_dead_tup AS dead_rows,
        CASE
            WHEN s.n_live_tup > 0 THEN
                ROUND(100 * s.n_dead_tup::NUMERIC / s.n_live_tup, 2)
            ELSE 0
        END AS dead_row_percentage,
        s.last_vacuum,
        s.last_analyze
    FROM
        pg_stat_user_tables s
),
index_stats AS (
    SELECT
        s.relname AS table_name,
        i.indexrelname AS index_name,
        i.idx_scan AS index_scans,
        i.idx_tup_read AS index_rows_read,
        i.idx_tup_fetch AS index_rows_fetched
    FROM
        pg_stat_user_indexes i
    JOIN
        pg_stat_user_tables s ON i.relname = s.relname
),
db_stats AS (
    SELECT
        datname,
        blks_hit,
        blks_read,
        tup_returned,
        tup_fetched,
        tup_inserted,
        tup_updated,
        tup_deleted,
        conflicts,
        temp_files,
        temp_bytes,
        deadlocks,
        checksum_failures,
        CASE 
            WHEN blks_hit + blks_read > 0 
            THEN ROUND(100 * blks_hit::NUMERIC / (blks_hit + blks_read), 2)
            ELSE 0
        END AS cache_hit_ratio
    FROM
        pg_stat_database
    WHERE
        datname = current_database()
)
SELECT
    'Database' AS category,
    datname AS object_name,
    'Cache hit ratio' AS metric_name,
    cache_hit_ratio::TEXT AS metric_value,
    '%' AS metric_unit,
    CASE
        WHEN cache_hit_ratio < 90 THEN 'Low cache hit ratio, consider increasing shared_buffers'
        ELSE 'Good cache hit ratio'
    END AS recommendation
FROM
    db_stats

UNION ALL

SELECT
    'Database' AS category,
    datname AS object_name,
    'Tuples returned vs fetched' AS metric_name,
    CASE WHEN tup_fetched > 0 THEN ROUND(tup_returned::NUMERIC / tup_fetched, 2)::TEXT ELSE '0' END AS metric_value,
    'ratio' AS metric_unit,
    CASE
        WHEN tup_fetched > 0 AND tup_returned::NUMERIC / tup_fetched > 10 THEN 'High ratio of tuples returned to fetched, consider optimizing queries'
        ELSE 'Good tuple efficiency'
    END AS recommendation
FROM
    db_stats

UNION ALL

SELECT
    'Table' AS category,
    table_name AS object_name,
    'Dead row percentage' AS metric_name,
    dead_row_percentage::TEXT AS metric_value,
    '%' AS metric_unit,
    CASE
        WHEN dead_row_percentage > 20 THEN 'High dead row percentage, run VACUUM'
        WHEN dead_row_percentage > 10 THEN 'Moderate dead row percentage, consider VACUUM'
        ELSE 'Acceptable dead row percentage'
    END AS recommendation
FROM
    table_stats
WHERE
    live_rows > 1000
ORDER BY
    dead_row_percentage DESC
LIMIT 5

UNION ALL

SELECT
    'Table' AS category,
    table_name AS object_name,
    'Sequential vs index scans' AS metric_name,
    CASE 
        WHEN sequential_scans + index_scans > 0 
        THEN ROUND(100 * index_scans::NUMERIC / (sequential_scans + index_scans), 2)::TEXT 
        ELSE '0' 
    END AS metric_value,
    '%' AS metric_unit,
    CASE
        WHEN sequential_scans > 100 AND sequential_scans > index_scans THEN 'High number of sequential scans, consider adding indexes'
        ELSE 'Good index usage'
    END AS recommendation
FROM
    table_stats
WHERE
    sequential_scans + index_scans > 10
ORDER BY
    sequential_scans DESC
LIMIT 5

UNION ALL

SELECT
    'Index' AS category,
    i.index_name AS object_name,
    'Index usage' AS metric_name,
    i.index_scans::TEXT AS metric_value,
    'scans' AS metric_unit,
    CASE
        WHEN i.index_scans = 0 THEN 'Unused index, consider dropping'
        ELSE 'Index is being used'
    END AS recommendation
FROM
    index_stats i
JOIN
    pg_class c ON c.relname = i.index_name
WHERE
    NOT EXISTS (
        SELECT 1
        FROM pg_constraint con
        WHERE con.conindid = c.oid AND con.contype IN ('p', 'u')
    )
ORDER BY
    i.index_scans ASC
LIMIT 5;

-- Grant access to authenticated users
GRANT SELECT ON database_performance_monitor TO authenticated;
GRANT EXECUTE ON FUNCTION monitor_query_performance() TO authenticated;
GRANT EXECUTE ON FUNCTION monitor_table_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION monitor_index_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION monitor_connections() TO authenticated;
GRANT EXECUTE ON FUNCTION get_database_performance_snapshot() TO authenticated;

-- Return a message to confirm successful creation
SELECT 'Database monitoring functions created successfully' AS result;