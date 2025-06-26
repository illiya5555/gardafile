/*
# Unified Bookings Table Migration

1. New Tables
  - `bookings` - Unified bookings table replacing reservations and yacht_bookings
    - `id` (uuid) - Primary key
    - `user_id` (uuid) - Reference to users_core.id
    - `booking_type` (text) - Type of booking (sailing, yacht)
    - `status` (text) - Status of booking
    - `customer_name` (text) - Name of customer
    - `customer_email` (text) - Email of customer
    - `customer_phone` (text) - Phone of customer
    - `date` (date) - Date of booking
    - `time_slot` (text) - Time slot for sailing bookings
    - `start_time` (time) - Start time for yacht bookings
    - `end_time` (time) - End time for yacht bookings
    - `end_date` (date) - End date for multi-day yacht bookings
    - `participants` (integer) - Number of participants
    - `total_price` (numeric) - Total price of booking
    - `special_requests` (text) - Special requests
    - `yacht_id` (uuid) - Reference to yachts.id for yacht bookings
    - `source` (text) - Booking source
    - `notes` (text) - Internal notes
    - `created_at` (timestamptz) - When the booking was created
    - `updated_at` (timestamptz) - When the booking was last updated
    - `email_sent` (boolean) - Whether confirmation email was sent

2. Security
  - Enable RLS on `bookings` table
  - Add policies for data access

3. Indexes
  - For efficient lookup by user, date, status, etc.
*/

-- Create the bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users_core(id) ON DELETE SET NULL,
  booking_type text NOT NULL CHECK (booking_type = ANY (ARRAY['sailing', 'yacht'])),
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending', 'confirmed', 'cancelled', 'completed'])),
  customer_name text NOT NULL,
  customer_email text NOT NULL CHECK (customer_email ~* '^[a-zA-Z0-9.!#$%&''*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'),
  customer_phone text,
  date date NOT NULL,  -- Primary booking date
  time_slot text CHECK (time_slot IS NULL OR time_slot = ANY (ARRAY['08:30-12:30'::text, '13:30-17:30'::text])),
  start_time time without time zone,  -- For yacht bookings
  end_time time without time zone,    -- For yacht bookings
  end_date date,                      -- For multi-day yacht bookings
  participants integer NOT NULL CHECK (participants >= 1 AND participants <= 15),
  total_price numeric(10,2) NOT NULL CHECK (total_price > 0),
  special_requests text,
  yacht_id uuid REFERENCES yachts(id) ON DELETE SET NULL,
  source text DEFAULT 'website'::text CHECK (source = ANY (ARRAY['website'::text, 'phone'::text, 'email'::text, 'social_media'::text, 'referral'::text, 'agent'::text])),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  email_sent boolean DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_date_time_slot ON bookings(date, time_slot) WHERE booking_type = 'sailing';
CREATE INDEX idx_bookings_yacht_id ON bookings(yacht_id) WHERE booking_type = 'yacht';
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX idx_bookings_type ON bookings(booking_type);
CREATE INDEX idx_bookings_date_status ON bookings(date, status);
CREATE INDEX idx_bookings_capacity_check ON bookings(date, time_slot, participants) 
  WHERE booking_type = 'sailing' AND status IN ('pending', 'confirmed');
CREATE INDEX idx_bookings_source ON bookings(source);
CREATE INDEX idx_bookings_email_sent ON bookings(email_sent);

