/*
# Unified Bookings Table Migration

1. New Tables
   - Creates a unified bookings table to replace reservations and yacht_bookings
   - Provides a single source of truth for all booking data

2. Data Migration
   - Migrates data from reservations and yacht_bookings
   - Preserves all booking metadata and relationships

3. Indexes and Constraints
   - Adds appropriate indexes for booking lookups
   - Ensures data integrity with constraints
*/

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users_core(id) ON DELETE SET NULL,
    booking_type VARCHAR(20) NOT NULL CHECK (booking_type IN ('sailing', 'yacht', 'private_event')),
    start_date DATE NOT NULL,
    end_date DATE,
    time_slot TEXT,
    participants INT NOT NULL CHECK (participants BETWEEN 1 AND 10),
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    special_requests TEXT,
    reference_code TEXT,
    metadata JSONB,
    email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT valid_customer_email CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookings_user') THEN
        CREATE INDEX idx_bookings_user ON bookings(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookings_date_range') THEN
        CREATE INDEX idx_bookings_date_range ON bookings(start_date, end_date);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookings_status') THEN
        CREATE INDEX idx_bookings_status ON bookings(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookings_email') THEN
        CREATE INDEX idx_bookings_email ON bookings(customer_email);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookings_type') THEN
        CREATE INDEX idx_bookings_type ON bookings(booking_type);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookings_created') THEN
        CREATE INDEX idx_bookings_created ON bookings(created_at);
    END IF;
END
$$;

-- Create trigger for updating timestamp
CREATE OR REPLACE FUNCTION update_bookings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_bookings_timestamp') THEN
        CREATE TRIGGER trigger_update_bookings_timestamp
        BEFORE UPDATE ON bookings
        FOR EACH ROW
        EXECUTE FUNCTION update_bookings_timestamp();
    END IF;
END
$$;

-- Migrate data from reservations
INSERT INTO bookings (
    id, user_id, booking_type, start_date, time_slot, 
    participants, price, status, customer_name, customer_email, 
    customer_phone, special_requests, email_sent, created_at, updated_at
)
SELECT 
    id,
    user_id,
    'sailing',
    booking_date,
    time_slot,
    participants,
    total_price,
    status,
    customer_name,
    customer_email,
    customer_phone,
    special_requests,
    email_sent,
    created_at,
    updated_at
FROM 
    reservations
WHERE 
    NOT EXISTS (SELECT 1 FROM bookings WHERE id = reservations.id)
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    booking_type = EXCLUDED.booking_type,
    start_date = EXCLUDED.start_date,
    time_slot = EXCLUDED.time_slot,
    participants = EXCLUDED.participants,
    price = EXCLUDED.price,
    status = EXCLUDED.status,
    customer_name = EXCLUDED.customer_name,
    customer_email = EXCLUDED.customer_email,
    customer_phone = EXCLUDED.customer_phone,
    special_requests = EXCLUDED.special_requests,
    email_sent = EXCLUDED.email_sent,
    updated_at = NOW();

-- Migrate data from yacht_bookings
INSERT INTO bookings (
    id, user_id, booking_type, start_date, end_date,
    participants, price, status, customer_name, customer_email,
    customer_phone, created_at, updated_at
)
SELECT 
    id,
    user_id,
    'yacht',
    start_date,
    end_date,
    participants,
    total_price,
    status,
    customer_name,
    customer_email,
    customer_phone,
    created_at,
    updated_at
FROM 
    yacht_bookings
WHERE 
    NOT EXISTS (SELECT 1 FROM bookings WHERE id = yacht_bookings.id)
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    booking_type = EXCLUDED.booking_type,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    participants = EXCLUDED.participants,
    price = EXCLUDED.price,
    status = EXCLUDED.status,
    customer_name = EXCLUDED.customer_name,
    customer_email = EXCLUDED.customer_email,
    customer_phone = EXCLUDED.customer_phone,
    updated_at = NOW();

-- Add RLS policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public can create bookings
CREATE POLICY "Public can create bookings"
ON bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (
    customer_name IS NOT NULL AND
    customer_email IS NOT NULL AND
    customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
    participants >= 1 AND
    participants <= 10 AND
    price > 0 AND
    start_date IS NOT NULL
);

-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings"
ON bookings
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR
    customer_email = (SELECT email FROM users_core WHERE id = auth.uid())
);

-- Anonymous users can view bookings by email (for confirmation pages)
CREATE POLICY "Anonymous users can view bookings by reference"
ON bookings
FOR SELECT
TO anon
USING (reference_code IS NOT NULL);

-- Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings"
ON bookings
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users_core u
        JOIN user_roles r ON u.role_id = r.id
        WHERE u.id = auth.uid() AND r.role_name IN ('admin', 'manager')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users_core u
        JOIN user_roles r ON u.role_id = r.id
        WHERE u.id = auth.uid() AND r.role_name IN ('admin', 'manager')
    )
);