/*
# Unified Payments Table Migration

1. New Tables
  - `payments` - Unified payments table replacing stripe_orders and stripe_subscriptions
    - `id` (uuid) - Primary key
    - `user_id` (uuid) - Reference to user_core.id
    - `booking_id` (uuid) - Reference to bookings.id (optional)
    - `type` (text) - Type of payment (order, subscription)
    - `provider` (text) - Payment provider (stripe, paypal, etc.)
    - `provider_payment_id` (text) - Payment ID from provider
    - `provider_customer_id` (text) - Customer ID from provider
    - `amount` (numeric) - Amount of payment
    - `currency` (text) - Currency of payment
    - `status` (text) - Status of payment
    - `metadata` (jsonb) - Additional payment data
    - `created_at` (timestamptz) - When the payment was created
    - `updated_at` (timestamptz) - When the payment was last updated
    - `completed_at` (timestamptz) - When the payment was completed

2. Security
  - Enable RLS on `payments` table
  - Add policies for data access

3. Indexes
  - For efficient lookup by user, booking, and payment IDs
*/

-- Create the payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users_core(id) ON DELETE SET NULL,
  booking_id uuid,  -- Will be linked to bookings table once created
  type text NOT NULL CHECK (type = ANY (ARRAY['order', 'subscription', 'refund'])),
  provider text NOT NULL DEFAULT 'stripe',
  provider_payment_id text,  -- e.g., Stripe payment_intent_id or subscription_id
  provider_customer_id text,  -- e.g., Stripe customer_id
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  status text NOT NULL CHECK (status = ANY (ARRAY['pending', 'completed', 'failed', 'refunded', 'cancelled'])),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_provider_payment_id ON payments(provider_payment_id);
CREATE INDEX idx_payments_provider_customer_id ON payments(provider_customer_id);
CREATE INDEX idx_payments_type ON payments(type);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Create trigger for updating updated_at
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create RLS Policies
-- Allow users to view their own payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Allow admins to manage all payments
CREATE POLICY "Admins can manage all payments" ON payments
  FOR ALL TO authenticated
  USING (check_user_role('admin'::text));

-- Allow managers to view all payments
CREATE POLICY "Managers can view all payments" ON payments
  FOR SELECT TO authenticated
  USING (is_admin_or_manager());

-- Create a function to migrate existing payment data
CREATE OR REPLACE FUNCTION migrate_to_payments()
RETURNS void AS $$
BEGIN
  -- Migrate data from stripe_orders
  INSERT INTO payments (
    id,
    user_id,
    booking_id,
    type,
    provider,
    provider_payment_id,
    provider_customer_id,
    amount,
    currency,
    status,
    metadata,
    created_at,
    updated_at,
    completed_at
  )
  SELECT 
    gen_random_uuid(),
    uc.id AS user_id,
    so.booking_id,
    'order' AS type,
    'stripe' AS provider,
    so.payment_intent_id AS provider_payment_id,
    so.customer_id AS provider_customer_id,
    (so.amount_total / 100)::numeric(10,2) AS amount,  -- Convert from cents
    so.currency,
    CASE 
      WHEN so.status = 'completed' AND so.payment_status = 'paid' THEN 'completed'
      WHEN so.status = 'cancelled' THEN 'cancelled'
      ELSE 'pending'
    END AS status,
    jsonb_build_object(
      'checkout_session_id', so.checkout_session_id,
      'amount_subtotal', so.amount_subtotal,
      'original_order_id', so.id
    ) AS metadata,
    so.created_at,
    so.updated_at,
    CASE 
      WHEN so.status = 'completed' AND so.payment_status = 'paid' THEN so.updated_at
      ELSE NULL
    END AS completed_at
  FROM 
    stripe_orders so
    LEFT JOIN stripe_customers sc ON so.customer_id = sc.customer_id
    LEFT JOIN users_core uc ON sc.user_id = uc.id
  WHERE
    so.deleted_at IS NULL;

  -- Migrate data from stripe_subscriptions
  INSERT INTO payments (
    id,
    user_id,
    type,
    provider,
    provider_payment_id,
    provider_customer_id,
    amount,
    currency,
    status,
    metadata,
    created_at,
    updated_at,
    completed_at
  )
  SELECT 
    gen_random_uuid(),
    uc.id AS user_id,
    'subscription' AS type,
    'stripe' AS provider,
    ss.subscription_id AS provider_payment_id,
    ss.customer_id AS provider_customer_id,
    0::numeric(10,2) AS amount,  -- Subscription amount is handled differently
    'EUR' AS currency,  -- Default to EUR as currency isn't stored in stripe_subscriptions
    CASE 
      WHEN ss.status IN ('active', 'trialing') THEN 'completed'
      WHEN ss.status = 'canceled' THEN 'cancelled'
      ELSE 'pending'
    END AS status,
    jsonb_build_object(
      'price_id', ss.price_id,
      'current_period_start', ss.current_period_start,
      'current_period_end', ss.current_period_end,
      'cancel_at_period_end', ss.cancel_at_period_end,
      'payment_method_brand', ss.payment_method_brand,
      'payment_method_last4', ss.payment_method_last4,
      'original_subscription_id', ss.id
    ) AS metadata,
    ss.created_at,
    ss.updated_at,
    CASE 
      WHEN ss.status IN ('active', 'trialing') THEN ss.updated_at
      ELSE NULL
    END AS completed_at
  FROM 
    stripe_subscriptions ss
    LEFT JOIN stripe_customers sc ON ss.customer_id = sc.customer_id
    LEFT JOIN users_core uc ON sc.user_id = uc.id
  WHERE
    ss.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;