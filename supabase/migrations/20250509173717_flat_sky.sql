-- Drop existing policies
DROP POLICY IF EXISTS "Only admins can update app settings" ON app_settings;

-- Create new policy for app settings
CREATE POLICY "Only admins can update app settings"
ON app_settings FOR ALL
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

-- Ensure default app settings exist
INSERT INTO app_settings (id, memex_amount, memex_address)
VALUES (1, 50000000, 'xTSNVy4GLEDETscV2HFQ8HoThzpWWmxArP')
ON CONFLICT (id) DO UPDATE
SET 
  memex_amount = EXCLUDED.memex_amount,
  memex_address = EXCLUDED.memex_address;