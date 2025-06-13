/*
  # Fix user creation and handle existing database objects

  1. Tables
    - Create tables only if they don't exist
    - Handle existing constraints and indexes
  
  2. Policies
    - Drop existing policies before creating new ones
    - Create policies with proper conflict handling
  
  3. Functions and Triggers
    - Replace existing functions and triggers
    - Add proper error handling for user creation
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create time_slots table
CREATE TABLE IF NOT EXISTS time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  time text NOT NULL,
  max_participants integer DEFAULT 8,
  price_per_person decimal(10,2) DEFAULT 199.00,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  booking_date date NOT NULL,
  time_slot text NOT NULL,
  participants integer NOT NULL DEFAULT 1,
  total_price decimal(10,2) NOT NULL,
  deposit_paid decimal(10,2) DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  special_requests text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  text text NOT NULL,
  image_url text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  sender_type text DEFAULT 'user' CHECK (sender_type IN ('user', 'bot')),
  created_at timestamptz DEFAULT now()
);

-- Create corporate_packages table
CREATE TABLE IF NOT EXISTS corporate_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  participants_range text NOT NULL,
  duration text NOT NULL,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_popular boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create additional_services table
CREATE TABLE IF NOT EXISTS additional_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create corporate_inquiries table
CREATE TABLE IF NOT EXISTS corporate_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES corporate_packages(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  company_name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  participants_count integer NOT NULL,
  preferred_date date,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'quoted', 'confirmed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_inquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Profiles policies
  DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
  
  -- Bookings policies
  DROP POLICY IF EXISTS "Users can read own bookings" ON bookings;
  DROP POLICY IF EXISTS "Users can create own bookings" ON bookings;
  DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
  
  -- Time slots policies
  DROP POLICY IF EXISTS "Anyone can read active time slots" ON time_slots;
  
  -- Testimonials policies
  DROP POLICY IF EXISTS "Anyone can read featured testimonials" ON testimonials;
  
  -- Chat messages policies
  DROP POLICY IF EXISTS "Users can read own chat messages" ON chat_messages;
  DROP POLICY IF EXISTS "Users can create own chat messages" ON chat_messages;
  
  -- Corporate packages policies
  DROP POLICY IF EXISTS "Anyone can read corporate packages" ON corporate_packages;
  
  -- Additional services policies
  DROP POLICY IF EXISTS "Anyone can read additional services" ON additional_services;
  
  -- Corporate inquiries policies
  DROP POLICY IF EXISTS "Users can create corporate inquiries" ON corporate_inquiries;
  DROP POLICY IF EXISTS "Users can read own corporate inquiries" ON corporate_inquiries;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignore errors if policies don't exist
    NULL;
END $$;

-- Create new policies
-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Bookings policies
CREATE POLICY "Users can read own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Time slots policies (read-only for users)
CREATE POLICY "Anyone can read active time slots"
  ON time_slots
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Testimonials policies (read-only for users)
CREATE POLICY "Anyone can read featured testimonials"
  ON testimonials
  FOR SELECT
  TO authenticated
  USING (is_featured = true);

-- Chat messages policies
CREATE POLICY "Users can read own chat messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Corporate packages policies (public read)
CREATE POLICY "Anyone can read corporate packages"
  ON corporate_packages
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Additional services policies (public read)
CREATE POLICY "Anyone can read additional services"
  ON additional_services
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Corporate inquiries policies
CREATE POLICY "Users can create corporate inquiries"
  ON corporate_inquiries
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can read own corporate inquiries"
  ON corporate_inquiries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert default time slots (only if they don't exist)
INSERT INTO time_slots (time, max_participants, price_per_person, is_active) 
SELECT '08:30', 8, 199.00, true
WHERE NOT EXISTS (SELECT 1 FROM time_slots WHERE time = '08:30');

INSERT INTO time_slots (time, max_participants, price_per_person, is_active) 
SELECT '09:00', 8, 199.00, true
WHERE NOT EXISTS (SELECT 1 FROM time_slots WHERE time = '09:00');

INSERT INTO time_slots (time, max_participants, price_per_person, is_active) 
SELECT '13:30', 8, 199.00, true
WHERE NOT EXISTS (SELECT 1 FROM time_slots WHERE time = '13:30');

INSERT INTO time_slots (time, max_participants, price_per_person, is_active) 
SELECT '14:00', 8, 199.00, true
WHERE NOT EXISTS (SELECT 1 FROM time_slots WHERE time = '14:00');

-- Insert sample testimonials (only if they don't exist)
INSERT INTO testimonials (name, location, rating, text, image_url, is_featured) 
SELECT 'Marco Rossi', 'Munich, Germany', 5, 'Incredible experience! The professional skipper made us feel safe while we enjoyed the thrill of racing. The photos they took are amazing memories.', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', true
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE name = 'Marco Rossi' AND location = 'Munich, Germany');

INSERT INTO testimonials (name, location, rating, text, image_url, is_featured) 
SELECT 'Sarah Johnson', 'London, UK', 5, 'Perfect day on Lake Garda! No sailing experience needed - they taught us everything. The medal ceremony was a nice touch. Highly recommended!', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', true
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE name = 'Sarah Johnson' AND location = 'London, UK');

INSERT INTO testimonials (name, location, rating, text, image_url, is_featured) 
SELECT 'Andreas Mueller', 'Vienna, Austria', 5, 'Brought our corporate team here for a unique experience. Everyone loved it! Great organization, beautiful location, and unforgettable memories.', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', true
WHERE NOT EXISTS (SELECT 1 FROM testimonials WHERE name = 'Andreas Mueller' AND location = 'Vienna, Austria');

-- Insert sample corporate packages (only if they don't exist)
INSERT INTO corporate_packages (name, description, price, participants_range, duration, features, is_popular) 
SELECT 'Team Spirit', 'Perfect for small teams looking to build stronger connections', 2400.00, '12-24 people', '4 hours', '["Professional skippers", "Safety briefing", "Team races", "Event photography", "Participant certificates", "Light lunch on shore"]'::jsonb, false
WHERE NOT EXISTS (SELECT 1 FROM corporate_packages WHERE name = 'Team Spirit');

INSERT INTO corporate_packages (name, description, price, participants_range, duration, features, is_popular) 
SELECT 'Corporate Challenge', 'Our most popular package for medium-sized corporate groups', 4800.00, '24-48 people', '6 hours', '["Everything from Team Spirit", "Professional videography", "Award ceremony", "Trophies and medals", "Italian cuisine banquet", "Hotel transfer", "Personal coordinator"]'::jsonb, true
WHERE NOT EXISTS (SELECT 1 FROM corporate_packages WHERE name = 'Corporate Challenge');

INSERT INTO corporate_packages (name, description, price, participants_range, duration, features, is_popular) 
SELECT 'Executive Regatta', 'Premium experience for large corporate events', 9600.00, '48-96 people', '8 hours', '["Everything from Corporate Challenge", "VIP area for executives", "Live music and entertainment", "Premium beverages", "Personalized gifts", "Professional host", "Additional activities organization"]'::jsonb, false
WHERE NOT EXISTS (SELECT 1 FROM corporate_packages WHERE name = 'Executive Regatta');

-- Insert sample additional services (only if they don't exist)
INSERT INTO additional_services (name, description) 
SELECT 'Transfer', 'Comfortable buses from hotel'
WHERE NOT EXISTS (SELECT 1 FROM additional_services WHERE name = 'Transfer');

INSERT INTO additional_services (name, description) 
SELECT 'Catering', 'Italian cuisine and beverages'
WHERE NOT EXISTS (SELECT 1 FROM additional_services WHERE name = 'Catering');

INSERT INTO additional_services (name, description) 
SELECT 'Entertainment', 'Live music and host'
WHERE NOT EXISTS (SELECT 1 FROM additional_services WHERE name = 'Entertainment');

INSERT INTO additional_services (name, description) 
SELECT 'Photo/Video', 'Professional filming'
WHERE NOT EXISTS (SELECT 1 FROM additional_services WHERE name = 'Photo/Video');

-- Function to handle user profile creation with conflict resolution
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = now();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();