-- Create trigger for updating updated_at
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create booking validation trigger
CREATE OR REPLACE FUNCTION validate_booking_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate based on booking type
  IF NEW.booking_type = 'sailing' THEN
    -- Sailing bookings must have a time_slot
    IF NEW.time_slot IS NULL THEN
      RAISE EXCEPTION 'Sailing bookings must have a time slot';
    END IF;
    
    -- Check for availability
    IF TG_OP = 'INSERT' OR NEW.date <> OLD.date OR NEW.time_slot <> OLD.time_slot OR NEW.status <> OLD.status THEN
      IF NEW.status IN ('pending', 'confirmed') THEN
        -- Check if the date/time slot is available (has active time slot)
        IF NOT EXISTS (
          SELECT 1 FROM time_slots 
          WHERE date = NEW.date 
          AND time = NEW.time_slot 
          AND is_active = true
        ) THEN
          RAISE EXCEPTION 'Selected time slot is not available';
        END IF;
        
        -- Check if there's capacity left
        DECLARE
          max_capacity integer;
          current_participants integer;
        BEGIN
          SELECT max_participants INTO max_capacity 
          FROM time_slots
          WHERE date = NEW.date AND time = NEW.time_slot
          LIMIT 1;
          
          SELECT COALESCE(SUM(participants), 0) INTO current_participants
          FROM bookings
          WHERE date = NEW.date 
          AND time_slot = NEW.time_slot 
          AND status IN ('pending', 'confirmed')
          AND id != NEW.id;  -- Exclude current booking when updating
          
          IF (current_participants + NEW.participants) > max_capacity THEN
            RAISE EXCEPTION 'Not enough capacity in selected time slot (% available, % requested)', 
              (max_capacity - current_participants), NEW.participants;
          END IF;
        END;
      END IF;
    END IF;
  ELSIF NEW.booking_type = 'yacht' THEN
    -- Yacht bookings must have yacht_id, start_time, end_time
    IF NEW.yacht_id IS NULL THEN
      RAISE EXCEPTION 'Yacht bookings must specify a yacht';
    END IF;
    
    IF NEW.start_time IS NULL OR NEW.end_time IS NULL THEN
      RAISE EXCEPTION 'Yacht bookings must have start and end times';
    END IF;
    
    -- For multi-day bookings, end_date is required
    IF NEW.end_date IS NOT NULL AND NEW.end_date < NEW.date THEN
      RAISE EXCEPTION 'End date cannot be before start date';
    END IF;
    
    -- Check for yacht availability
    IF TG_OP = 'INSERT' OR NEW.date <> OLD.date OR NEW.end_date <> OLD.end_date OR 
       NEW.start_time <> OLD.start_time OR NEW.end_time <> OLD.end_time OR 
       NEW.yacht_id <> OLD.yacht_id OR NEW.status <> OLD.status THEN
      IF NEW.status IN ('pending', 'confirmed') THEN
        -- Check if the yacht is available for the requested period
        IF EXISTS (
          SELECT 1 FROM bookings
          WHERE booking_type = 'yacht'
          AND yacht_id = NEW.yacht_id
          AND status IN ('pending', 'confirmed')
          AND id != NEW.id  -- Exclude current booking when updating
          AND (
            -- Single day booking check
            (NEW.end_date IS NULL AND date = NEW.date AND 
             ((start_time <= NEW.start_time AND end_time > NEW.start_time) OR
              (start_time < NEW.end_time AND end_time >= NEW.end_time) OR
              (start_time >= NEW.start_time AND end_time <= NEW.end_time)))
            OR
            -- Multi-day booking check
            (NEW.end_date IS NOT NULL AND (
              (date <= NEW.date AND (end_date IS NULL OR end_date >= NEW.date)) OR
              (date <= NEW.end_date AND date >= NEW.date))
            )
          )
        ) THEN
          RAISE EXCEPTION 'Selected yacht is not available for the requested period';
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_booking_data_trigger
BEFORE INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION validate_booking_data();

-- Create RLS Policies
-- Allow public to create bookings (both authenticated and anonymous)
CREATE POLICY "Public can create bookings" ON bookings
  FOR INSERT TO public
  WITH CHECK (
    (booking_type = 'sailing' AND
     customer_name IS NOT NULL AND
     customer_email IS NOT NULL AND
     customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
     participants >= 1 AND participants <= 15 AND
     total_price > 0::numeric AND
     date IS NOT NULL AND
     time_slot IS NOT NULL)
    OR
    (booking_type = 'yacht' AND
     customer_name IS NOT NULL AND
     customer_email IS NOT NULL AND
     customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
     participants >= 1 AND participants <= 15 AND
     total_price > 0::numeric AND
     date IS NOT NULL AND
     yacht_id IS NOT NULL AND
     start_time IS NOT NULL AND
     end_time IS NOT NULL)
  );

