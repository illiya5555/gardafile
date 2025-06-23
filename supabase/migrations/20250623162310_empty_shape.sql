/*
  # Add email confirmation functionality

  1. New Columns
    - `email_sent` - Flag to track if a confirmation email was sent
  
  2. Updates
    - Add boolean column to reservations table
    - Default value is FALSE
    - Set up permissions for admins and the webhook function
*/

-- Add email_sent column to reservations table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'email_sent'
  ) THEN
    ALTER TABLE reservations ADD COLUMN email_sent BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Ensure admin policy exists for reservations table (or create it)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'reservations' AND policyname = 'Admins can manage all reservations'
  ) THEN
    CREATE POLICY "Admins can manage all reservations" 
    ON reservations
    FOR ALL 
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());
  END IF;
END $$;

-- Create policy to allow service_role to update email_sent
DROP POLICY IF EXISTS "Service role can update email_sent" ON reservations;
CREATE POLICY "Service role can update email_sent"
  ON reservations
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add helpful function for webhook to mark email as sent
CREATE OR REPLACE FUNCTION mark_email_sent(reservation_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE reservations 
  SET email_sent = TRUE 
  WHERE id = reservation_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION mark_email_sent IS 'Marks a reservation as having had a confirmation email sent';