/*
  # Inquiry Data Management Functions

  1. Purpose
     - Manages inquiry data across the system
     - Ensures data consistency and validation
     - Provides utilities for inquiry operations

  2. Features
     - Inquiry validation
     - Inquiry search functionality
     - Inquiry statistics
     - Inquiry processing utilities
*/

-- Create a function to update inquiry search vectors
CREATE OR REPLACE FUNCTION update_inquiries_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.customer_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.customer_email, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.company_name, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.subject, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.message, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger for updating inquiry search vectors
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_inquiries_search_vector' 
        AND tgrelid = 'unified_inquiries'::regclass
    ) THEN
        CREATE TRIGGER update_inquiries_search_vector
        BEFORE INSERT OR UPDATE ON unified_inquiries
        FOR EACH ROW
        EXECUTE FUNCTION update_inquiries_search_vector();
    END IF;
END $$;

-- Create a function to search for inquiries
CREATE OR REPLACE FUNCTION search_inquiries(search_term TEXT)
RETURNS TABLE (
    id UUID,
    type TEXT,
    status TEXT,
    priority TEXT,
    customer_name TEXT,
    customer_email TEXT,
    company_name TEXT,
    subject TEXT,
    message TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.type,
        i.status,
        i.priority,
        i.customer_name,
        i.customer_email,
        i.company_name,
        i.subject,
        i.message,
        i.created_at,
        i.updated_at
    FROM
        unified_inquiries i
    WHERE
        i.search_vector @@ plainto_tsquery('english', search_term) OR
        i.customer_name ILIKE '%' || search_term || '%' OR
        i.customer_email ILIKE '%' || search_term || '%' OR
        i.company_name ILIKE '%' || search_term || '%' OR
        i.subject ILIKE '%' || search_term || '%' OR
        i.message ILIKE '%' || search_term || '%'
    ORDER BY
        CASE
            WHEN i.customer_email = search_term THEN 1
            WHEN i.customer_email ILIKE search_term || '%' THEN 2
            WHEN i.customer_name ILIKE search_term || '%' THEN 3
            ELSE 4
        END,
        i.created_at DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get inquiry statistics
CREATE OR REPLACE FUNCTION get_inquiry_statistics()
RETURNS TABLE (
    total_inquiries BIGINT,
    new_inquiries BIGINT,
    in_progress_inquiries BIGINT,
    resolved_inquiries BIGINT,
    closed_inquiries BIGINT,
    contact_inquiries BIGINT,
    corporate_inquiries BIGINT,
    booking_support_inquiries BIGINT,
    avg_resolution_time_hours NUMERIC,
    inquiries_last_30_days BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) AS total_inquiries,
        COUNT(*) FILTER (WHERE status = 'new') AS new_inquiries,
        COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress_inquiries,
        COUNT(*) FILTER (WHERE status = 'resolved') AS resolved_inquiries,
        COUNT(*) FILTER (WHERE status = 'closed') AS closed_inquiries,
        COUNT(*) FILTER (WHERE type = 'contact') AS contact_inquiries,
        COUNT(*) FILTER (WHERE type = 'corporate') AS corporate_inquiries,
        COUNT(*) FILTER (WHERE type = 'booking_support') AS booking_support_inquiries,
        COALESCE(
            AVG(
                EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600
            ) FILTER (WHERE resolved_at IS NOT NULL),
            0
        ) AS avg_resolution_time_hours,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS inquiries_last_30_days
    FROM
        unified_inquiries;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to convert contact inquiries to bookings
CREATE OR REPLACE FUNCTION convert_inquiry_to_booking(
    inquiry_id UUID,
    booking_date DATE,
    time_slot TEXT,
    participants INT,
    total_price NUMERIC
)
RETURNS UUID AS $$
DECLARE
    new_booking_id UUID;
    inquiry_record RECORD;
BEGIN
    -- Get inquiry details
    SELECT * INTO inquiry_record
    FROM unified_inquiries
    WHERE id = inquiry_id;
    
    IF inquiry_record IS NULL THEN
        RAISE EXCEPTION 'Inquiry with ID % not found', inquiry_id;
    END IF;
    
    -- Create new booking
    INSERT INTO reservations (
        type,
        booking_date,
        time_slot,
        participants,
        total_price,
        customer_name,
        customer_email,
        customer_phone,
        status,
        booking_source,
        special_requests
    ) VALUES (
        'regular',
        booking_date,
        time_slot,
        participants,
        total_price,
        inquiry_record.customer_name,
        inquiry_record.customer_email,
        inquiry_record.customer_phone,
        'pending',
        'inquiry',
        inquiry_record.message
    )
    RETURNING id INTO new_booking_id;
    
    -- Update inquiry status
    UPDATE unified_inquiries
    SET 
        status = 'resolved',
        resolved_at = NOW(),
        related_booking_id = new_booking_id
    WHERE id = inquiry_id;
    
    RETURN new_booking_id;
EXCEPTION WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for inquiry summary
CREATE OR REPLACE VIEW inquiry_summary AS
SELECT
    i.id,
    i.type,
    i.status,
    i.priority,
    i.customer_name,
    i.customer_email,
    i.company_name,
    i.subject,
    i.message,
    i.participants_count,
    i.preferred_date,
    i.created_at,
    i.updated_at,
    cp.name AS package_name,
    cp.price AS package_price
FROM
    unified_inquiries i
LEFT JOIN
    corporate_packages cp ON i.package_id = cp.id;

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION search_inquiries(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_inquiry_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION convert_inquiry_to_booking(UUID, DATE, TEXT, INT, NUMERIC) TO authenticated;
GRANT SELECT ON inquiry_summary TO authenticated;

-- Return a message to confirm successful creation
SELECT 'Inquiry data management functions created successfully' AS result;