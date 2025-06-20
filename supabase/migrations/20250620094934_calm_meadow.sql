/*
  # Integrate Stripe Payment Processing

  1. New Tables
    - `stripe_customers` - Links Supabase users to Stripe customers
    - `stripe_subscriptions` - Stores subscription data for users
    - `stripe_orders` - Stores payment records for one-time purchases
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to view their own data
  
  3. Views
    - `stripe_user_subscriptions` - Secure view for users to access their subscription data
    - `stripe_user_orders` - Secure view for users to access their order data
*/

-- Create enum types only if they don't exist
DO $$ BEGIN
    CREATE TYPE stripe_subscription_status AS ENUM (
      'active',
      'canceled',
      'incomplete',
      'incomplete_expired',
      'not_started',
      'past_due',
      'paused',
      'trialing',
      'unpaid'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE stripe_order_status AS ENUM (
      'canceled',
      'completed',
      'pending'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Stripe Customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  customer_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Stripe Subscriptions table
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  customer_id TEXT UNIQUE NOT NULL,
  subscription_id TEXT,
  price_id TEXT,
  current_period_start BIGINT,
  current_period_end BIGINT,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  payment_method_brand TEXT,
  payment_method_last4 TEXT,
  status stripe_subscription_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Stripe Orders table
CREATE TABLE IF NOT EXISTS stripe_orders (
  id BIGSERIAL PRIMARY KEY,
  checkout_session_id TEXT NOT NULL,
  payment_intent_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  amount_subtotal BIGINT NOT NULL,
  amount_total BIGINT NOT NULL,
  currency TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  status stripe_order_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Enable Row Level Security
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;

-- Policies for stripe_customers
CREATE POLICY "Users can view their own customer data"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING ((user_id = auth.uid() OR user_id IS NULL) AND deleted_at IS NULL);

-- Policies for stripe_subscriptions
CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM stripe_customers 
      WHERE (user_id = auth.uid() OR user_id IS NULL) AND deleted_at IS NULL
    ) AND deleted_at IS NULL
  );

-- Policies for stripe_orders
CREATE POLICY "Users can view their own order data"
  ON stripe_orders
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM stripe_customers 
      WHERE (user_id = auth.uid() OR user_id IS NULL) AND deleted_at IS NULL
    ) AND deleted_at IS NULL
  );

-- Create views for easier querying
CREATE OR REPLACE VIEW stripe_user_subscriptions
WITH (security_invoker = true) AS
SELECT 
  sc.customer_id,
  ss.subscription_id,
  ss.status as subscription_status,
  ss.price_id,
  ss.current_period_start,
  ss.current_period_end,
  ss.cancel_at_period_end,
  ss.payment_method_brand,
  ss.payment_method_last4
FROM stripe_customers sc
JOIN stripe_subscriptions ss ON sc.customer_id = ss.customer_id
WHERE (sc.user_id = auth.uid() OR sc.user_id IS NULL)
  AND sc.deleted_at IS NULL 
  AND ss.deleted_at IS NULL;

CREATE OR REPLACE VIEW stripe_user_orders
WITH (security_invoker = true) AS
SELECT 
  sc.customer_id,
  so.id as order_id,
  so.checkout_session_id,
  so.payment_intent_id,
  so.amount_subtotal,
  so.amount_total,
  so.currency,
  so.payment_status,
  so.status as order_status,
  so.created_at as order_date
FROM stripe_customers sc
JOIN stripe_orders so ON sc.customer_id = so.customer_id
WHERE (sc.user_id = auth.uid() OR sc.user_id IS NULL)
  AND sc.deleted_at IS NULL 
  AND so.deleted_at IS NULL
ORDER BY so.created_at DESC;

-- Create function to update booking status upon successful payment
CREATE OR REPLACE FUNCTION update_booking_after_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- If the order status changed to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Check if there's a booking_id in metadata
    IF EXISTS (
      SELECT 1 FROM stripe_checkout_metadata 
      WHERE checkout_session_id = NEW.checkout_session_id 
      AND key = 'booking_id'
    ) THEN
      -- Update the reservation status
      UPDATE reservations 
      SET status = 'confirmed' 
      WHERE id = (
        SELECT value FROM stripe_checkout_metadata 
        WHERE checkout_session_id = NEW.checkout_session_id 
        AND key = 'booking_id'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order status changes
DROP TRIGGER IF EXISTS stripe_order_status_change ON stripe_orders;
CREATE TRIGGER stripe_order_status_change
AFTER UPDATE OF status ON stripe_orders
FOR EACH ROW
EXECUTE FUNCTION update_booking_after_payment();