/*
# Unified Inquiries Table Migration

1. Structure Standardization
  - `inquiries` - Standardized from unified_inquiries with improved structure
    - `id` (uuid) - Primary key
    - `type` (text) - Inquiry type (contact, corporate, support)
    - `status` (text) - Inquiry status
    - `priority` (text) - Inquiry priority
    - `customer_id` (uuid) - Reference to users_core.id if available
    - `customer_name` (text) - Name of customer
    - `customer_email` (text) - Email of customer
    - `customer_phone` (text) - Phone of customer
    - `company_name` (text) - Company name for corporate inquiries
    - `contact_person` (text) - Contact person for corporate inquiries
    - `subject` (text) - Subject of inquiry
    - `message` (text) - Message content
    - `package_id` (uuid) - Reference to corporate_packages.id for corporate inquiries
    - `participants_count` (integer) - Number of participants for corporate inquiries
    - `preferred_date` (date) - Preferred date for corporate inquiries
    - `estimated_budget` (numeric) - Estimated budget for corporate inquiries
    - `related_booking_id` (uuid) - Reference to bookings.id for support inquiries
    - `source` (text) - Inquiry source
    - `assigned_to` (text) - Staff assigned to handle the inquiry
    - `internal_notes` (text) - Internal notes
    - `created_at` (timestamptz) - When the inquiry was created
    - `updated_at` (timestamptz) - When the inquiry was last updated
    - `resolved_at` (timestamptz) - When the inquiry was resolved
    - `search_vector` (tsvector) - Search vector for full text search

2. Security
  - Enable RLS on `inquiries` table
  - Add policies for data access

3. Indexes
  - For efficient lookup and search
*/

-- Create the inquiries table (renamed from unified_inquiries for clarity)
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type = ANY (ARRAY['contact', 'corporate', 'support'])),
  status text DEFAULT 'new'::text CHECK (status = ANY (ARRAY['new', 'pending', 'in_progress', 'resolved', 'closed'])),
  priority text DEFAULT 'normal'::text CHECK (priority = ANY (ARRAY['low', 'normal', 'high', 'urgent'])),
  customer_id uuid REFERENCES users_core(id) ON DELETE SET NULL,
  customer_name text,
  customer_email text NOT NULL,
  customer_phone text,
  company_name text,
  contact_person text,
  subject text,
  message text,
  package_id uuid REFERENCES corporate_packages(id) ON DELETE SET NULL,
  participants_count integer,
  preferred_date date,
  estimated_budget numeric(10,2),
  related_booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  source text DEFAULT 'website'::text CHECK (source = ANY (ARRAY['website', 'phone', 'email', 'social_media', 'referral'])),
  assigned_to text,
  internal_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  search_vector tsvector
);

-- Enable Row Level Security
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_inquiries_type ON inquiries(type);
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_customer_id ON inquiries(customer_id);
CREATE INDEX idx_inquiries_customer_email ON inquiries(customer_email);
CREATE INDEX idx_inquiries_company ON inquiries(company_name) WHERE company_name IS NOT NULL;
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);
CREATE INDEX idx_inquiries_package_id ON inquiries(package_id) WHERE package_id IS NOT NULL;
CREATE INDEX idx_inquiries_related_booking_id ON inquiries(related_booking_id) WHERE related_booking_id IS NOT NULL;
CREATE INDEX idx_inquiries_search ON inquiries USING gin (search_vector);

-- Create trigger for updating search_vector
CREATE OR REPLACE FUNCTION update_inquiries_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('simple', coalesce(NEW.customer_email, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.customer_name, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.company_name, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.subject, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(NEW.message, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inquiries_search_vector
BEFORE INSERT OR UPDATE ON inquiries
FOR EACH ROW
EXECUTE FUNCTION update_inquiries_search_vector();

-- Create trigger for updating updated_at
CREATE TRIGGER update_inquiries_updated_at
BEFORE UPDATE ON inquiries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create RLS Policies
-- Allow authenticated users to insert inquiries
CREATE POLICY "Authenticated can insert inquiries" ON inquiries
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Allow anonymous users to insert inquiries
CREATE POLICY "Anonymous can insert inquiries" ON inquiries
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow public to read inquiries
CREATE POLICY "Public can read inquiries" ON inquiries
  FOR SELECT TO public
  USING (true);

-- Allow admins to manage all inquiries
CREATE POLICY "Admins can manage inquiries" ON inquiries
  FOR ALL TO authenticated
  USING (check_user_role('admin'::text))
  WITH CHECK (check_user_role('admin'::text));

-- Allow managers to view and update inquiries
CREATE POLICY "Managers can manage inquiries" ON inquiries
  FOR ALL TO authenticated
  USING (is_admin_or_manager())
  WITH CHECK (is_admin_or_manager());

-- Create a function to migrate existing inquiry data
CREATE OR REPLACE FUNCTION migrate_to_inquiries()
RETURNS void AS $$
BEGIN
  -- Migrate data from unified_inquiries
  INSERT INTO inquiries (
    id,
    type,
    status,
    priority,
    customer_name,
    customer_email,
    customer_phone,
    company_name,
    contact_person,
    subject,
    message,
    package_id,
    participants_count,
    preferred_date,
    estimated_budget,
    related_booking_id,
    source,
    assigned_to,
    internal_notes,
    created_at,
    updated_at,
    resolved_at
  )
  SELECT 
    ui.id,
    ui.type,
    ui.status,
    ui.priority,
    ui.customer_name,
    ui.customer_email,
    ui.customer_phone,
    ui.company_name,
    ui.contact_person,
    ui.subject,
    ui.message,
    ui.package_id,
    ui.participants_count,
    ui.preferred_date,
    ui.estimated_budget,
    ui.related_booking_id,
    ui.source,
    ui.assigned_to,
    ui.internal_notes,
    ui.created_at,
    ui.updated_at,
    ui.resolved_at
  FROM 
    unified_inquiries ui;
  
  -- Link inquiries to users_core by email if possible
  UPDATE inquiries i
  SET customer_id = uc.id
  FROM users_core uc
  WHERE i.customer_email = uc.email AND i.customer_id IS NULL;
  
  -- Update search vectors
  UPDATE inquiries
  SET search_vector = 
    setweight(to_tsvector('simple', coalesce(customer_email, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(customer_name, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(company_name, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(subject, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(message, '')), 'D');
END;
$$ LANGUAGE plpgsql;