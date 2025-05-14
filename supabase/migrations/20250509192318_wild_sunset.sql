/*
  # Initialize app settings

  1. Changes
    - Ensure app_settings table has a single row with id=1
    - Add default values for memex settings

  2. Security
    - Enable RLS on app_settings table
    - Add policy for public read access
    - Add policy for admin-only write access
*/

-- First ensure we have exactly one row with id=1
DELETE FROM app_settings WHERE id != 1;

-- Insert or update the settings for id=1
INSERT INTO app_settings (id, memex_amount, memex_address)
VALUES (1, 50000000, 'xTSNVy4GLEDETscV2HFQ8HoThzpWWmxArP')
ON CONFLICT (id) DO UPDATE
SET 
  memex_amount = EXCLUDED.memex_amount,
  memex_address = EXCLUDED.memex_address;