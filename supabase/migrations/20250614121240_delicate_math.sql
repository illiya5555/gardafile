/*
  # Content Storage System

  1. New Tables
    - `storage_items` - Tracks files stored in Supabase Storage
      - `id` (uuid, primary key)
      - `bucket_id` (text, references storage.buckets)
      - `name` (text)
      - `path` (text)
      - `size` (bigint)
      - `mime_type` (text)
      - `metadata` (jsonb)
      - `created_by` (uuid, references profiles)
      - `updated_by` (uuid, references profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `storage_categories` - Organizes storage items into categories
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `storage_item_categories` - Many-to-many relationship between items and categories
      - `item_id` (uuid, references storage_items)
      - `category_id` (uuid, references storage_categories)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for admin/manager roles
*/

-- Create storage_categories table
CREATE TABLE IF NOT EXISTS storage_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create storage_items table
CREATE TABLE IF NOT EXISTS storage_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id text NOT NULL,
  name text NOT NULL,
  path text NOT NULL,
  size bigint NOT NULL,
  mime_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(bucket_id, path)
);

-- Create storage_item_categories table (junction table)
CREATE TABLE IF NOT EXISTS storage_item_categories (
  item_id uuid REFERENCES storage_items(id) ON DELETE CASCADE,
  category_id uuid REFERENCES storage_categories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (item_id, category_id)
);

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_storage_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_storage_items_updated_at
BEFORE UPDATE ON storage_items
FOR EACH ROW
EXECUTE FUNCTION update_storage_items_updated_at();

CREATE OR REPLACE FUNCTION update_storage_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_storage_categories_updated_at
BEFORE UPDATE ON storage_categories
FOR EACH ROW
EXECUTE FUNCTION update_storage_categories_updated_at();

-- Enable Row Level Security
ALTER TABLE storage_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_item_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for storage_categories
CREATE POLICY "Anyone can read storage categories"
  ON storage_categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins and managers can insert storage categories"
  ON storage_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id IN (
        SELECT id FROM user_roles
        WHERE role_name IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "Admins and managers can update storage categories"
  ON storage_categories
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id IN (
        SELECT id FROM user_roles
        WHERE role_name IN ('admin', 'manager')
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id IN (
        SELECT id FROM user_roles
        WHERE role_name IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "Admins and managers can delete storage categories"
  ON storage_categories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id IN (
        SELECT id FROM user_roles
        WHERE role_name IN ('admin', 'manager')
      )
    )
  );

-- Create policies for storage_items
CREATE POLICY "Anyone can read storage items"
  ON storage_items
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins and managers can insert storage items"
  ON storage_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id IN (
        SELECT id FROM user_roles
        WHERE role_name IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "Admins and managers can update storage items"
  ON storage_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id IN (
        SELECT id FROM user_roles
        WHERE role_name IN ('admin', 'manager')
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id IN (
        SELECT id FROM user_roles
        WHERE role_name IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "Admins and managers can delete storage items"
  ON storage_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id IN (
        SELECT id FROM user_roles
        WHERE role_name IN ('admin', 'manager')
      )
    )
  );

-- Create policies for storage_item_categories
CREATE POLICY "Anyone can read storage item categories"
  ON storage_item_categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins and managers can insert storage item categories"
  ON storage_item_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id IN (
        SELECT id FROM user_roles
        WHERE role_name IN ('admin', 'manager')
      )
    )
  );

CREATE POLICY "Admins and managers can delete storage item categories"
  ON storage_item_categories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role_id IN (
        SELECT id FROM user_roles
        WHERE role_name IN ('admin', 'manager')
      )
    )
  );

-- Create default categories
INSERT INTO storage_categories (name, description)
VALUES 
  ('Hero Images', 'Images used in hero sections'),
  ('Yacht Photos', 'Photos of yachts in the fleet'),
  ('Client Media', 'Photos and videos for clients'),
  ('Testimonials', 'Images for testimonials'),
  ('Team Photos', 'Photos of team members'),
  ('Location Images', 'Photos of Lake Garda and surroundings'),
  ('Documents', 'PDF documents and other files')
ON CONFLICT (id) DO NOTHING;

-- Add storage_item_id column to existing tables that reference media
DO $$
BEGIN
  -- Add to testimonials table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'testimonials' AND column_name = 'storage_item_id'
  ) THEN
    ALTER TABLE testimonials ADD COLUMN storage_item_id uuid REFERENCES storage_items(id) ON DELETE SET NULL;
  END IF;

  -- Add to client_media table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'client_media' AND column_name = 'storage_item_id'
  ) THEN
    ALTER TABLE client_media ADD COLUMN storage_item_id uuid REFERENCES storage_items(id) ON DELETE SET NULL;
  END IF;

  -- Add to yachts table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'yachts' AND column_name = 'storage_item_id'
  ) THEN
    ALTER TABLE yachts ADD COLUMN storage_item_id uuid REFERENCES storage_items(id) ON DELETE SET NULL;
  END IF;
END $$;