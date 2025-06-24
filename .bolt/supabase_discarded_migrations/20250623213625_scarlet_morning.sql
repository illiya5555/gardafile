/*
# Database Monitoring View

1. Purpose
   - Provides a comprehensive view of database performance
   - Helps identify bottlenecks and optimization opportunities
   - Supports proactive database maintenance

2. Features
   - Table and index statistics
   - Query performance metrics
   - Database health indicators
   - Optimization recommendations
*/

-- Create a view for database monitoring
CREATE OR REPLACE VIEW database_monitoring AS
WITH table_stats AS (
    SELECT
        c.relname AS table_name,
        c.reltuples AS estimated_row_count,
        pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size,
        pg_size_pretty(pg_relation_size(c.oid)) AS table_size,
        pg_size_pretty(pg_indexes_size(c.oid)) AS index_size,
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
        s.last_analyze
    FROM
        pg_class c
    JOIN
        pg_namespace n ON n.oid = c.relnamespace
    LEFT JOIN
        pg_stat_user_tables s ON s.relname = c.relname
    WHERE
        n.nspname = 'public'
        AND c.relkind = 'r'
),
index_stats AS (
    SELECT
        s.relname AS table_name,
        i.indexrelname AS index_name,
        pg_size_pretty(pg_relation_size(i.indexrelid)) AS index_size,
        i.idx_scan AS index_scans,
        i.idx_tup_read AS index_rows_read,
        i.idx_tup_fetch AS index_rows_fetched
    FROM
        pg_stat_user_indexes i
    JOIN
        pg_stat_user_tables s ON i.relname = s.relname
),
query_stats AS (
    SELECT
        queryid,
        calls,
        total_time,
        mean_time,
        rows,
        query
    FROM
        pg_stat_statements
    WHERE
        dbid = (SELECT oid FROM pg_database WHERE datname = current_database())
    ORDER BY
        total_time DESC
    LIMIT 10
)
SELECT
    t.table_name,
    t.estimated_row_count,
    t.total_size,
    t.table_size,
    t.index_size,
    t.sequential_scans,
    t.index_scans,
    t.rows_inserted,
    t.rows_updated,
    t.rows_deleted,
    t.live_rows,
    t.dead_rows,
    CASE
        WHEN t.live_rows > 0 THEN
            ROUND(100 * t.dead_rows::NUMERIC / t.live_rows, 2)
        ELSE 0
    END AS dead_row_percentage,
    t.last_vacuum,
    t.last_analyze,
    CASE
        WHEN t.dead_row_percentage > 20 THEN 'Needs VACUUM'
        WHEN t.last_analyze IS NULL OR t.last_analyze < NOW() - INTERVAL '7 days' THEN 'Needs ANALYZE'
        ELSE 'OK'
    END AS maintenance_status,
    CASE
        WHEN t.sequential_scans > 100 AND t.sequential_scans > t.index_scans THEN 'Consider adding indexes'
        WHEN t.dead_row_percentage > 20 THEN 'Consider VACUUM'
        ELSE 'No recommendations'
    END AS recommendations
FROM
    table_stats t
ORDER BY
    pg_total_relation_size(t.table_name::regclass) DESC;

-- Create a function to get database health summary
CREATE OR REPLACE FUNCTION get_database_health_summary()
RETURNS TABLE (
    total_tables INT,
    total_size TEXT,
    tables_needing_vacuum INT,
    tables_needing_analyze INT,
    tables_needing_indexes INT,
    database_bloat_percentage NUMERIC,
    health_score INT,
    recommendations TEXT[]
) AS $$
DECLARE
    total_db_size BIGINT;
    total_bloat_size BIGINT;
    rec_list TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Get database size
    SELECT pg_database_size(current_database()) INTO total_db_size;
    
    -- Calculate bloat
    SELECT 
        SUM(
            CASE
                WHEN c.reltuples > 0 THEN
                    pg_relation_size(c.oid) * 
                    (c.relpages - CEIL(c.reltuples / (c.relpages / NULLIF(c.relpages, 0)))) / c.relpages
                ELSE 0
            END
        )::BIGINT
    INTO total_bloat_size
    FROM
        pg_class c
    JOIN
        pg_namespace n ON n.oid = c.relnamespace
    WHERE
        n.nspname = 'public'
        AND c.relkind = 'r';
    
    -- Get tables needing maintenance
    SELECT
        COUNT(*),
        COUNT(CASE WHEN m.maintenance_status = 'Needs VACUUM' THEN 1 END),
        COUNT(CASE WHEN m.maintenance_status = 'Needs ANALYZE' THEN 1 END),
        COUNT(CASE WHEN m.recommendations = 'Consider adding indexes' THEN 1 END)
    INTO
        total_tables,
        tables_needing_vacuum,
        tables_needing_analyze,
        tables_needing_indexes
    FROM
        database_monitoring m;
    
    -- Calculate health score (0-100)
    health_score := 100 - (
        (tables_needing_vacuum * 5) +
        (tables_needing_analyze * 3) +
        (tables_needing_indexes * 4) +
        (CASE WHEN total_bloat_size > 0 THEN 
            LEAST(30, (total_bloat_size::NUMERIC / NULLIF(total_db_size, 0) * 100)::INT)
        ELSE 0 END)
    );
    
    -- Clamp health score
    health_score := GREATEST(0, LEAST(100, health_score));
    
    -- Build recommendations
    IF tables_needing_vacuum > 0 THEN
        rec_list := array_append(rec_list, format('Run VACUUM on %s tables', tables_needing_vacuum));
    END IF;
    
    IF tables_needing_analyze > 0 THEN
        rec_list := array_append(rec_list, format('Run ANALYZE on %s tables', tables_needing_analyze));
    END IF;
    
    IF tables_needing_indexes > 0 THEN
        rec_list := array_append(rec_list, format('Consider adding indexes to %s tables', tables_needing_indexes));
    END IF;
    
    IF total_bloat_size > total_db_size * 0.2 THEN
        rec_list := array_append(rec_list, 'Consider running VACUUM FULL to reclaim space');
    END IF;
    
    RETURN QUERY
    SELECT
        total_tables,
        pg_size_pretty(total_db_size) AS total_size,
        tables_needing_vacuum,
        tables_needing_analyze,
        tables_needing_indexes,
        ROUND(100 * total_bloat_size::NUMERIC / NULLIF(total_db_size, 0), 2) AS database_bloat_percentage,
        health_score,
        rec_list AS recommendations;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;