/*
  # Calendar Sync Function

  1. New Functions
    - is_admin() - Checks if the current user is an admin
    - is_manager() - Checks if the current user is a manager
    - update_updated_at_column() - Updates the updated_at column on row update

  2. Security
    - Functions are created with SECURITY DEFINER to ensure they run with the privileges of the creator
*/

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role_id = (
      SELECT id FROM user_roles WHERE role_name = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if the current user is a manager
CREATE OR REPLACE FUNCTION is_manager()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role_id = (
      SELECT id FROM user_roles WHERE role_name = 'manager'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;