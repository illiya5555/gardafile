/*
# User Data Migration

1. New Tables
   - This migration transfers data from existing user tables to the new unified structure
   - Ensures all user data is preserved during the migration

2. Data Migration
   - Migrates profiles, unified_customers, and stripe_customers to users_core
   - Preserves all user metadata and statistics

3. Indexes and Constraints
   - Adds appropriate indexes for performance optimization
   - Ensures data integrity with constraints
*/

-- Create users_core table if it doesn't exist yet
CREATE TABLE IF NOT EXISTS users_core (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    role_id UUID REFERENCES user_roles(id),
    total_bookings INT DEFAULT 0,
    total_spent NUMERIC(10,2) DEFAULT 0,
    last_booking_date DATE,
    stripe_customer_id TEXT,
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_core_email') THEN
        CREATE INDEX idx_users_core_email ON users_core(email);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_core_role') THEN
        CREATE INDEX idx_users_core_role ON users_core(role_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_core_search') THEN
        CREATE INDEX idx_users_core_search ON users_core USING GIN(search_vector);
    END IF;
END
$$;

-- Create trigger for updating search vector
CREATE OR REPLACE FUNCTION update_users_core_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.first_name, '') || ' ' || 
        COALESCE(NEW.last_name, '') || ' ' || 
        COALESCE(NEW.email, '') || ' ' ||
        COALESCE(NEW.phone, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE OR REPLACE FUNCTION update_users_core_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_users_core_search') THEN
        CREATE TRIGGER trigger_update_users_core_search
        BEFORE INSERT OR UPDATE ON users_core
        FOR EACH ROW
        EXECUTE FUNCTION update_users_core_search_vector();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_users_core_timestamp') THEN
        CREATE TRIGGER trigger_update_users_core_timestamp
        BEFORE UPDATE ON users_core
        FOR EACH ROW
        EXECUTE FUNCTION update_users_core_timestamp();
    END IF;
END
$$;

-- Migrate data from profiles, unified_customers, and stripe_customers
INSERT INTO users_core (
    id, email, first_name, last_name, phone, role_id, 
    total_bookings, total_spent, last_booking_date, 
    stripe_customer_id, created_at, updated_at
)
SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    COALESCE(p.phone, uc.phone),
    p.role_id,
    COALESCE(uc.total_bookings, 0),
    COALESCE(uc.total_spent, 0),
    uc.last_booking_date,
    sc.customer_id,
    p.created_at,
    p.updated_at
FROM 
    profiles p
LEFT JOIN 
    unified_customers uc ON p.email = uc.email
LEFT JOIN 
    stripe_customers sc ON p.id = sc.user_id
WHERE 
    NOT EXISTS (SELECT 1 FROM users_core WHERE id = p.id)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, users_core.first_name),
    last_name = COALESCE(EXCLUDED.last_name, users_core.last_name),
    phone = COALESCE(EXCLUDED.phone, users_core.phone),
    role_id = COALESCE(EXCLUDED.role_id, users_core.role_id),
    total_bookings = COALESCE(EXCLUDED.total_bookings, users_core.total_bookings),
    total_spent = COALESCE(EXCLUDED.total_spent, users_core.total_spent),
    last_booking_date = COALESCE(EXCLUDED.last_booking_date, users_core.last_booking_date),
    stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, users_core.stripe_customer_id),
    updated_at = NOW();

-- Add any missing customers from unified_customers that don't have profiles
INSERT INTO users_core (
    id, email, first_name, last_name, phone,
    total_bookings, total_spent, last_booking_date,
    created_at, updated_at
)
SELECT 
    gen_random_uuid() as id,
    uc.email,
    uc.first_name,
    uc.last_name,
    uc.phone,
    uc.total_bookings,
    uc.total_spent,
    uc.last_booking_date,
    uc.created_at,
    uc.updated_at
FROM 
    unified_customers uc
WHERE 
    NOT EXISTS (SELECT 1 FROM users_core WHERE email = uc.email)
    AND uc.email IS NOT NULL
ON CONFLICT (email) DO UPDATE SET
    first_name = COALESCE(EXCLUDED.first_name, users_core.first_name),
    last_name = COALESCE(EXCLUDED.last_name, users_core.last_name),
    phone = COALESCE(EXCLUDED.phone, users_core.phone),
    total_bookings = COALESCE(EXCLUDED.total_bookings, users_core.total_bookings),
    total_spent = COALESCE(EXCLUDED.total_spent, users_core.total_spent),
    last_booking_date = COALESCE(EXCLUDED.last_booking_date, users_core.last_booking_date),
    updated_at = NOW();

-- Update search vectors for all users
UPDATE users_core SET updated_at = updated_at WHERE id IS NOT NULL;