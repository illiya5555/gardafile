/*
# Booking Statistics Views

1. Purpose
  - Provides easy access to booking statistics
  - Optimizes common dashboard queries
  - Consolidates data from multiple tables

2. Views
  - booking_summary - Comprehensive view of all booking details
  - booking_availability - Current availability for calendar display
  - booking_stats - Aggregated statistics by user, date, etc.
*/

-- Create booking summary view
CREATE OR REPLACE VIEW booking_summary AS
SELECT
  b.id,
  b.booking_type,
  b.date,
  b.time_slot,
  b.start_time,
  b.end_time,
  b.end_date,
  b.participants,
  b.total_price,
  b.status,
  b.created_at,
  b.customer_name,
  b.customer_email,
  b.customer_phone,
  b.special_requests,
  b.yacht_id,
  y.name AS yacht_name,
  y.model AS yacht_model,
  ts.max_participants AS slot_capacity,
  ts.price_per_person AS slot_price,
  u.company_name,
  u.first_name || ' ' || u.last_name AS user_full_name
FROM
  bookings b
LEFT JOIN
  yachts y ON b.yacht_id = y.id
LEFT JOIN
  time_slots ts ON b.date = ts.date AND b.time_slot = ts.time
LEFT JOIN
  users_core u ON b.user_id = u.id;

-- Create booking availability view
CREATE OR REPLACE VIEW booking_availability AS
SELECT
  ts.id AS time_slot_id,
  ts.date,
  ts.time,
  ts.max_participants,
  ts.price_per_person,
  ts.is_active,
  COALESCE(SUM(b.participants), 0) AS booked_participants,
  ts.max_participants - COALESCE(SUM(b.participants), 0) AS available_capacity,
  CASE 
    WHEN ts.max_participants - COALESCE(SUM(b.participants), 0) <= 0 THEN false
    ELSE true
  END AS has_availability,
  COUNT(b.id) AS booking_count
FROM
  time_slots ts
LEFT JOIN
  bookings b ON ts.date = b.date 
             AND ts.time = b.time_slot
             AND b.booking_type = 'sailing'
             AND b.status IN ('pending', 'confirmed')
GROUP BY
  ts.id, ts.date, ts.time, ts.max_participants, ts.price_per_person, ts.is_active;

-- Create booking statistics view
CREATE OR REPLACE VIEW booking_statistics AS
SELECT
  -- Time periods
  DATE_TRUNC('day', b.date) AS day,
  DATE_TRUNC('week', b.date) AS week,
  DATE_TRUNC('month', b.date) AS month,
  DATE_TRUNC('quarter', b.date) AS quarter,
  DATE_TRUNC('year', b.date) AS year,
  
  -- Dimensions
  b.booking_type,
  b.status,
  
  -- Metrics
  COUNT(b.id) AS booking_count,
  SUM(b.participants) AS total_participants,
  SUM(b.total_price) AS total_revenue,
  AVG(b.total_price) AS avg_booking_value,
  
  -- Customer metrics
  COUNT(DISTINCT b.user_id) AS unique_customers,
  COUNT(DISTINCT b.customer_email) AS unique_emails,
  
  -- Conversion metrics (assuming 'pending' -> 'confirmed' is a conversion)
  SUM(CASE WHEN b.status = 'confirmed' THEN 1 ELSE 0 END)::float / 
    NULLIF(COUNT(CASE WHEN b.status IN ('pending', 'confirmed') THEN 1 END), 0) AS conversion_rate
FROM
  bookings b
WHERE
  b.date >= CURRENT_DATE - INTERVAL '365 days'
GROUP BY
  DATE_TRUNC('day', b.date),
  DATE_TRUNC('week', b.date),
  DATE_TRUNC('month', b.date),
  DATE_TRUNC('quarter', b.date),
  DATE_TRUNC('year', b.date),
  b.booking_type,
  b.status;

-- Create customer booking stats view
CREATE OR REPLACE VIEW customer_booking_stats AS
SELECT
  b.user_id,
  b.customer_email,
  uc.first_name,
  uc.last_name,
  uc.full_name,
  uc.company_name,
  COUNT(b.id) AS total_bookings,
  SUM(b.total_price) AS total_spent,
  MAX(b.date) AS last_booking_date,
  COUNT(DISTINCT b.booking_type) AS booking_type_count,
  COUNT(*) FILTER (WHERE b.status = 'confirmed') AS confirmed_bookings,
  COUNT(*) FILTER (WHERE b.status = 'pending') AS pending_bookings,
  COUNT(*) FILTER (WHERE b.status = 'cancelled') AS cancelled_bookings,
  COUNT(*) FILTER (WHERE b.date >= CURRENT_DATE - INTERVAL '30 days') AS bookings_last_30_days,
  MIN(b.date) AS first_booking_date,
  AVG(b.total_price) AS avg_booking_value
FROM
  bookings b
LEFT JOIN
  users_core uc ON b.user_id = uc.id OR b.customer_email = uc.email
GROUP BY
  b.user_id, b.customer_email, uc.first_name, uc.last_name, uc.full_name, uc.company_name;