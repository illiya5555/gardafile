/*
  # Add Corporate Services Tables

  1. New Tables
    - `corporate_packages`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `participants_range` (text)
      - `duration` (text)
      - `features` (jsonb array)
      - `is_popular` (boolean)
      - `created_at` (timestamp)
    
    - `additional_services`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `corporate_inquiries`
      - `id` (uuid, primary key)
      - `package_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key, nullable)
      - `company_name` (text)
      - `contact_person` (text)
      - `email` (text)
      - `phone` (text)
      - `participants_count` (integer)
      - `preferred_date` (date, nullable)
      - `message` (text, nullable)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to packages and services
    - Add policies for authenticated users to create inquiries
*/

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
ALTER TABLE corporate_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_inquiries ENABLE ROW LEVEL SECURITY;

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

-- Insert sample corporate packages
INSERT INTO corporate_packages (name, description, price, participants_range, duration, features, is_popular) VALUES
  (
    'Team Spirit',
    'Perfect for small teams looking to build stronger connections',
    2400.00,
    '12-24 человека',
    '4 часа',
    '["Профессиональные шкиперы", "Инструктаж по безопасности", "Командные гонки", "Фотосъемка мероприятия", "Сертификаты участников", "Легкий обед на берегу"]'::jsonb,
    false
  ),
  (
    'Corporate Challenge',
    'Our most popular package for medium-sized corporate groups',
    4800.00,
    '24-48 человек',
    '6 часов',
    '["Все из пакета Team Spirit", "Профессиональная видеосъемка", "Церемония награждения", "Кубки и медали", "Банкет с итальянской кухней", "Трансфер от отеля", "Персональный координатор"]'::jsonb,
    true
  ),
  (
    'Executive Regatta',
    'Premium experience for large corporate events',
    9600.00,
    '48-96 человек',
    '8 часов',
    '["Все из пакета Corporate Challenge", "VIP-зона для руководства", "Живая музыка и развлечения", "Премиальные напитки", "Персонализированные подарки", "Профессиональный ведущий", "Организация дополнительных активностей"]'::jsonb,
    false
  )
ON CONFLICT DO NOTHING;

-- Insert sample additional services
INSERT INTO additional_services (name, description) VALUES
  ('Трансфер', 'Комфортабельные автобусы от отеля'),
  ('Кейтеринг', 'Итальянская кухня и напитки'),
  ('Развлечения', 'Живая музыка и ведущий'),
  ('Фото/Видео', 'Профессиональная съемка')
ON CONFLICT DO NOTHING;