/*
  # Database Health Report Function

  1. Purpose
     - Generates a comprehensive health report for the database
     - Identifies potential issues and provides recommendations
     - Helps maintain optimal database performance

  2. Features
     - Overall database health score
     - Table and index health metrics
     - Performance recommendations
     - Maintenance suggestions
*/

-- Create a function to generate a database health report
CREATE OR REPLACE FUNCTION generate_database_health_report()
RETURNS TABLE (
    section TEXT,
    title TEXT,
    status TEXT,
    details TEXT,
    recommendation TEXT
) AS $$
DECLARE
    db_size BIGINT;
    table_count INT;
    index_count INT;
    cache_hit_ratio NUMERIC;
    index_usage_ratio NUMERIC;
    dead_tuple_ratio NUMERIC;
    connection_ratio NUMERIC;
    max_conn INT;
    active_conn INT;
    health_score INT := 100;
    tbl RECORD;
    idx RECORD;
    query_rec RECORD;
    bloat_rec RECORD;
BEGIN
    -- Get database size and object counts
    SELECT pg_database_size(current_database()) INTO db_size;
    SELECT COUNT(*) INTO table_count FROM pg_stat_user_tables;
    SELECT COUNT(*) INTO index_count FROM pg_stat_user_indexes;
    
    -- Get max connections and active connections
    SELECT setting::INT INTO max_conn FROM pg_settings WHERE name = 'max_connections';
    SELECT COUNT(*) INTO active_conn FROM pg_stat_activity WHERE state = 'active';
    connection_ratio := ROUND(100 * active_conn::NUMERIC / max_conn, 2);
    
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
    
    -- Get dead tuple ratio
    SELECT 
        CASE 
            WHEN sum(n_live_tup) > 0 
            THEN round(100 * sum(n_dead_tup) / sum(n_live_tup), 2)
            ELSE 0
        END INTO dead_tuple_ratio
    FROM pg_stat_user_tables;
    
    -- Adjust health score based on metrics
    IF cache_hit_ratio < 90 THEN
        health_score := health_score - 10;
    END IF;
    
    IF index_usage_ratio < 70 THEN
        health_score := health_score - 10;
    END IF;
    
    IF dead_tuple_ratio > 10 THEN
        health_score := health_score - 10;
    END IF;
    
    IF connection_ratio > 80 THEN
        health_score := health_score - 10;
    END IF;
    
    -- Overall database summary
    section := 'Summary';
    title := 'Database Overview';
    status := CASE 
                WHEN health_score >= 90 THEN 'Excellent'
                WHEN health_score >= 70 THEN 'Good'
                WHEN health_score >= 50 THEN 'Fair'
                ELSE 'Poor'
              END;
    details := format('Database Size: %s, Tables: %s, Indexes: %s, Health Score: %s/100',
                     pg_size_pretty(db_size), table_count, index_count, health_score);
    recommendation := CASE 
                        WHEN health_score < 70 THEN 'Review detailed sections below for specific recommendations'
                        ELSE 'Continue regular maintenance'
                      END;
    RETURN NEXT;
    
    -- Cache hit ratio
    section := 'Performance';
    title := 'Cache Hit Ratio';
    status := CASE 
                WHEN cache_hit_ratio >= 95 THEN 'Excellent'
                WHEN cache_hit_ratio >= 90 THEN 'Good'
                WHEN cache_hit_ratio >= 80 THEN 'Fair'
                ELSE 'Poor'
              END;
    details := format('Cache Hit Ratio: %.2f%%', cache_hit_ratio);
    recommendation := CASE 
                        WHEN cache_hit_ratio < 90 THEN 'Consider increasing shared_buffers in PostgreSQL configuration'
                        ELSE 'No action needed'
                      END;
    RETURN NEXT;
    
    -- Index usage
    section := 'Performance';
    title := 'Index Usage';
    status := CASE 
                WHEN index_usage_ratio >= 90 THEN 'Excellent'
                WHEN index_usage_ratio >= 70 THEN 'Good'
                WHEN index_usage_ratio >= 50 THEN 'Fair'
                ELSE 'Poor'
              END;
    details := format('Index Usage Ratio: %.2f%%', index_usage_ratio);
    recommendation := CASE 
                        WHEN index_usage_ratio < 70 THEN 'Review query patterns and add appropriate indexes'
                        ELSE 'No action needed'
                      END;
    RETURN NEXT;
    
    -- Dead tuples
    section := 'Maintenance';
    title := 'Dead Tuples';
    status := CASE 
                WHEN dead_tuple_ratio <= 5 THEN 'Excellent'
                WHEN dead_tuple_ratio <= 10 THEN 'Good'
                WHEN dead_tuple_ratio <= 20 THEN 'Fair'
                ELSE 'Poor'
              END;
    details := format('Dead Tuple Ratio: %.2f%%', dead_tuple_ratio);
    recommendation := CASE 
                        WHEN dead_tuple_ratio > 10 THEN 'Run VACUUM on tables with high dead tuple counts'
                        ELSE 'No action needed'
                      END;
    RETURN NEXT;
    
    -- Connection usage
    section := 'Resources';
    title := 'Connection Usage';
    status := CASE 
                WHEN connection_ratio <= 50 THEN 'Excellent'
                WHEN connection_ratio <= 70 THEN 'Good'
                WHEN connection_ratio <= 90 THEN 'Fair'
                ELSE 'Poor'
              END;
    details := format('Active Connections: %s/%s (%.2f%%)', active_conn, max_conn, connection_ratio);
    recommendation := CASE 
                        WHEN connection_ratio > 80 THEN 'Consider implementing connection pooling'
                        ELSE 'No action needed'
                      END;
    RETURN NEXT;
    
    -- Top 3 largest tables
    FOR tbl IN
        SELECT 
            c.relname AS table_name,
            pg_size_pretty(pg_total_relation_size(c.oid)) AS total_size,
            c.reltuples AS row_count
        FROM 
            pg_class c
        JOIN 
            pg_namespace n ON n.oid = c.relnamespace
        WHERE 
            n.nspname = 'public' AND
            c.relkind = 'r'
        ORDER BY 
            pg_total_relation_size(c.oid) DESC
        LIMIT 3
    LOOP
        section := 'Tables';
        title := format('Large Table: %s', tbl.table_name);
        status := 'Info';
        details := format('Size: %s, Rows: %.0f', tbl.total_size, tbl.row_count);
        recommendation := CASE 
                            WHEN tbl.row_count > 1000000 THEN 'Consider partitioning this table'
                            ELSE 'Monitor growth over time'
                          END;
        RETURN NEXT;
    END LOOP;
    
    -- Tables with outdated statistics
    FOR tbl IN
        SELECT 
            s.relname AS table_name,
            s.last_analyze
        FROM 
            pg_stat_user_tables s
        WHERE 
            s.last_analyze IS NULL OR 
            s.last_analyze < now() - interval '7 days'
        ORDER BY 
            s.last_analyze ASC NULLS FIRST
        LIMIT 3
    LOOP
        section := 'Maintenance';
        title := format('Outdated Statistics: %s', tbl.table_name);
        status := 'Warning';
        details := format('Last ANALYZE: %s', COALESCE(tbl.last_analyze::TEXT, 'Never'));
        recommendation := format('Run ANALYZE on %I', tbl.table_name);
        RETURN NEXT;
    END LOOP;
    
    -- Unused indexes
    FOR idx IN
        SELECT 
            s.relname AS table_name,
            i.indexrelname AS index_name,
            pg_size_pretty(pg_relation_size(i.indexrelid)) AS index_size
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
        LIMIT 3
    LOOP
        section := 'Indexes';
        title := format('Unused Index: %s', idx.index_name);
        status := 'Warning';
        details := format('Table: %s, Size: %s, Scans: 0', idx.table_name, idx.index_size);
        recommendation := format('Consider dropping: DROP INDEX %I;', idx.index_name);
        RETURN NEXT;
    END LOOP;
    
    -- Slow queries
    FOR query_rec IN
        SELECT
            LEFT(md5(query), 10) AS query_id,
            calls,
            mean_time,
            query
        FROM
            pg_stat_statements
        WHERE
            mean_time > 100 AND
            calls > 10
        ORDER BY
            mean_time DESC
        LIMIT 3
    LOOP
        section := 'Queries';
        title := format('Slow Query: %s', query_rec.query_id);
        status := 'Warning';
        details := format('Avg Time: %.2f ms, Calls: %s', query_rec.mean_time, query_rec.calls);
        recommendation := 'Optimize query or add appropriate indexes';
        RETURN NEXT;
    END LOOP;
    
    -- Tables with high bloat
    FOR bloat_rec IN
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
        IF bloat_rec.bloat_percentage > 20 THEN
            section := 'Maintenance';
            title := format('Table Bloat: %s', bloat_rec.table_name);
            status := 'Warning';
            details := format('Bloat: %.2f%%', bloat_rec.bloat_percentage);
            recommendation := format('Run VACUUM FULL %I;', bloat_rec.table_name);
            RETURN NEXT;
        END IF;
    END LOOP;
    
    -- Final recommendations
    section := 'Recommendations';
    title := 'Regular Maintenance';
    status := 'Info';
    details := 'Implement regular database maintenance to ensure optimal performance';
    recommendation := 'Set up scheduled VACUUM, ANALYZE, and index maintenance';
    RETURN NEXT;
    
    section := 'Recommendations';
    title := 'Performance Monitoring';
    status := 'Info';
    details := 'Continuously monitor database performance to identify issues early';
    recommendation := 'Use the database_performance_monitor view and other monitoring functions';
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get a simple health score
CREATE OR REPLACE FUNCTION get_database_health_score()
RETURNS TABLE (
    health_score INT,
    status TEXT,
    summary TEXT,
    top_issues TEXT[]
) AS $$
DECLARE
    issues TEXT[] := ARRAY[]::TEXT[];
    cache_hit_ratio NUMERIC;
    index_usage_ratio NUMERIC;
    dead_tuple_ratio NUMERIC;
    connection_ratio NUMERIC;
    max_conn INT;
    active_conn INT;
    score INT := 100;
    status_text TEXT;
    summary_text TEXT;
