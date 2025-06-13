/*
  # Initial Schema for Garda Racing Yacht Club

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `first_name` (text)
      - `last_name` (text)
      - `phone` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `bookings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `booking_date` (date)
      - `time_slot` (text)
      - `participants` (integer)
      - `total_price` (decimal)
      - `deposit_paid` (decimal)
      - `status` (text)
      - `special_requests` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `time_slots`
      - `id` (uuid, primary key)
      - `time` (text)
      - `max_participants` (integer)
      - `price_per_person` (decimal)
      - `is_active` (boolean)
    
    - `testimonials`
      - `id` (uuid, primary key)
      - `name` (text)
      - `location` (text)
      - `rating` (integer)
      - `text` (text)
      - `image_url` (text)
      - `is_featured` (boolean)
      - `created_at` (timestamp)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `message` (text)
      - `sender_type` (text) -- 'user' or 'bot'
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
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

-- Insert default time slots
INSERT INTO time_slots (time, max_participants, price_per_person, is_active) VALUES
  ('08:30', 8, 199.00, true),
  ('09:00', 8, 199.00, true),
  ('13:30', 8, 199.00, true),
  ('14:00', 8, 199.00, true)
ON CONFLICT DO NOTHING;

-- Insert sample testimonials
INSERT INTO testimonials (name, location, rating, text, image_url, is_featured) VALUES
  ('Marco Rossi', 'Munich, Germany', 5, 'Incredible experience! The professional skipper made us feel safe while we enjoyed the thrill of racing. The photos they took are amazing memories.', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', true),
  ('Sarah Johnson', 'London, UK', 5, 'Perfect day on Lake Garda! No sailing experience needed - they taught us everything. The medal ceremony was a nice touch. Highly recommended!', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', true),
  ('Andreas Mueller', 'Vienna, Austria', 5, 'Brought our corporate team here for a unique experience. Everyone loved it! Great organization, beautiful location, and unforgettable memories.', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop', true)
ON CONFLICT DO NOTHING;

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
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

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();