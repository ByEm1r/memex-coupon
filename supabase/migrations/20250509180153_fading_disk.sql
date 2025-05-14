/*
  # Fix app_settings RLS policies

  1. Changes
    - Drop existing RLS policies
    - Create new comprehensive policies for app_settings table
    - Fix admin access checks
    
  2. Security
    - Allow public read access to settings
    - Restrict write operations to admin users only
    - Ensure proper auth.uid() comparisons
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read app settings" ON app_settings;
DROP POLICY IF EXISTS "Only admins can update app settings" ON app_settings;
DROP POLICY IF EXISTS "Admins can manage app settings" ON app_settings;

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Anyone can read app settings"
ON app_settings FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage app settings"
ON app_settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE custom_users.id::text = auth.uid()::text
    AND custom_users.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE custom_users.id::text = auth.uid()::text
    AND custom_users.is_admin = true
  )
);