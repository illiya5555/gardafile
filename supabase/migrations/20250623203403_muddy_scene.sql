/*
  # Fix dashboard materialized view permissions

  1. Security
    - Set proper ownership for materialized views
    - Update refresh function to use SECURITY DEFINER
    - Grant necessary permissions to allow triggers to work

  2. Changes
    - Change ownership of dashboard_stats materialized view to postgres
    - Change ownership of unified_dashboard_stats materialized view to postgres  
    - Recreate refresh_dashboard_stats function with SECURITY DEFINER
    - Update function ownership to postgres

  This fixes the "must be owner of materialized view dashboard_stats" error
  when creating bookings through the frontend.
*/

-- Change ownership of materialized views to postgres superuser
ALTER MATERIALIZED VIEW IF EXISTS public.dashboard_stats OWNER TO postgres;
ALTER MATERIALIZED VIEW IF EXISTS public.unified_dashboard_stats OWNER TO postgres;

-- Recreate the refresh_dashboard_stats function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.refresh_dashboard_stats()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $function$
BEGIN
  -- Refresh both materialized views
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.dashboard_stats;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.unified_dashboard_stats;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Set the function owner to postgres
ALTER FUNCTION public.refresh_dashboard_stats() OWNER TO postgres;

-- Grant execute permissions to the roles that need it
GRANT EXECUTE ON FUNCTION public.refresh_dashboard_stats() TO anon;
GRANT EXECUTE ON FUNCTION public.refresh_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_dashboard_stats() TO service_role;