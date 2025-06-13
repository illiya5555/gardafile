/*
  # Yacht Booking System Migration

  1. New Tables
    - `yachts`
      - `id` (uuid, primary key)
      - `name` (text)
      - `model` (text)
      - `capacity` (integer)
      - `hourly_rate` (decimal)
      - `is_active` (boolean)
      - `description` (text)
      - `image_url` (text)
      - `created_at` (timestamp)
    
    - `yacht_bookings`
      - `id` (uuid, primary key)
      - `yacht_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key, nullable)
      - `start_date` (date)
      - `end_date` (date)
      - `start_time` (time)
      - `end_time` (time)
      - `participants` (integer)
      - `total_price` (decimal)
      - `customer_name` (text)
      - `customer_email` (text)
      - `customer_phone` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for yacht bookings
*/

-- Create yachts table
CREATE TABLE IF NOT EXISTS yachts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  model text NOT NULL,
  capacity integer NOT NULL DEFAULT 8,
  hourly_rate decimal(10,2) NOT NULL DEFAULT 199.00,
  is_active boolean DEFAULT true,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Create yacht_bookings table
CREATE TABLE IF NOT EXISTS yacht_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  yacht_id uuid REFERENCES yachts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  participants integer NOT NULL DEFAULT 1,
  total_price decimal(10,2) NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE yachts ENABLE ROW LEVEL SECURITY;
ALTER TABLE yacht_bookings ENABLE ROW LEVEL SECURITY;

-- Yachts policies (public read for active yachts)
CREATE POLICY "Anyone can read active yachts"
  ON yachts
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Yacht bookings policies
CREATE POLICY "Anyone can create yacht bookings"
  ON yacht_bookings
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can read own yacht bookings"
  ON yacht_bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR customer_email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- Insert sample yachts
INSERT INTO yachts (name, model, capacity, hourly_rate, is_active, description) VALUES
  ('Bavaria 34 "Adriatic Wind"', 'Bavaria 34', 8, 199.00, true, 'Современная крейсерская яхта с отличными ходовыми качествами'),
  ('Bavaria 34 "Lake Spirit"', 'Bavaria 34', 8, 199.00, true, 'Комфортабельная яхта для семейного отдыха'),
  ('Jeanneau 349 "Garda Dream"', 'Jeanneau 349', 8, 199.00, true, 'Элегантная французская яхта с просторным кокпитом'),
  ('Bavaria 37 "Mountain View"', 'Bavaria 37', 10, 229.00, true, 'Большая яхта для корпоративных мероприятий'),
  ('Hanse 345 "Blue Horizon"', 'Hanse 345', 8, 199.00, true, 'Спортивная яхта с отличной управляемостью'),
  ('Bavaria 34 "Wind Dancer"', 'Bavaria 34', 8, 199.00, true, 'Надежная яхта для начинающих'),
  ('Jeanneau 349 "Sunset Sail"', 'Jeanneau 349', 8, 199.00, true, 'Романтичная яхта для особых случаев'),
  ('Bavaria 37 "Alpine Breeze"', 'Bavaria 37', 10, 229.00, true, 'Премиальная яхта с дополнительным комфортом'),
  ('Hanse 345 "Crystal Waters"', 'Hanse 345', 8, 199.00, true, 'Современная яхта с инновационными решениями'),
  ('Bavaria 34 "Freedom"', 'Bavaria 34', 8, 199.00, true, 'Классическая яхта для истинных ценителей'),
  ('Jeanneau 349 "Serenity"', 'Jeanneau 349', 8, 199.00, true, 'Тихая и комфортная яхта для релаксации'),
  ('Bavaria 37 "Majestic"', 'Bavaria 37', 10, 229.00, true, 'Величественная яхта для VIP-клиентов')
ON CONFLICT DO NOTHING;

-- Add updated_at trigger for yacht_bookings
CREATE TRIGGER update_yacht_bookings_updated_at
  BEFORE UPDATE ON yacht_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();