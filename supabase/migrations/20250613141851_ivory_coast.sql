/*
  # Create contact inquiries table

  1. New Tables
    - `contact_inquiries`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email` (text, required)
      - `phone` (text, optional)
      - `subject` (text, required)
      - `message` (text, required)
      - `status` (text, default 'new')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `contact_inquiries` table
    - Add policy for anonymous and authenticated users to insert data
    - Add policy for authenticated users to read their own inquiries
*/

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anyone (anonymous and authenticated) to create contact inquiries
CREATE POLICY "Anyone can create contact inquiries"
  ON contact_inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to read contact inquiries (for admin purposes)
CREATE POLICY "Authenticated users can read contact inquiries"
  ON contact_inquiries
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS contact_inquiries_created_at_idx ON contact_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS contact_inquiries_status_idx ON contact_inquiries(status);