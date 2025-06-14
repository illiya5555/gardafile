/*
  # Fix Admin Profile Setup

  1. New Tables
    - Ensures `user_roles` table has the required admin role
    - Sets up proper profile creation for admin users

  2. Security
    - Maintains existing RLS policies
    - Ensures admin role is properly configured

  3. Changes
    - Creates admin role if it doesn't exist
    - Updates profile creation trigger to handle admin users
    - Ensures admin user gets proper role assignment
*/

-- Ensure admin role exists in user_roles table
INSERT INTO user_roles (id, role_name, description, permissions)
VALUES (
  '733d2db6-b6c5-4ad3-a482-877a35a2debe',
  'admin',
  'Administrator with full system access',
  '["all"]'::jsonb
)
ON CONFLICT (role_name) DO UPDATE SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions;

-- Ensure client role exists (default role)
INSERT INTO user_roles (role_name, description, permissions)
VALUES (
  'client',
  'Regular client with basic access',
  '["read_own_data", "create_bookings"]'::jsonb
)
ON CONFLICT (role_name) DO NOTHING;

-- Ensure manager role exists
INSERT INTO user_roles (role_name, description, permissions)
VALUES (
  'manager',
  'Manager with elevated access',
  '["read_all_data", "manage_bookings", "manage_clients"]'::jsonb
)
ON CONFLICT (role_name) DO NOTHING;

-- Update the handle_new_user function to properly assign roles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  admin_role_id uuid;
  client_role_id uuid;
BEGIN
  -- Get role IDs
  SELECT id INTO admin_role_id FROM user_roles WHERE role_name = 'admin';
  SELECT id INTO client_role_id FROM user_roles WHERE role_name = 'client';
  
  -- Insert profile with appropriate role
  INSERT INTO profiles (
    id,
    email,
    first_name,
    last_name,
    role_id,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CASE 
      WHEN NEW.email = 'admin@gardaracing.com' THEN admin_role_id
      ELSE client_role_id
    END,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create admin profile if admin user exists but profile doesn't
DO $$
DECLARE
  admin_user_id uuid;
  admin_role_id uuid;
  profile_exists boolean;
BEGIN
  -- Check if admin user exists in auth.users
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'admin@gardaracing.com';
  
  IF admin_user_id IS NOT NULL THEN
    -- Check if profile already exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = admin_user_id) INTO profile_exists;
    
    IF NOT profile_exists THEN
      -- Get admin role ID
      SELECT id INTO admin_role_id FROM user_roles WHERE role_name = 'admin';
      
      -- Create admin profile
      INSERT INTO profiles (
        id,
        email,
        first_name,
        last_name,
        role_id,
        created_at,
        updated_at
      )
      VALUES (
        admin_user_id,
        'admin@gardaracing.com',
        'Admin',
        'User',
        admin_role_id,
        NOW(),
        NOW()
      );
    ELSE
      -- Update existing profile to ensure it has admin role
      SELECT id INTO admin_role_id FROM user_roles WHERE role_name = 'admin';
      
      UPDATE profiles 
      SET role_id = admin_role_id,
          updated_at = NOW()
      WHERE id = admin_user_id AND role_id != admin_role_id;
    END IF;
  END IF;
END $$;