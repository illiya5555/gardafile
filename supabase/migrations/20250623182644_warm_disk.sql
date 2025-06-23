/*
# Dashboard Statistics and Search Vector Optimization

1. New Indexes
   - Multiple indexes for performance optimization on various tables
   
2. Dashboard Statistics
   - Materialized views for dashboard metrics
   - Trigger-based refresh mechanism
   
3. Search Vector Updates
   - Functions and triggers for search optimization
   - Support for testimonials and customer data
*/

-- Add indexes for better query performance where missing
CREATE INDEX IF NOT EXISTS idx_reservations_date_status ON reservations(booking_date, status);
CREATE INDEX IF NOT EXISTS idx_reservations_customer_email ON reservations(customer_email);
CREATE INDEX IF NOT EXISTS idx_time_slots_date_active ON time_slots(date, is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_unified_inquiries_status ON unified_inquiries(status);

-- Drop the function with CASCADE to handle dependent objects
DROP FUNCTION IF EXISTS refresh_dashboard_stats() CASCADE;

-- Create or replace materialized view for dashboard stats
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT
  COUNT(*) AS total_bookings,
  (SELECT COUNT(*) FROM time_slots WHERE is_active = true) AS active_time_slots,
  COALESCE(SUM(CASE WHEN status IN ('confirmed', 'completed') THEN total_price ELSE 0 END), 0) AS total_revenue,
  (SELECT COUNT(*) FROM testimonials WHERE is_featured = true) AS featured_testimonials,
  (SELECT COUNT(*) FROM unified_inquiries WHERE status = 'new') AS pending_inquiries,
  now() AS last_updated
FROM reservations;

-- Create a function to refresh the materialized view with TRIGGER return type
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW dashboard_stats;
  REFRESH MATERIALIZED VIEW IF EXISTS unified_dashboard_stats;
  RETURN NULL; -- For STATEMENT-level triggers, return value is ignored
END;
$$ LANGUAGE plpgsql;

-- Create a better unified dashboard stats view with more metrics
CREATE MATERIALIZED VIEW IF NOT EXISTS unified_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM reservations WHERE type = 'regular') AS total_regular_bookings,
  (SELECT COUNT(*) FROM reservations WHERE type = 'corporate') AS total_corporate_bookings,
  (SELECT COUNT(*) FROM reservations WHERE status = 'pending') AS pending_bookings,
  (SELECT COUNT(*) FROM reservations WHERE status = 'confirmed') AS confirmed_bookings,
  COALESCE(SUM(CASE WHEN status IN ('confirmed', 'completed') THEN total_price ELSE 0 END), 0) AS total_revenue,
  CASE 
    WHEN COUNT(*) > 0 THEN ROUND(COALESCE(SUM(CASE WHEN status IN ('confirmed', 'completed') THEN total_price ELSE 0 END), 0) / COUNT(*), 2)
    ELSE 0 
  END AS avg_booking_value,
  (SELECT COUNT(*) FROM unified_customers) AS total_customers,
  (SELECT COUNT(*) FROM unified_customers WHERE created_at >= NOW() - INTERVAL '30 days') AS new_customers_30d,
  (SELECT COUNT(*) FROM unified_inquiries WHERE type = 'contact' AND status = 'new') AS pending_contact_inquiries,
  (SELECT COUNT(*) FROM unified_inquiries WHERE type = 'corporate' AND status = 'new') AS pending_corporate_inquiries,
  (SELECT COUNT(*) FROM time_slots WHERE is_active = true) AS active_time_slots,
  now() AS last_updated
FROM reservations;

-- Create trigger to automatically refresh dashboard stats after relevant changes
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'refresh_dashboard_stats_trigger') THEN
    CREATE TRIGGER refresh_dashboard_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON reservations
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_dashboard_stats();
  END IF;
END $$;

-- Create function to optimize search vector updates for testimonials
CREATE OR REPLACE FUNCTION update_testimonials_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.text, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for testimonials search vector update
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'testimonials_search_vector_update') THEN
    CREATE TRIGGER testimonials_search_vector_update
    BEFORE INSERT OR UPDATE ON testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_testimonials_search_vector();
  END IF;
END $$;

-- Create a general function to update search vectors for other tables
CREATE OR REPLACE FUNCTION update_search_vectors()
RETURNS TRIGGER AS $$
BEGIN
  -- Update search_vector field based on table name
  IF TG_TABLE_NAME = 'unified_customers' THEN
    NEW.search_vector = 
      setweight(to_tsvector('english', COALESCE(NEW.first_name, '')), 'A') ||
      setweight(to_tsvector('english', COALESCE(NEW.last_name, '')), 'A') ||
      setweight(to_tsvector('english', COALESCE(NEW.email, '')), 'B') ||
      setweight(to_tsvector('english', COALESCE(NEW.company_name, '')), 'C');
  ELSIF TG_TABLE_NAME = 'unified_inquiries' THEN
    NEW.search_vector = 
      setweight(to_tsvector('english', COALESCE(NEW.customer_name, '')), 'A') ||
      setweight(to_tsvector('english', COALESCE(NEW.customer_email, '')), 'A') ||
      setweight(to_tsvector('english', COALESCE(NEW.company_name, '')), 'B') ||
      setweight(to_tsvector('english', COALESCE(NEW.subject, '')), 'B') ||
      setweight(to_tsvector('english', COALESCE(NEW.message, '')), 'C');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating search vectors
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_customers_search_vector') THEN
    CREATE TRIGGER update_customers_search_vector
    BEFORE INSERT OR UPDATE ON unified_customers
    FOR EACH ROW
    EXECUTE FUNCTION update_search_vectors();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_inquiries_search_vector') THEN
    CREATE TRIGGER update_inquiries_search_vector
    BEFORE INSERT OR UPDATE ON unified_inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_search_vectors();
  END IF;
END $$;