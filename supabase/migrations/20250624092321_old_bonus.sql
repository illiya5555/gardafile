/*
# User and Auth Triggers Update

1. Purpose
  - Updates triggers related to user creation and management
  - Ensures compatibility with new database structure
  - Maintains automatic user creation and role assignment

2. Features
  - Handle new user creation
  - Assign default roles
  - Update search vectors
*/

-- Update handle_new_user trigger function to use users_core
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id uuid;
BEGIN
  -- Get the default 'client' role ID
  SELECT id INTO default_role_id
  FROM user_roles
  WHERE role_name = 'client'
  LIMIT 1;

  -- If there's no client role, get any role as a fallback
  IF default_role_id IS NULL THEN
    SELECT id INTO default_role_id
    FROM user_roles
    LIMIT 1;
  END IF;

  -- Create a new user entry
  INSERT INTO users_core (
    id,
    email,
    role_id,
    preferred_language,
    source,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    default_role_id,
    'en',  -- Default language
    'website',  -- Default source
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    role_id = COALESCE(users_core.role_id, EXCLUDED.role_id),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update set_default_role_id trigger function to work with users_core
CREATE OR REPLACE FUNCTION set_default_role_id()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id uuid;
BEGIN
  -- Check if role_id is already set
  IF NEW.role_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Get the default 'client' role ID
  SELECT id INTO default_role_id
  FROM user_roles
  WHERE role_name = 'client'
  LIMIT 1;

  -- If there's no client role, get any role
  IF default_role_id IS NULL THEN
    SELECT id INTO default_role_id
    FROM user_roles
    LIMIT 1;
  END IF;

  -- Set the role_id
  NEW.role_id := default_role_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace function to check user role
CREATE OR REPLACE FUNCTION check_user_role(role_name text)
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  SELECT ur.role_name INTO user_role
  FROM users_core uc
  JOIN user_roles ur ON uc.role_id = ur.id
  WHERE uc.id = auth.uid();
  
  -- If no role found, return false
  IF user_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user has requested role
  -- 'admin' can access everything
  RETURN user_role = role_name OR user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to check if user is admin or manager
CREATE OR REPLACE FUNCTION is_admin_or_manager()
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  SELECT ur.role_name INTO user_role
  FROM users_core uc
  JOIN user_roles ur ON uc.role_id = ur.id
  WHERE uc.id = auth.uid();
  
  -- If no role found, return false
  IF user_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user is admin or manager
  RETURN user_role IN ('admin', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to check if manager can update profile
CREATE OR REPLACE FUNCTION can_manager_update_profile(profile_id uuid)
RETURNS boolean AS $$
DECLARE
  user_role text;
  profile_role text;
BEGIN
  -- Get role of the current user
  SELECT ur.role_name INTO user_role
  FROM users_core uc
  JOIN user_roles ur ON uc.role_id = ur.id
  WHERE uc.id = auth.uid();
  
  -- If no role or not a manager/admin, return false
  IF user_role IS NULL OR user_role NOT IN ('admin', 'manager') THEN
    RETURN false;
  END IF;
  
  -- Admins can update any profile
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Get role of the profile being updated
  SELECT ur.role_name INTO profile_role
  FROM users_core uc
  JOIN user_roles ur ON uc.role_id = ur.id
  WHERE uc.id = profile_id;
  
  -- Managers can't update admin profiles
  IF profile_role = 'admin' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN check_user_role('admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to check if user is manager
CREATE OR REPLACE FUNCTION is_manager()
RETURNS boolean AS $$
BEGIN
  RETURN check_user_role('manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically add new users to users_core
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();