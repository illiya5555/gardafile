/*
# Payments Table Migration

1. New Tables
   - Creates a unified payments table to replace stripe_orders and stripe_subscriptions
   - Provides a single source of truth for all payment data

2. Data Migration
   - Migrates data from stripe_orders and stripe_subscriptions
   - Preserves all payment metadata and relationships

3. Indexes and Constraints
   - Adds appropriate indexes for payment lookups
   - Ensures data integrity with constraints
*/

-- Create payment status enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
        CREATE TYPE payment_status_enum AS ENUM (
            'pending', 'completed', 'canceled', 'not_started',
            'incomplete', 'incomplete_expired', 'trialing', 
            'active', 'past_due', 'unpaid', 'paused'
        );
    END IF;
END
$$;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT PRIMARY KEY,
    user_id UUID REFERENCES users_core(id) ON DELETE SET NULL,
    booking_id UUID,  -- Will be linked to bookings table later
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('order', 'subscription')),
    external_id TEXT NOT NULL, -- checkout_session_id or subscription_id
    amount_total NUMERIC(10,2),
    currency TEXT DEFAULT 'EUR',
    status payment_status_enum,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Create indexes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payments_user') THEN
        CREATE INDEX idx_payments_user ON payments(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payments_status') THEN
        CREATE INDEX idx_payments_status ON payments(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payments_created') THEN
        CREATE INDEX idx_payments_created ON payments(created_at);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payments_booking') THEN
        CREATE INDEX idx_payments_booking ON payments(booking_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_payments_external_id') THEN
        CREATE INDEX idx_payments_external_id ON payments(external_id);
    END IF;
END
$$;

-- Create trigger for updating timestamp
CREATE OR REPLACE FUNCTION update_payments_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_payments_timestamp') THEN
        CREATE TRIGGER trigger_update_payments_timestamp
        BEFORE UPDATE ON payments
        FOR EACH ROW
        EXECUTE FUNCTION update_payments_timestamp();
    END IF;
END
$$;

-- Migrate data from stripe_orders
INSERT INTO payments (
    id, user_id, booking_id, payment_type, external_id, 
    amount_total, currency, status, created_at, updated_at, deleted_at
)
SELECT 
    so.id,
    sc.user_id,
    so.booking_id,
    'order',
    so.checkout_session_id,
    so.amount_total::numeric / 100, -- Convert from cents to currency units
    so.currency,
    CASE 
        WHEN so.status = 'pending' THEN 'pending'::payment_status_enum
        WHEN so.status = 'completed' THEN 'completed'::payment_status_enum
        WHEN so.status = 'canceled' THEN 'canceled'::payment_status_enum
        ELSE 'pending'::payment_status_enum
    END,
    so.created_at,
    so.updated_at,
    so.deleted_at
FROM 
    stripe_orders so
LEFT JOIN 
    stripe_customers sc ON so.customer_id = sc.customer_id
WHERE 
    NOT EXISTS (SELECT 1 FROM payments WHERE id = so.id AND payment_type = 'order')
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    booking_id = COALESCE(EXCLUDED.booking_id, payments.booking_id),
    external_id = EXCLUDED.external_id,
    amount_total = EXCLUDED.amount_total,
    currency = EXCLUDED.currency,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Migrate data from stripe_subscriptions
INSERT INTO payments (
    id, user_id, payment_type, external_id, 
    status, created_at, updated_at, deleted_at,
    metadata
)
SELECT 
    ss.id,
    sc.user_id,
    'subscription',
    ss.subscription_id,
    ss.status,
    ss.created_at,
    ss.updated_at,
    ss.deleted_at,
    jsonb_build_object(
        'price_id', ss.price_id,
        'current_period_start', ss.current_period_start,
        'current_period_end', ss.current_period_end,
        'cancel_at_period_end', ss.cancel_at_period_end,
        'payment_method_brand', ss.payment_method_brand,
        'payment_method_last4', ss.payment_method_last4
    ) as metadata
FROM 
    stripe_subscriptions ss
LEFT JOIN 
    stripe_customers sc ON ss.customer_id = sc.customer_id
WHERE 
    NOT EXISTS (SELECT 1 FROM payments WHERE id = ss.id AND payment_type = 'subscription')
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    external_id = EXCLUDED.external_id,
    status = EXCLUDED.status,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- Add RLS policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view their own payments"
ON payments
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can view their own active payments (not deleted)
CREATE POLICY "Users can view their own active payments"
ON payments
FOR SELECT
TO authenticated
USING ((user_id = auth.uid()) AND (deleted_at IS NULL));