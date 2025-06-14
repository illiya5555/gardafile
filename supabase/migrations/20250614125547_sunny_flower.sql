/*
  # Create Manager Account

  1. Creates a manager user with email manager@gardaracing.com
  2. Assigns the manager role to this user
  3. Sets up profile information for the manager
*/

-- First, check if the manager role exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM user_roles WHERE role_name = 'manager') THEN
    INSERT INTO user_roles (role_name, description, permissions)
    VALUES ('manager', 'Manage bookings and client communications', '["manage_bookings", "view_clients", "chat_with_clients", "upload_media"]'::jsonb);
  END IF;
END $$;

-- Create the manager user if it doesn't exist
-- Note: In production, you would use a secure password. This is for demonstration purposes.
DO $$
DECLARE
  manager_uid uuid;
  manager_role_id uuid;
BEGIN
  -- Get the manager role ID
  SELECT id INTO manager_role_id FROM user_roles WHERE role_name = 'manager';
  
  -- Check if the manager user already exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'manager@gardaracing.com') THEN
    -- Create the user in auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'manager@gardaracing.com',
      crypt('manager123', gen_salt('bf')), -- Password: manager123
      NOW(),
      NULL,
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"first_name": "Marina", "last_name": "Garda", "phone": "+39 345 678 9012"}',
      NOW(),
      NOW(),
      '',
      NULL,
      '',
      ''
    )
    RETURNING id INTO manager_uid;
    
    -- Create the profile for the manager
    INSERT INTO profiles (
      id,
      email,
      first_name,
      last_name,
      phone,
      role_id,
      created_at,
      updated_at
    )
    VALUES (
      manager_uid,
      'manager@gardaracing.com',
      'Marina',
      'Garda',
      '+39 345 678 9012',
      manager_role_id,
      NOW(),
      NOW()
    );
  END IF;
END $$;