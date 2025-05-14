/*
  # Fix RLS policies and data persistence issues

  1. Changes
    - Update RLS policies for app_settings table
    - Fix update policies for all tables
    - Ensure proper authentication checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read app settings" ON app_settings;
DROP POLICY IF EXISTS "Only admins can update app settings" ON app_settings;

-- Create new policies for app_settings
CREATE POLICY "Anyone can read app settings"
ON app_settings FOR SELECT
TO public
USING (true);

CREATE POLICY "Only admins can update app settings"
ON app_settings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE id::text = auth.uid()::text
    AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE id::text = auth.uid()::text
    AND is_admin = true
  )
);

-- Update coupons policies
DROP POLICY IF EXISTS "Users can update own coupons" ON coupons;
CREATE POLICY "Users can update own coupons"
ON coupons FOR UPDATE
TO authenticated
USING (
  user_id::text = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE id::text = auth.uid()::text
    AND is_admin = true
  )
)
WITH CHECK (
  user_id::text = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE id::text = auth.uid()::text
    AND is_admin = true
  )
);

-- Update custom_users policies
DROP POLICY IF EXISTS "Users can update own data" ON custom_users;
CREATE POLICY "Users can update own data"
ON custom_users FOR UPDATE
TO authenticated
USING (id::text = auth.uid()::text)
WITH CHECK (id::text = auth.uid()::text);

-- Ensure RLS is enabled for all tables
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;