/*
  # Grant admin access to specific user

  1. Locate the user with email admin@gardaracing.com
  2. Grant admin role to this user
  
  This migration safely handles the case where:
  - The user might not exist yet
  - The user might already have admin role
  - The admin role might have a different ID in different environments
*/

-- First, ensure the admin role exists
INSERT INTO user_roles (role_name, description)
VALUES ('admin', 'Administrator with full access')
ON CONFLICT (role_name) DO NOTHING;

-- Get the admin role ID
DO $$
DECLARE
  admin_role_id uuid;
  target_user_id uuid;
BEGIN
  -- Get the admin role ID
  SELECT id INTO admin_role_id FROM user_roles WHERE role_name = 'admin';
  
  -- Find the user in auth.users
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'admin@gardaracing.com';
  
  -- If user exists, update their profile
  IF target_user_id IS NOT NULL THEN
    -- Check if profile exists
    IF EXISTS (SELECT 1 FROM profiles WHERE id = target_user_id) THEN
      -- Update existing profile
      UPDATE profiles 
      SET role_id = admin_role_id
      WHERE id = target_user_id;
    ELSE
      -- Create profile with admin role
      INSERT INTO profiles (id, email, role_id) 
      VALUES (
        target_user_id, 
        'admin@gardaracing.com', 
        admin_role_id
      );
    END IF;
    
    RAISE NOTICE 'Admin access granted to user with ID: %', target_user_id;
  ELSE
    RAISE NOTICE 'User with email admin@gardaracing.com not found. They will be granted admin access when they register.';
    
    -- Create a trigger to automatically assign admin role when this user registers
    CREATE OR REPLACE FUNCTION grant_admin_on_register()
    RETURNS TRIGGER AS $$
    DECLARE
      admin_role_id uuid;
    BEGIN
      IF NEW.email = 'admin@gardaracing.com' THEN
        SELECT id INTO admin_role_id FROM user_roles WHERE role_name = 'admin';
        
        -- Update the profile that was just created by the auth trigger
        UPDATE profiles 
        SET role_id = admin_role_id
        WHERE id = NEW.id;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    -- Create or replace the trigger
    DROP TRIGGER IF EXISTS grant_admin_on_register_trigger ON auth.users;
    CREATE TRIGGER grant_admin_on_register_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION grant_admin_on_register();
  END IF;
END $$;