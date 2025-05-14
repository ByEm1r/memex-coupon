/*
  # Fix app_settings RLS policies and admin access

  1. Changes
    - Drop existing RLS policies
    - Create new policies that properly handle admin access
    - Ensure proper auth.uid() checks
    - Add default row if not exists
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read app settings" ON app_settings;
DROP POLICY IF EXISTS "Admins can manage app settings" ON app_settings;
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
);

-- Ensure default settings exist
INSERT INTO app_settings (id, memex_amount, memex_address)
VALUES (1, 50000000, 'xTSNVy4GLEDETscV2HFQ8HoThzpWWmxArP')
ON CONFLICT (id) DO UPDATE
SET 
  memex_amount = EXCLUDED.memex_amount,
  memex_address = EXCLUDED.memex_address;