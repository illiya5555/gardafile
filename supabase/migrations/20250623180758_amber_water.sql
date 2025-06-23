/*
  # Add Foreign Key Relationship for Yacht Bookings

  1. Changes
    - Add foreign key constraint to yacht_bookings table
    - Link yacht_id column to yachts.id
    - This enables proper relationship queries between yacht_bookings and yachts

  2. Security
    - No RLS changes needed as this is just adding a constraint
*/

-- Add foreign key constraint to establish relationship between yacht_bookings and yachts
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