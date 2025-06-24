/*
# Users Core Table Migration

1. New Tables
  - `users_core` - Unified user data table combining profiles, unified_customers, and stripe_customers
    - `id` (uuid) - Primary key, linked to auth.users
    - `email` (text) - User's email address
    - `first_name` (text) - User's first name
    - `last_name` (text) - User's last name
    - `full_name` (text) - Computed full name
    - `phone` (text) - User's phone number
    - `role_id` (uuid) - Reference to user role
    - `country_code` (text) - User's country code
    - `preferred_language` (text) - User's preferred language
    - `marketing_consent` (boolean) - Whether user has consented to marketing
    - `company_name` (text) - User's company name (for corporate clients)
    - `company_position` (text) - User's position in company
    - `total_bookings` (integer) - Total number of bookings
    - `total_spent` (numeric) - Total amount spent
    - `last_booking_date` (date) - Date of last booking
    - `source` (text) - How the user was acquired
    - `notes` (text) - Internal notes about the user
    - `stripe_customer_id` (text) - Stripe customer ID
    - `created_at` (timestamptz) - When the user was created
    - `updated_at` (timestamptz) - When the user was last updated
    - `search_vector` (tsvector) - Search vector for full text search

2. Security
  - Enable RLS on `users_core` table
  - Add policies for data access

3. Triggers
  - Update search vector on insert or update
  - Update updated_at column on update
  - Create user in users_core when auth.user is created
*/

-- Create the users_core table
CREATE TABLE IF NOT EXISTS users_core (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  first_name text,
  last_name text,
  full_name text GENERATED ALWAYS AS (
    CASE
      WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN first_name || ' ' || last_name
      WHEN first_name IS NOT NULL THEN first_name
      WHEN last_name IS NOT NULL THEN last_name
      ELSE NULL
    END
  ) STORED,
  phone text,
  role_id uuid REFERENCES user_roles(id) ON DELETE SET NULL,
  country_code text,
  preferred_language text DEFAULT 'en'::text,
  marketing_consent boolean DEFAULT false,
  company_name text,
  company_position text,
  total_bookings integer DEFAULT 0,
  total_spent numeric(10,2) DEFAULT 0,
  last_booking_date date,
  source text DEFAULT 'website'::text CHECK (source = ANY (ARRAY['website'::text, 'phone'::text, 'email'::text, 'social_media'::text, 'referral'::text])),
  notes text,
  stripe_customer_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  search_vector tsvector
);

-- Enable Row Level Security
ALTER TABLE users_core ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_users_core_email ON users_core USING btree (email);
CREATE INDEX idx_users_core_role_id ON users_core USING btree (role_id);
CREATE INDEX idx_users_core_company ON users_core USING btree (company_name) WHERE (company_name IS NOT NULL);
CREATE INDEX idx_users_core_stats ON users_core USING btree (total_bookings, total_spent);
CREATE INDEX idx_users_core_search ON users_core USING gin (search_vector);

-- Create trigger for updating search_vector
CREATE OR REPLACE FUNCTION update_users_core_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('simple', coalesce(NEW.email, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.first_name, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.last_name, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.company_name, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(NEW.phone, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_core_search_vector
BEFORE INSERT OR UPDATE ON users_core
FOR EACH ROW
EXECUTE FUNCTION update_users_core_search_vector();

-- Create trigger for updating updated_at
CREATE TRIGGER update_users_core_updated_at
BEFORE UPDATE ON users_core
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create RLS Policies
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON users_core
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users_core
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow admins to manage all profiles
CREATE POLICY "Admins can manage all profiles" ON users_core
  FOR ALL TO authenticated
  USING (check_user_role('admin'::text))
  WITH CHECK (check_user_role('admin'::text));

-- Allow managers to view all profiles
CREATE POLICY "Managers can view all profiles" ON users_core
  FOR SELECT TO authenticated
  USING (is_admin_or_manager());

-- Allow managers to update non-admin profiles
CREATE POLICY "Managers can update non-admin profiles" ON users_core
  FOR UPDATE TO authenticated
  USING (can_manager_update_profile(id))
  WITH CHECK (can_manager_update_profile(id));

-- Create a function to migrate existing user data
CREATE OR REPLACE FUNCTION migrate_to_users_core()
RETURNS void AS $$
BEGIN
  -- First migrate data from profiles
  INSERT INTO users_core (
    id, email, first_name, last_name, phone, role_id, created_at, updated_at
  )
  SELECT 
    p.id, p.email, p.first_name, p.last_name, p.phone, p.role_id, p.created_at, p.updated_at
  FROM 
    profiles p
  ON CONFLICT (id) DO NOTHING;
  
  -- Then update with data from unified_customers
  UPDATE users_core uc
  SET 
    email = COALESCE(uc.email, c.email),
    first_name = COALESCE(uc.first_name, c.first_name),
    last_name = COALESCE(uc.last_name, c.last_name),
    phone = COALESCE(uc.phone, c.phone),
    country_code = c.country_code,
    preferred_language = c.preferred_language,
    marketing_consent = c.marketing_consent,
    company_name = c.company_name,
    company_position = c.company_position,
    total_bookings = c.total_bookings,
    total_spent = c.total_spent,
    last_booking_date = c.last_booking_date,
    source = c.source,
    notes = c.notes,
    created_at = LEAST(uc.created_at, c.created_at),
    updated_at = GREATEST(uc.updated_at, c.updated_at)
  FROM 
    unified_customers c
  WHERE 
    uc.email = c.email;
  
  -- Update with data from stripe_customers
  UPDATE users_core uc
  SET 
    stripe_customer_id = sc.customer_id
  FROM 
    stripe_customers sc
  WHERE 
    uc.id = sc.user_id AND sc.deleted_at IS NULL;

  -- Insert any missing customers from unified_customers who don't have auth accounts yet
  INSERT INTO users_core (
    id, email, first_name, last_name, phone, 
    country_code, preferred_language, marketing_consent,
    company_name, company_position, total_bookings,
    total_spent, last_booking_date, source, notes,
    created_at, updated_at
  )
  SELECT 
    c.id, c.email, c.first_name, c.last_name, c.phone,
    c.country_code, c.preferred_language, c.marketing_consent,
    c.company_name, c.company_position, c.total_bookings,
    c.total_spent, c.last_booking_date, c.source, c.notes,
    c.created_at, c.updated_at
  FROM 
    unified_customers c
  WHERE 
    NOT EXISTS (SELECT 1 FROM users_core uc WHERE uc.email = c.email)
  ON CONFLICT (id) DO NOTHING;
  
  -- Update search vectors
  UPDATE users_core
  SET search_vector = 
    setweight(to_tsvector('simple', coalesce(email, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(first_name, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(last_name, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(company_name, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(phone, '')), 'D');
END;
$$ LANGUAGE plpgsql;