-- Allow authenticated users to view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    customer_email = (SELECT email FROM users_core WHERE id = auth.uid())
  );

-- Allow admins to manage all bookings
CREATE POLICY "Admins can manage all bookings" ON bookings
  FOR ALL TO authenticated
  USING (check_user_role('admin'::text))
  WITH CHECK (check_user_role('admin'::text));

-- Allow managers to view and manage all bookings
CREATE POLICY "Managers can view and manage all bookings" ON bookings
  FOR ALL TO authenticated
  USING (is_admin_or_manager())
  WITH CHECK (is_admin_or_manager());

-- Allow service role to update email_sent flag
CREATE POLICY "Service role can update email_sent" ON bookings
  FOR UPDATE TO service_role
  USING (true)
  WITH CHECK (true);

-- Create a function to update customer data when bookings change
CREATE OR REPLACE FUNCTION update_user_stats_from_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process confirmed bookings
  IF NEW.status = 'confirmed' THEN
    -- Update user stats if user exists
    IF NEW.user_id IS NOT NULL THEN
      UPDATE users_core
      SET 
        total_bookings = (
          SELECT COUNT(*) FROM bookings 
          WHERE user_id = NEW.user_id AND status = 'confirmed'
        ),
        total_spent = (
          SELECT COALESCE(SUM(total_price), 0) FROM bookings 
          WHERE user_id = NEW.user_id AND status = 'confirmed'
        ),
        last_booking_date = NEW.date
      WHERE id = NEW.user_id;
    END IF;
    
    -- If user_id is NULL but we have customer_email, update by email
    IF NEW.user_id IS NULL AND NEW.customer_email IS NOT NULL THEN
      UPDATE users_core
      SET 
        total_bookings = (
          SELECT COUNT(*) FROM bookings 
          WHERE customer_email = NEW.customer_email AND status = 'confirmed'
        ),
        total_spent = (
          SELECT COALESCE(SUM(total_price), 0) FROM bookings 
          WHERE customer_email = NEW.customer_email AND status = 'confirmed'
        ),
        last_booking_date = NEW.date
      WHERE email = NEW.customer_email;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_stats_trigger
AFTER INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_from_booking();

-- Create a function to migrate existing booking data
CREATE OR REPLACE FUNCTION migrate_to_bookings()
RETURNS void AS $$
BEGIN
  -- Migrate data from reservations (sailing bookings)
  INSERT INTO bookings (
    id,
    user_id,
    booking_type,
    status,
    customer_name,
    customer_email,
    customer_phone,
    date,
    time_slot,
    participants,
    total_price,
    special_requests,
    source,
    notes,
    created_at,
    updated_at,
    email_sent
  )
  SELECT 
    r.id,
    r.user_id,
    'sailing' AS booking_type,
    r.status,
    r.customer_name,
    r.customer_email,
    r.customer_phone,
    r.booking_date AS date,
    r.time_slot,
    r.participants,
    r.total_price,
    r.special_requests,
    r.booking_source AS source,
    r.internal_notes AS notes,
    r.created_at,
    r.updated_at,
    r.email_sent
  FROM 
    reservations r;
  
  -- Migrate data from yacht_bookings
  INSERT INTO bookings (
    id,
    user_id,
    booking_type,
    status,
    customer_name,
    customer_email,
    customer_phone,
    date,
    start_time,
    end_time,
    end_date,
    participants,
    total_price,
    yacht_id,
    source,
    created_at,
    updated_at
  )
  SELECT 
    yb.id,
    yb.user_id,
    'yacht' AS booking_type,
    yb.status,
    yb.customer_name,
    yb.customer_email,
    yb.customer_phone,
    yb.start_date AS date,
    yb.start_time,
    yb.end_time,
    CASE WHEN yb.end_date = yb.start_date THEN NULL ELSE yb.end_date END AS end_date,
    yb.participants,
    yb.total_price,
    yb.yacht_id,
    'website' AS source,  -- Default since yacht_bookings doesn't track source
    yb.created_at,
    yb.updated_at
  FROM 
    yacht_bookings yb;
END;
$$ LANGUAGE plpgsql;