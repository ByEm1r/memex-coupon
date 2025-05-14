/*
  # Fix app_settings table structure

  1. Changes
    - Drop and recreate app_settings table with correct columns
    - Add proper RLS policies
    - Insert default values

  2. Security
    - Maintain existing RLS policies
    - Allow public read access
    - Restrict updates to admin users
*/

-- Drop existing table
DROP TABLE IF EXISTS app_settings;

-- Create app_settings table with correct structure
CREATE TABLE app_settings (
  id integer PRIMARY KEY,
  memex_amount integer NOT NULL DEFAULT 50000000,
  memex_address text NOT NULL DEFAULT 'xTSNVy4GLEDETscV2HFQ8HoThzpWWmxArP',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read app settings"
  ON app_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can update app settings"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM custom_users
    WHERE id = auth.uid()
    AND is_admin = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM custom_users
    WHERE id = auth.uid()
    AND is_admin = true
  ));

-- Insert default settings
INSERT INTO app_settings (id, memex_amount, memex_address)
VALUES (1, 50000000, 'xTSNVy4GLEDETscV2HFQ8HoThzpWWmxArP')
ON CONFLICT (id) DO UPDATE
SET 
  memex_amount = EXCLUDED.memex_amount,
  memex_address = EXCLUDED.memex_address;