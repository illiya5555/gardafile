/*
  # Fix admin and manager access functions

  This migration creates or replaces the is_admin and is_manager functions
  to properly check user roles for access control.
*/

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role_id IN (
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
    AND profiles.role_id IN (
      SELECT id FROM user_roles WHERE role_name = 'manager'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create sample admin user if it doesn't exist
DO $$
BEGIN
  -- Check if admin role exists
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE role_name = 'admin') THEN
    INSERT INTO user_roles (id, role_name, description)
    VALUES (
      gen_random_uuid(),
      'admin',
      'Administrator with full access'
    );
  END IF;
  
  -- Check if manager role exists
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE role_name = 'manager') THEN
    INSERT INTO user_roles (id, role_name, description)
    VALUES (
      gen_random_uuid(),
      'manager',
      'Manager with limited access'
    );
  END IF;
  
  -- Check if client role exists
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE role_name = 'client') THEN
    INSERT INTO user_roles (id, role_name, description)
    VALUES (
      gen_random_uuid(),
      'client',
      'Regular client user'
    );
  END IF;
END
$$;