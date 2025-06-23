/*
  # Create yacht tables and establish relationship

  1. Creates the `yachts` table if it doesn't exist
  2. Creates the `yacht_bookings` table if it doesn't exist
  3. Adds the foreign key relationship between them
*/

-- Create yachts table if it doesn't exist
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

-- Create yacht_bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS yacht_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  yacht_id uuid,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
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

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  -- Check if the foreign key constraint doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_yacht_bookings_yacht_id' 
    AND table_name = 'yacht_bookings'
    AND constraint_type = 'FOREIGN KEY'
  ) THEN
    -- Add the foreign key constraint
    ALTER TABLE yacht_bookings
    ADD CONSTRAINT fk_yacht_bookings_yacht_id
    FOREIGN KEY (yacht_id)
    REFERENCES yachts(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on these tables
ALTER TABLE yachts ENABLE ROW LEVEL SECURITY;
ALTER TABLE yacht_bookings ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Anyone can read active yachts"
  ON yachts
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_yacht_bookings_yacht_id ON yacht_bookings(yacht_id);
CREATE INDEX IF NOT EXISTS idx_yacht_bookings_user_id ON yacht_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_yacht_bookings_dates ON yacht_bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_yacht_bookings_status ON yacht_bookings(status);
CREATE INDEX IF NOT EXISTS idx_yachts_is_active ON yachts(is_active);