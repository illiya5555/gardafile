/*
  # Admin Dashboard Management Functions

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

-- Create a function to get admin dashboard statistics
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_bookings', (SELECT COUNT(*) FROM reservations),
        'total_revenue', (SELECT COALESCE(SUM(total_price), 0) FROM reservations WHERE status IN ('confirmed', 'completed')),
        'total_customers', (SELECT COUNT(*) FROM unified_customers),
        'pending_corporate_inquiries', (SELECT COUNT(*) FROM unified_inquiries WHERE type = 'corporate' AND status = 'new'),
        'bookings_last_30_days', (SELECT COUNT(*) FROM reservations WHERE created_at >= NOW() - INTERVAL '30 days'),
        'avg_booking_value', (
            SELECT COALESCE(AVG(total_price), 0) 
            FROM reservations 
            WHERE status IN ('confirmed', 'completed')
        ),
        'recent_bookings', (
            SELECT jsonb_agg(jsonb_build_object(
                'id', id,
                'customer_name', customer_name,
                'booking_date', booking_date,
                'time_slot', time_slot,
                'participants', participants,
                'total_price', total_price,
                'status', status,
                'created_at', created_at
            ))
            FROM (
                SELECT id, customer_name, booking_date, time_slot, participants, total_price, status, created_at
                FROM reservations
                ORDER BY created_at DESC
                LIMIT 5
            ) recent
        ),
        'recent_inquiries', (
            SELECT jsonb_agg(jsonb_build_object(
                'id', id,
                'type', type,
                'customer_name', customer_name,
                'customer_email', customer_email,
                'subject', subject,
                'status', status,
                'created_at', created_at
            ))
            FROM (
                SELECT id, type, customer_name, customer_email, subject, status, created_at
                FROM unified_inquiries
                ORDER BY created_at DESC
                LIMIT 5
            ) recent
        ),
        'monthly_revenue', (
            SELECT jsonb_agg(jsonb_build_object(
                'month', to_char(booking_date, 'YYYY-MM'),
                'revenue', SUM(total_price)
            ))
            FROM reservations
            WHERE status IN ('confirmed', 'completed')
            AND booking_date >= date_trunc('month', NOW() - INTERVAL '6 months')
            GROUP BY to_char(booking_date, 'YYYY-MM')
            ORDER BY to_char(booking_date, 'YYYY-MM')
        ),
        'booking_sources', (
            SELECT jsonb_agg(jsonb_build_object(
                'source', COALESCE(booking_source, 'website'),
                'count', COUNT(*)
            ))
            FROM reservations
            WHERE created_at >= NOW() - INTERVAL '30 days'
            GROUP BY COALESCE(booking_source, 'website')
            ORDER BY COUNT(*) DESC
        ),
        'system_health', (
            SELECT jsonb_build_object(
                'database_size', pg_size_pretty(pg_database_size(current_database())),
                'active_connections', (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active'),
                'cache_hit_ratio', (
                    SELECT ROUND(100 * sum(blks_hit) / NULLIF(sum(blks_hit + blks_read), 0), 2)
                    FROM pg_stat_database
                    WHERE datname = current_database()
                ),
                'last_updated', NOW()
            )
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get recent activity for the admin dashboard
CREATE OR REPLACE FUNCTION get_admin_recent_activity()
RETURNS TABLE (
    activity_type TEXT,
    activity_id UUID,
    activity_time TIMESTAMPTZ,
    activity_description TEXT,
    related_user TEXT,
    related_entity TEXT,
    is_high_priority BOOLEAN
) AS $$
BEGIN
    -- Recent bookings
    RETURN QUERY
    SELECT
        'booking'::TEXT AS activity_type,
        r.id AS activity_id,
        r.created_at AS activity_time,
        CASE
            WHEN r.status = 'pending' THEN 'New booking created'
            WHEN r.status = 'confirmed' THEN 'Booking confirmed'
            WHEN r.status = 'cancelled' THEN 'Booking cancelled'
            ELSE 'Booking updated'
        END AS activity_description,
        r.customer_name AS related_user,
        'Booking #' || substring(r.id::TEXT, 1, 8) AS related_entity,
        r.status = 'pending' AS is_high_priority
    FROM
        reservations r
    WHERE
        r.created_at >= NOW() - INTERVAL '7 days'
    
    UNION ALL
    
    -- Recent inquiries
    SELECT
        'inquiry'::TEXT AS activity_type,
        i.id AS activity_id,
        i.created_at AS activity_time,
        'New ' || i.type || ' inquiry received' AS activity_description,
        i.customer_name AS related_user,
        COALESCE(i.subject, 'Inquiry #' || substring(i.id::TEXT, 1, 8)) AS related_entity,
        i.priority = 'high' AS is_high_priority
    FROM
        unified_inquiries i
    WHERE
        i.created_at >= NOW() - INTERVAL '7 days'
    
    UNION ALL
    
    -- Recent customer registrations
    SELECT
        'customer'::TEXT AS activity_type,
        c.id AS activity_id,
        c.created_at AS activity_time,
        'New customer registered' AS activity_description,
        COALESCE(c.full_name, CONCAT(c.first_name, ' ', c.last_name)) AS related_user,
        c.email AS related_entity,
        FALSE AS is_high_priority
    FROM
        unified_customers c
    WHERE
        c.created_at >= NOW() - INTERVAL '7 days'
    
    ORDER BY
        activity_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get booking calendar data
CREATE OR REPLACE FUNCTION get_booking_calendar_data(
    year_month TEXT -- Format: 'YYYY-MM'
)
RETURNS TABLE (
    date DATE,
    morning_bookings JSONB,
    afternoon_bookings JSONB,
    morning_availability JSONB,
    afternoon_availability JSONB
) AS $$
DECLARE
    start_date DATE;
    end_date DATE;
    current_date DATE;
    morning_slot TEXT := '08:30-12:30';
    afternoon_slot TEXT := '13:30-17:30';
BEGIN
    -- Parse year and month
    start_date := (year_month || '-01')::DATE;
    end_date := (start_date + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
    
    -- Loop through each day in the month
    current_date := start_date;
    WHILE current_date <= end_date LOOP
        -- Get morning bookings
        WITH morning_data AS (
            SELECT
                jsonb_agg(
                    jsonb_build_object(
                        'id', id,
                        'customer_name', customer_name,
                        'participants', participants,
                        'status', status
                    )
                ) AS bookings,
                COALESCE(SUM(participants), 0) AS total_participants
            FROM
                reservations
            WHERE
                booking_date = current_date AND
                time_slot = morning_slot AND
                status IN ('pending', 'confirmed')
        ),
        morning_slot_data AS (
            SELECT
                jsonb_build_object(
                    'is_active', is_active,
                    'max_participants', max_participants,
                    'price_per_person', price_per_person
                ) AS availability
            FROM
                time_slots
            WHERE
                date = current_date AND
                time = morning_slot
        )
        SELECT
            current_date,
            COALESCE((SELECT bookings FROM morning_data), '[]'::JSONB),
            COALESCE((SELECT bookings FROM morning_data), '[]'::JSONB),
            COALESCE(
                (SELECT availability FROM morning_slot_data),
                jsonb_build_object(
                    'is_active', FALSE,
                    'max_participants', 0,
                    'price_per_person', 0
                )
            ),
            COALESCE(
                (SELECT 
                    jsonb_build_object(
                        'is_active', ts.is_active,
                        'max_participants', ts.max_participants,
                        'price_per_person', ts.price_per_person
                    )
                FROM time_slots ts
                WHERE ts.date = current_date AND ts.time = afternoon_slot),
                jsonb_build_object(
                    'is_active', FALSE,
                    'max_participants', 0,
                    'price_per_person', 0
                )
            )
        INTO
            date,
            morning_bookings,
            afternoon_bookings,
            morning_availability,
            afternoon_availability;
        
        RETURN NEXT;
        
        -- Move to next day
        current_date := current_date + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get admin dashboard insights
CREATE OR REPLACE FUNCTION get_admin_dashboard_insights()
RETURNS TABLE (
    insight_type TEXT,
    insight_title TEXT,
    insight_value TEXT,
    insight_change NUMERIC,
    insight_trend TEXT,
    insight_details JSONB
) AS $$
DECLARE
    current_month_bookings INT;
    previous_month_bookings INT;
    current_month_revenue NUMERIC;
    previous_month_revenue NUMERIC;
    current_month_customers INT;
    previous_month_customers INT;
    booking_change NUMERIC;
    revenue_change NUMERIC;
    customer_change NUMERIC;
BEGIN
    -- Get current month bookings
    SELECT COUNT(*) INTO current_month_bookings
    FROM reservations
    WHERE booking_date >= date_trunc('month', CURRENT_DATE)
    AND booking_date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';
    
    -- Get previous month bookings
    SELECT COUNT(*) INTO previous_month_bookings
    FROM reservations
    WHERE booking_date >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month'
    AND booking_date < date_trunc('month', CURRENT_DATE);
    
    -- Get current month revenue
    SELECT COALESCE(SUM(total_price), 0) INTO current_month_revenue
    FROM reservations
    WHERE booking_date >= date_trunc('month', CURRENT_DATE)
    AND booking_date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
    AND status IN ('confirmed', 'completed');
    
    -- Get previous month revenue
    SELECT COALESCE(SUM(total_price), 0) INTO previous_month_revenue
    FROM reservations
    WHERE booking_date >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month'
    AND booking_date < date_trunc('month', CURRENT_DATE)
    AND status IN ('confirmed', 'completed');
    
    -- Get current month new customers
    SELECT COUNT(*) INTO current_month_customers
    FROM unified_customers
    WHERE created_at >= date_trunc('month', CURRENT_DATE)
    AND created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';
    
    -- Get previous month new customers
    SELECT COUNT(*) INTO previous_month_customers
    FROM unified_customers
    WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month'
    AND created_at < date_trunc('month', CURRENT_DATE);
    
    -- Calculate changes
    booking_change := CASE 
                        WHEN previous_month_bookings = 0 THEN 100
                        ELSE ROUND(100 * (current_month_bookings - previous_month_bookings)::NUMERIC / previous_month_bookings, 2)
                      END;
                      
    revenue_change := CASE 
                        WHEN previous_month_revenue = 0 THEN 100
                        ELSE ROUND(100 * (current_month_revenue - previous_month_revenue) / previous_month_revenue, 2)
                      END;
                      
    customer_change := CASE 
                         WHEN previous_month_customers = 0 THEN 100
                         ELSE ROUND(100 * (current_month_customers - previous_month_customers)::NUMERIC / previous_month_customers, 2)
                       END;
    
    -- Return insights
    
    -- Bookings insight
    insight_type := 'bookings';
    insight_title := 'Monthly Bookings';
    insight_value := current_month_bookings::TEXT;
    insight_change := booking_change;
    insight_trend := CASE WHEN booking_change >= 0 THEN 'up' ELSE 'down' END;
    insight_details := jsonb_build_object(
        'current_month', current_month_bookings,
        'previous_month', previous_month_bookings,
        'change_percentage', booking_change,
        'period', to_char(date_trunc('month', CURRENT_DATE), 'Month YYYY')
    );
    RETURN NEXT;
    
    -- Revenue insight
    insight_type := 'revenue';
    insight_title := 'Monthly Revenue';
    insight_value := '€' || current_month_revenue::TEXT;
    insight_change := revenue_change;
    insight_trend := CASE WHEN revenue_change >= 0 THEN 'up' ELSE 'down' END;
    insight_details := jsonb_build_object(
        'current_month', current_month_revenue,
        'previous_month', previous_month_revenue,
        'change_percentage', revenue_change,
        'period', to_char(date_trunc('month', CURRENT_DATE), 'Month YYYY')
    );
    RETURN NEXT;
    
    -- Customers insight
    insight_type := 'customers';
    insight_title := 'New Customers';
    insight_value := current_month_customers::TEXT;
    insight_change := customer_change;
    insight_trend := CASE WHEN customer_change >= 0 THEN 'up' ELSE 'down' END;
    insight_details := jsonb_build_object(
        'current_month', current_month_customers,
        'previous_month', previous_month_customers,
        'change_percentage', customer_change,
        'period', to_char(date_trunc('month', CURRENT_DATE), 'Month YYYY')
    );
    RETURN NEXT;
    
    -- Booking conversion rate
    DECLARE
        total_inquiries INT;
        converted_inquiries INT;
        conversion_rate NUMERIC;
    BEGIN
        SELECT COUNT(*) INTO total_inquiries
        FROM unified_inquiries
        WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '3 month'
        AND type = 'contact';
        
        SELECT COUNT(*) INTO converted_inquiries
        FROM unified_inquiries
        WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '3 month'
        AND type = 'contact'
        AND related_booking_id IS NOT NULL;
        
        conversion_rate := CASE 
                            WHEN total_inquiries = 0 THEN 0
                            ELSE ROUND(100 * converted_inquiries::NUMERIC / total_inquiries, 2)
                          END;
        
        insight_type := 'conversion';
        insight_title := 'Inquiry Conversion Rate';
        insight_value := conversion_rate::TEXT || '%';
        insight_change := NULL; -- No change calculation for this metric
        insight_trend := NULL;
        insight_details := jsonb_build_object(
            'total_inquiries', total_inquiries,
            'converted_inquiries', converted_inquiries,
            'conversion_rate', conversion_rate,
            'period', 'Last 3 months'
        );
        RETURN NEXT;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_recent_activity() TO authenticated;
GRANT EXECUTE ON FUNCTION get_booking_calendar_data(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_dashboard_insights() TO authenticated;

-- Return a message to confirm successful creation
SELECT 'Admin dashboard management functions created successfully' AS result;