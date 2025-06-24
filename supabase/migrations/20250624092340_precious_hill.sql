/*
# Admin Dashboard Functions

1. Purpose
  - Provides data for the admin dashboard
  - Aggregates statistics from various tables
  - Enables efficient dashboard rendering

2. Features
  - Dashboard statistics
  - Recent activity tracking
  - Performance metrics
  - Business insights
*/

-- Create a function to get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
  current_month_start date;
  current_month_end date;
  last_month_start date;
  last_month_end date;
BEGIN
  -- Set date ranges
  current_month_start := date_trunc('month', current_date);
  current_month_end := (date_trunc('month', current_date) + interval '1 month' - interval '1 day')::date;
  last_month_start := date_trunc('month', current_date - interval '1 month');
  last_month_end := (date_trunc('month', current_date) - interval '1 day')::date;
  
  -- Initialize result JSON
  result := '{}'::jsonb;
  
  -- Total bookings
  SELECT jsonb_build_object(
    'total_bookings', COALESCE(COUNT(*), 0),
    'total_bookings_current_month', COALESCE(COUNT(*) FILTER (WHERE date BETWEEN current_month_start AND current_month_end), 0),
    'total_bookings_last_month', COALESCE(COUNT(*) FILTER (WHERE date BETWEEN last_month_start AND last_month_end), 0),
    'booking_growth_percentage', CASE 
      WHEN COUNT(*) FILTER (WHERE date BETWEEN last_month_start AND last_month_end) = 0 THEN NULL
      ELSE ROUND(
        (COUNT(*) FILTER (WHERE date BETWEEN current_month_start AND current_month_end)::float / 
         NULLIF(COUNT(*) FILTER (WHERE date BETWEEN last_month_start AND last_month_end), 0)::float - 1) * 100
      )
    END
  ) INTO result
  FROM bookings;
  
  -- Total revenue
  WITH revenue_data AS (
    SELECT
      SUM(total_price) AS total_revenue,
      SUM(CASE WHEN date BETWEEN current_month_start AND current_month_end THEN total_price ELSE 0 END) AS current_month_revenue,
      SUM(CASE WHEN date BETWEEN last_month_start AND last_month_end THEN total_price ELSE 0 END) AS last_month_revenue
    FROM bookings
    WHERE status = 'confirmed'
  )
  SELECT jsonb_build_object(
    'total_revenue', COALESCE(total_revenue, 0),
    'total_revenue_current_month', COALESCE(current_month_revenue, 0),
    'total_revenue_last_month', COALESCE(last_month_revenue, 0),
    'revenue_growth_percentage', CASE 
      WHEN last_month_revenue = 0 THEN NULL
      ELSE ROUND((current_month_revenue / NULLIF(last_month_revenue, 0) - 1) * 100)
    END
  ) FROM revenue_data
  INTO result;
  
  -- Average booking value
  SELECT jsonb_build_object(
    'avg_booking_value', COALESCE(AVG(total_price), 0),
    'avg_booking_value_current_month', COALESCE(AVG(total_price) FILTER (WHERE date BETWEEN current_month_start AND current_month_end), 0)
  ) FROM bookings
  WHERE status = 'confirmed'
  INTO result;
  
  -- User statistics
  SELECT jsonb_build_object(
    'total_customers', COUNT(*),
    'new_customers_30d', COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')
  ) FROM users_core
  INTO result;
  
  -- Booking status counts
  SELECT jsonb_build_object(
    'confirmed_bookings', COALESCE(COUNT(*) FILTER (WHERE status = 'confirmed'), 0),
    'pending_bookings', COALESCE(COUNT(*) FILTER (WHERE status = 'pending'), 0),
    'cancelled_bookings', COALESCE(COUNT(*) FILTER (WHERE status = 'cancelled'), 0)
  ) FROM bookings
  INTO result;
  
  -- Booking type counts
  SELECT jsonb_build_object(
    'sailing_bookings', COALESCE(COUNT(*) FILTER (WHERE booking_type = 'sailing'), 0),
    'yacht_bookings', COALESCE(COUNT(*) FILTER (WHERE booking_type = 'yacht'), 0)
  ) FROM bookings
  INTO result;
  
  -- Inquiry statistics
  SELECT jsonb_build_object(
    'total_inquiries', COUNT(*),
    'pending_contact_inquiries', COUNT(*) FILTER (WHERE type = 'contact' AND status IN ('new', 'pending')),
    'pending_corporate_inquiries', COUNT(*) FILTER (WHERE type = 'corporate' AND status IN ('new', 'pending'))
  ) FROM inquiries
  INTO result;
  
  -- Active time slots (for calendar availability)
  SELECT jsonb_build_object(
    'active_time_slots', COUNT(*) FILTER (WHERE is_active = true AND date >= CURRENT_DATE),
    'upcoming_time_slots', COUNT(*) FILTER (WHERE date >= CURRENT_DATE),
    'fully_booked_time_slots', COUNT(*) FILTER (
      WHERE is_active = true AND date >= CURRENT_DATE AND (
        SELECT COALESCE(SUM(b.participants), 0)
        FROM bookings b
        WHERE b.date = time_slots.date AND b.time_slot = time_slots.time AND b.status IN ('pending', 'confirmed')
      ) >= max_participants
    )
  ) FROM time_slots
  INTO result;
  
  -- Bookings by month (for charts)
  WITH monthly_data AS (
    SELECT
      DATE_TRUNC('month', date)::date AS month,
      COUNT(*) AS booking_count,
      SUM(total_price) AS revenue
    FROM bookings
    WHERE status = 'confirmed' AND date >= DATE_TRUNC('month', NOW() - INTERVAL '12 months')
    GROUP BY DATE_TRUNC('month', date)
    ORDER BY month
  )
  SELECT jsonb_build_object(
    'bookings_by_month', jsonb_agg(
      jsonb_build_object(
        'month', to_char(month, 'YYYY-MM'),
        'count', booking_count,
        'revenue', revenue
      )
    )
  ) FROM monthly_data
  INTO result;
  
  -- Add last updated timestamp
  result := jsonb_set(result, '{last_updated}', to_jsonb(now()));
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create a materialized view for dashboard statistics that can be refreshed periodically
CREATE MATERIALIZED VIEW IF NOT EXISTS unified_dashboard_stats AS
SELECT
  -- Regular booking stats
  COUNT(*) FILTER (WHERE booking_type = 'sailing') AS total_regular_bookings,
  -- Corporate booking stats (yacht bookings as proxy for corporate)
  COUNT(*) FILTER (WHERE booking_type = 'yacht') AS total_corporate_bookings,
  -- Status breakdowns
  COUNT(*) FILTER (WHERE status = 'pending') AS pending_bookings,
  COUNT(*) FILTER (WHERE status = 'confirmed') AS confirmed_bookings,
  -- Revenue
  SUM(CASE WHEN status = 'confirmed' THEN total_price ELSE 0 END) AS total_revenue,
  -- Average booking value
  AVG(CASE WHEN status = 'confirmed' THEN total_price ELSE NULL END) AS avg_booking_value,
  -- Customer stats (from users_core)
  (SELECT COUNT(*) FROM users_core) AS total_customers,
  (SELECT COUNT(*) FROM users_core WHERE created_at >= NOW() - INTERVAL '30 days') AS new_customers_30d,
  -- Inquiry stats
  (SELECT COUNT(*) FROM inquiries WHERE type = 'contact' AND status IN ('new', 'pending')) AS pending_contact_inquiries,
  (SELECT COUNT(*) FROM inquiries WHERE type = 'corporate' AND status IN ('new', 'pending')) AS pending_corporate_inquiries,
  -- Calendar stats
  (SELECT COUNT(*) FROM time_slots WHERE is_active = true AND date >= CURRENT_DATE) AS active_time_slots,
  -- Last updated
  NOW() AS last_updated
FROM
  bookings;

-- Create a function to refresh the dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW unified_dashboard_stats;
END;
$$ LANGUAGE plpgsql;