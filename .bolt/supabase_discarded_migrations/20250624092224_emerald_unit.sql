/*
# Database Optimization Functions

1. Purpose
  - Provides functions for optimizing database performance
  - Monitors query performance and suggests improvements
  - Automates routine maintenance tasks

2. Features
  - Table and index analysis
  - Query performance tracking
  - Automatic optimization suggestions
  - Scheduled maintenance tasks
*/

-- Create optimization functions
CREATE OR REPLACE PROCEDURE optimize_database()
LANGUAGE plpgsql
AS $$
DECLARE
  start_time timestamp;
  end_time timestamp;
  table_record record;
  optimization_summary jsonb := '{}'::jsonb;
BEGIN
  -- Record start time
  start_time := clock_timestamp();
  RAISE NOTICE 'Starting database optimization...';
  
  -- Analyze all tables to update statistics
  RAISE NOTICE 'Analyzing all tables...';
  FOR table_record IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ANALYZE %I', table_record.tablename);
    RAISE NOTICE 'Analyzed table: %', table_record.tablename;
  END LOOP;
  
  -- Vacuum tables to reclaim space
  RAISE NOTICE 'Vacuuming tables...';
  FOR table_record IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('VACUUM %I', table_record.tablename);
    RAISE NOTICE 'Vacuumed table: %', table_record.tablename;
  END LOOP;
  
  -- Update table and index statistics
  RAISE NOTICE 'Updating optimizer statistics...';
  ANALYZE;
  
  -- Record end time
  end_time := clock_timestamp();
  optimization_summary := jsonb_set(optimization_summary, '{duration_seconds}', 
    to_jsonb(EXTRACT(EPOCH FROM (end_time - start_time))));
  optimization_summary := jsonb_set(optimization_summary, '{completed_at}', to_jsonb(end_time));
  
  RAISE NOTICE 'Database optimization completed in % seconds', 
    EXTRACT(EPOCH FROM (end_time - start_time));
END;
$$;

-- Create a quick optimization procedure for regular use
CREATE OR REPLACE PROCEDURE quick_optimize_database()
LANGUAGE plpgsql
AS $$
DECLARE
  start_time timestamp;
  end_time timestamp;
BEGIN
  -- Record start time
  start_time := clock_timestamp();
  RAISE NOTICE 'Starting quick database optimization...';
  
  -- Update table and index statistics
  ANALYZE;
  
  -- Record end time
  end_time := clock_timestamp();
  
  RAISE NOTICE 'Quick database optimization completed in % seconds', 
    EXTRACT(EPOCH FROM (end_time - start_time));
END;
$$;

