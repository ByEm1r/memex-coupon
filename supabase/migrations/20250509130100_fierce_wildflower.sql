/*
  # Add default app settings row

  1. Changes
    - Insert default row into app_settings table if it doesn't exist
    - Set default values for memex_amount and memex_address
  
  2. Security
    - No changes to RLS policies
*/

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM app_settings WHERE id = 1) THEN
    INSERT INTO app_settings (id, memex_amount, memex_address)
    VALUES (1, 50000000, 'xTSNVy4GLEDETscV2HFQ8HoThzpWWmxArP');
  END IF;
END $$;