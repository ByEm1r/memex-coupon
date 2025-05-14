/*
  # Fix app_settings RLS policies

  1. Changes
    - Drop existing RLS policies for app_settings table
    - Create new comprehensive RLS policies that:
      - Allow public read access
      - Allow authenticated admins to perform all operations
    - Ensure proper access control for settings management
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read app settings" ON app_settings;
DROP POLICY IF EXISTS "Only admins can update app settings" ON app_settings;

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Anyone can read app settings"
ON app_settings FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage app settings"
ON app_settings FOR ALL
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