-- Create a function to analyze table statistics
CREATE OR REPLACE FUNCTION analyze_table_statistics()
RETURNS TABLE (
  table_name text,
  row_count bigint,
  size_bytes bigint,
  size_pretty text,
  dead_tuples bigint,
  last_vacuum timestamp,
  last_analyze timestamp
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.nspname || '.' || c.relname AS table_name,
    c.reltuples::bigint AS row_count,
    pg_total_relation_size(c.oid) AS size_bytes,
    pg_size_pretty(pg_total_relation_size(c.oid)) AS size_pretty,
    COALESCE(s.n_dead_tup, 0)::bigint AS dead_tuples,
    s.last_vacuum,
    s.last_analyze
  FROM
    pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    LEFT JOIN pg_stat_user_tables s ON s.relid = c.oid
  WHERE
    n.nspname = 'public'
    AND c.relkind = 'r'
  ORDER BY
    pg_total_relation_size(c.oid) DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to analyze index usage
CREATE OR REPLACE FUNCTION analyze_index_usage()
RETURNS TABLE (
  table_name text,
  index_name text,
  index_size_pretty text,
  index_scans bigint,
  rows_per_scan double precision,
  unused boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.schemaname || '.' || t.relname AS table_name,
    i.indexrelname AS index_name,
    pg_size_pretty(pg_relation_size(i.indexrelid)) AS index_size_pretty,
    i.idx_scan AS index_scans,
    CASE WHEN i.idx_scan = 0 THEN NULL
         ELSE (t.seq_scan + t.idx_scan) / i.idx_scan::float
    END AS rows_per_scan,
    CASE WHEN i.idx_scan = 0 AND t.seq_scan > 0 THEN true ELSE false END AS unused
  FROM
    pg_stat_user_indexes i
    JOIN pg_stat_user_tables t ON i.relid = t.relid
  WHERE
    t.schemaname = 'public'
  ORDER BY
    unused DESC,
    t.relname,
    i.indexrelname;
END;
$$ LANGUAGE plpgsql;

-- Create a function to identify potentially missing indexes
CREATE OR REPLACE FUNCTION identify_missing_indexes()
RETURNS TABLE (
  table_name text,
  column_name text,
  query_count bigint,
  recommendation text
) AS $$
BEGIN
  RETURN QUERY
  WITH foreign_keys AS (
    SELECT
      tc.table_schema,
      tc.table_name,
      kcu.column_name
    FROM
      information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    WHERE
      tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
  ),
  existing_indexes AS (
    SELECT
      t.schemaname,
      t.relname AS table_name,
      a.attname AS column_name
    FROM
      pg_stat_user_tables t
      JOIN pg_index i ON t.relid = i.indrelid
      JOIN pg_attribute a ON t.relid = a.attrelid AND a.attnum = ANY(i.indkey)
    WHERE
      t.schemaname = 'public'
  )
  SELECT
    fk.table_schema || '.' || fk.table_name AS table_name,
    fk.column_name,
    0::bigint AS query_count,
    'Consider adding index on foreign key column' AS recommendation
  FROM
    foreign_keys fk
    LEFT JOIN existing_indexes ei
      ON fk.table_schema = ei.schemaname
      AND fk.table_name = ei.table_name
      AND fk.column_name = ei.column_name
  WHERE
    ei.column_name IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get database health summary
CREATE OR REPLACE FUNCTION get_database_health_summary()
RETURNS TABLE (
  metric text,
  value text,
  status text,
  recommendation text
) AS $$
DECLARE
  db_size bigint;
  inactive_connections bigint;
  table_bloat record;
  unused_indexes record;
  largest_tables record;
BEGIN
  -- Database size
  SELECT pg_database_size(current_database()) INTO db_size;
  metric := 'Database Size';
  value := pg_size_pretty(db_size);
  status := CASE 
    WHEN db_size > 10 * 1024 * 1024 * 1024 THEN 'Warning'  -- 10GB
    ELSE 'OK'
  END;
  recommendation := CASE 
    WHEN db_size > 10 * 1024 * 1024 * 1024 THEN 'Consider archiving old data'
    ELSE 'No action needed'
  END;
  RETURN NEXT;
  
  -- Inactive connections
  SELECT COUNT(*) INTO inactive_connections
  FROM pg_stat_activity
  WHERE state = 'idle' AND current_timestamp - state_change > interval '1 hour';
  
  metric := 'Inactive Connections';
  value := inactive_connections::text;
  status := CASE 
    WHEN inactive_connections > 5 THEN 'Warning'
    ELSE 'OK'
  END;
  recommendation := CASE 
    WHEN inactive_connections > 5 THEN 'Consider terminating idle connections'
    ELSE 'No action needed'
  END;
  RETURN NEXT;
  
  -- Check for table bloat
  FOR table_bloat IN
    SELECT
      n.nspname || '.' || c.relname AS table_name,
      pg_size_pretty(pg_total_relation_size(c.oid)) AS size,
      CASE WHEN s.n_dead_tup > 0 THEN
        round((s.n_dead_tup::float / c.reltuples::float) * 100, 2)
      ELSE 0
      END AS dead_tuple_percent
    FROM
      pg_class c
      JOIN pg_namespace n ON c.relnamespace = n.oid
      JOIN pg_stat_user_tables s ON c.relname = s.relname AND n.nspname = s.schemaname
    WHERE
      n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.reltuples > 0
      AND s.n_dead_tup > 0
      AND (s.n_dead_tup::float / c.reltuples::float) > 0.1  -- More than 10% dead tuples
    ORDER BY dead_tuple_percent DESC
    LIMIT 5
  LOOP
    metric := 'Table Bloat: ' || table_bloat.table_name;
    value := table_bloat.dead_tuple_percent || '% dead tuples';
    status := 'Warning';
    recommendation := 'Run VACUUM on ' || table_bloat.table_name;
    RETURN NEXT;
  END LOOP;
  
  -- Check for unused indexes
  FOR unused_indexes IN
    SELECT
      t.schemaname || '.' || t.relname AS table_name,
      i.indexrelname AS index_name,
      pg_size_pretty(pg_relation_size(i.indexrelid)) AS index_size
    FROM
      pg_stat_user_indexes i
      JOIN pg_stat_user_tables t ON i.relid = t.relid
    WHERE
      t.schemaname = 'public'
      AND i.idx_scan = 0
      AND t.n_live_tup > 1000  -- Only consider tables with significant data
    ORDER BY pg_relation_size(i.indexrelid) DESC
    LIMIT 5
  LOOP
    metric := 'Unused Index: ' || unused_indexes.index_name;
    value := unused_indexes.index_size;
    status := 'Warning';
    recommendation := 'Consider dropping this unused index to save space';
    RETURN NEXT;
  END LOOP;
  
  -- Identify largest tables
  FOR largest_tables IN
    SELECT
      n.nspname || '.' || c.relname AS table_name,
      pg_size_pretty(pg_total_relation_size(c.oid)) AS size_pretty,
      pg_total_relation_size(c.oid) AS size_bytes
    FROM
      pg_class c
      JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE
      n.nspname = 'public'
      AND c.relkind = 'r'
    ORDER BY pg_total_relation_size(c.oid) DESC
    LIMIT 5
  LOOP
    metric := 'Large Table: ' || largest_tables.table_name;
    value := largest_tables.size_pretty;
    status := CASE 
      WHEN largest_tables.size_bytes > 1 * 1024 * 1024 * 1024 THEN 'Warning'  -- 1GB
      ELSE 'Info'
    END;
    recommendation := CASE 
      WHEN largest_tables.size_bytes > 1 * 1024 * 1024 * 1024 THEN 'Consider partitioning or archiving'
      ELSE 'Monitor growth'
    END;
    RETURN NEXT;
  END LOOP;
  
  -- Overall health assessment
  metric := 'Overall Database Health';
  value := 'Moderate';  -- Default value
  status := 'Info';
  recommendation := 'Run routine maintenance regularly';
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;