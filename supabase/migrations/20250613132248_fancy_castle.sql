/*
  # Create get_table_info RPC function

  1. New Functions
    - `get_table_info()` - Returns table information including name, row count, and size
      - `table_name` (text) - Name of the table
      - `row_count` (bigint) - Approximate number of rows in the table
      - `size_pretty` (text) - Human-readable size of the table

  2. Security
    - Function is accessible to authenticated users
    - Only returns information about public schema tables

  This function resolves the "Could not find the function public.get_table_info" error
  in the DatabaseManagement component.
*/

CREATE OR REPLACE FUNCTION public.get_table_info()
RETURNS TABLE (
    table_name text,
    row_count bigint,
    size_pretty text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.relname::text AS table_name,
        c.reltuples::bigint AS row_count,
        pg_size_pretty(pg_relation_size(c.oid)) AS size_pretty
    FROM
        pg_class c
    JOIN
        pg_namespace n ON n.oid = c.relnamespace
    WHERE
        c.relkind = 'r' -- 'r' for relation (table)
        AND n.nspname = 'public' -- Only public schema tables
        AND c.relname NOT LIKE 'pg_%' -- Exclude system tables
        AND c.relname NOT LIKE 'sql_%' -- Exclude SQL standard tables
    ORDER BY
        c.relname;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_table_info() TO authenticated;