BEGIN
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
    
    -- Get dead tuple ratio
    SELECT 
        CASE 
            WHEN sum(n_live_tup) > 0 
            THEN round(100 * sum(n_dead_tup) / sum(n_live_tup), 2)
            ELSE 0
        END INTO dead_tuple_ratio
    FROM pg_stat_user_tables;
    
    -- Get connection usage
    SELECT setting::INT INTO max_conn FROM pg_settings WHERE name = 'max_connections';
    SELECT COUNT(*) INTO active_conn FROM pg_stat_activity WHERE state = 'active';
    connection_ratio := ROUND(100 * active_conn::NUMERIC / max_conn, 2);
    
    -- Adjust score based on metrics
    IF cache_hit_ratio < 90 THEN
        score := score - 10;
        issues := array_append(issues, format('Low cache hit ratio: %.2f%%', cache_hit_ratio));
    END IF;
    
    IF index_usage_ratio < 70 THEN
        score := score - 10;
        issues := array_append(issues, format('Low index usage ratio: %.2f%%', index_usage_ratio));
    END IF;
    
    IF dead_tuple_ratio > 10 THEN
        score := score - 10;
        issues := array_append(issues, format('High dead tuple ratio: %.2f%%', dead_tuple_ratio));
    END IF;
    
    IF connection_ratio > 80 THEN
        score := score - 10;
        issues := array_append(issues, format('High connection usage: %.2f%%', connection_ratio));
    END IF;
    
    -- Check for tables without recent ANALYZE
    IF EXISTS (
        SELECT 1
        FROM pg_stat_user_tables
        WHERE last_analyze IS NULL OR last_analyze < now() - interval '7 days'
        LIMIT 1
    ) THEN
        score := score - 5;
        issues := array_append(issues, 'Some tables have outdated statistics');
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
        score := score - 5;
        issues := array_append(issues, 'Some indexes are unused');
    END IF;
    
    -- Check for slow queries
    IF EXISTS (
        SELECT 1
        FROM pg_stat_statements
        WHERE mean_time > 100 AND calls > 10
        LIMIT 1
    ) THEN
        score := score - 10;
        issues := array_append(issues, 'Some queries are performing slowly');
    END IF;
    
    -- Ensure score is within bounds
    score := GREATEST(0, LEAST(100, score));
    
    -- Determine status
    status_text := CASE 
                    WHEN score >= 90 THEN 'Excellent'
                    WHEN score >= 70 THEN 'Good'
                    WHEN score >= 50 THEN 'Fair'
                    ELSE 'Poor'
                  END;
    
    -- Create summary
    summary_text := format('Database health is %s with a score of %s/100. ', status_text, score);
    
    IF array_length(issues, 1) > 0 THEN
        summary_text := summary_text || format('Top issues: %s', issues[1]);
        IF array_length(issues, 1) > 1 THEN
            summary_text := summary_text || format(' and %s more issue(s)', array_length(issues, 1) - 1);
        END IF;
    ELSE
        summary_text := summary_text || 'No significant issues detected.';
    END IF;
    
    RETURN QUERY SELECT score, status_text, summary_text, issues;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION generate_database_health_report() TO authenticated;
GRANT EXECUTE ON FUNCTION get_database_health_score() TO authenticated;

-- Return a message to confirm successful creation
SELECT 'Database health report functions created successfully' AS result;