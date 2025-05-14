/*
  # Create app_settings table

  1. New Tables
    - `app_settings`
      - `id` (integer, primary key)
      - `memex_amount` (integer)
      - `memex_address` (text)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `app_settings` table
    - Add policy for public to read app settings
    - Add policy for authenticated admins to update app settings
*/

CREATE TABLE IF NOT EXISTS app_settings (
  id integer PRIMARY KEY,
  memex_amount integer NOT NULL DEFAULT 0,
  memex_address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to app settings
CREATE POLICY "Anyone can read app settings" 
  ON app_settings
  FOR SELECT
  TO public
  USING (true);

-- Only admins can update app settings
CREATE POLICY "Only admins can update app settings"
  ON app_settings
  FOR UPDATE
  TO authenticated
  USING ((SELECT is_admin FROM custom_users WHERE id = auth.uid()))
  WITH CHECK ((SELECT is_admin FROM custom_users WHERE id = auth.uid()));

-- Insert default settings row
INSERT INTO app_settings (id, memex_amount, memex_address)
VALUES (1, 0, '')
ON CONFLICT (id) DO NOTHING;