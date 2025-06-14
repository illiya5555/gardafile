/*
  # Database Schema Setup with Conflict Handling

  1. New Tables
    - `profiles` - User profiles and account information
    - `time_slots` - Available time slots for bookings
    - `bookings` - Regular sailing experience bookings
    - `testimonials` - Customer reviews and testimonials
    - `chat_messages` - Customer support chat messages

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users with conflict handling
    - Create functions and triggers for user management

  3. Sample Data
    - Insert default time slots
    - Insert sample testimonials
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

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