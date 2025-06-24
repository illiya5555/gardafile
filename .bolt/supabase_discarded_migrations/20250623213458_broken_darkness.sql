/*
# Booking Statistics View

1. Purpose
   - Provides easy access to booking statistics for users
   - Consolidates data from the bookings table
   - Optimizes common dashboard queries

2. Features
   - Total bookings count
   - Total spent amount
   - Last booking date
   - Counts by booking status
   - Recent booking activity
*/

CREATE OR REPLACE VIEW booking_statistics AS
SELECT
    user_id,
    COUNT(*) AS total_bookings,
    SUM(price) AS total_spent,
    MAX(start_date) AS last_booking_date,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) AS confirmed_bookings,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_bookings,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled_bookings,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_bookings,
    COUNT(CASE WHEN start_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) AS bookings_last_30_days,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) AS new_bookings_last_30_days,
    jsonb_agg(
        jsonb_build_object(
            'id', id,
            'type', booking_type,
            'date', start_date,
            'status', status,
            'price', price
        ) ORDER BY start_date DESC
    ) FILTER (WHERE start_date >= CURRENT_DATE - INTERVAL '90 days') AS recent_bookings
FROM
    bookings
GROUP BY
    user_id;

-- Create a function to get user booking statistics
CREATE OR REPLACE FUNCTION get_user_booking_stats(user_uuid UUID)
RETURNS TABLE (
    total_bookings BIGINT,
    total_spent NUMERIC,
    last_booking_date DATE,
    confirmed_bookings BIGINT,
    pending_bookings BIGINT,
    cancelled_bookings BIGINT,
    completed_bookings BIGINT,
    bookings_last_30_days BIGINT,
    new_bookings_last_30_days BIGINT,
    recent_bookings JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        bs.total_bookings,
        bs.total_spent,
        bs.last_booking_date,
        bs.confirmed_bookings,
        bs.pending_bookings,
        bs.cancelled_bookings,
        bs.completed_bookings,
        bs.bookings_last_30_days,
        bs.new_bookings_last_30_days,
        bs.recent_bookings
    FROM
        booking_statistics bs
    WHERE
        bs.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get admin dashboard statistics
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS TABLE (
    total_bookings BIGINT,
    total_revenue NUMERIC,
    pending_bookings BIGINT,
    confirmed_bookings BIGINT,
    total_customers BIGINT,
    new_customers_30d BIGINT,
    bookings_last_30_days BIGINT,
    avg_booking_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) AS total_bookings,
        SUM(price) AS total_revenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) AS confirmed_bookings,
        COUNT(DISTINCT user_id) AS total_customers,
        COUNT(DISTINCT CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN user_id END) AS new_customers_30d,
        COUNT(CASE WHEN start_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) AS bookings_last_30_days,
        CASE 
            WHEN COUNT(*) > 0 THEN ROUND(SUM(price) / COUNT(*), 2)
            ELSE 0
        END AS avg_booking_value
    FROM
        bookings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;