-- First drop all existing policies
DROP POLICY IF EXISTS "Users can read own data" ON custom_users;
DROP POLICY IF EXISTS "Users can update own data" ON custom_users;
DROP POLICY IF EXISTS "Enable public registration" ON custom_users;
DROP POLICY IF EXISTS "Anyone can read approved coupons" ON coupons;
DROP POLICY IF EXISTS "Users can create coupons" ON coupons;
DROP POLICY IF EXISTS "Users can update own coupons" ON coupons;
DROP POLICY IF EXISTS "Users can delete own coupons" ON coupons;
DROP POLICY IF EXISTS "Anyone can read app settings" ON app_settings;
DROP POLICY IF EXISTS "Admins can manage app settings" ON app_settings;

-- Enable RLS
ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Simple policies for custom_users
CREATE POLICY "Enable public registration"
ON custom_users
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can read own data"
ON custom_users
FOR SELECT
TO public
USING (
  auth.uid() = id OR
  (SELECT is_admin FROM custom_users WHERE id = auth.uid() LIMIT 1)
);

CREATE POLICY "Users can update own data"
ON custom_users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR
  (SELECT is_admin FROM custom_users WHERE id = auth.uid() LIMIT 1)
);

-- Simple policies for coupons
CREATE POLICY "Anyone can read approved coupons"
ON coupons
FOR SELECT
TO public
USING (
  approved = true OR
  user_id = auth.uid() OR
  (SELECT is_admin FROM custom_users WHERE id = auth.uid() LIMIT 1)
);

CREATE POLICY "Users can create coupons"
ON coupons
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR
  (SELECT is_admin FROM custom_users WHERE id = auth.uid() LIMIT 1)
);

CREATE POLICY "Users can update own coupons"
ON coupons
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR
  (SELECT is_admin FROM custom_users WHERE id = auth.uid() LIMIT 1)
);

CREATE POLICY "Users can delete own coupons"
ON coupons
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() OR
  (SELECT is_admin FROM custom_users WHERE id = auth.uid() LIMIT 1)
);

-- Simple policies for app_settings
CREATE POLICY "Anyone can read app settings"
ON app_settings
FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage app settings"
ON app_settings
FOR ALL
TO authenticated
USING (
  (SELECT is_admin FROM custom_users WHERE id = auth.uid() LIMIT 1)
);

-- Ensure default app settings exist
INSERT INTO app_settings (id, memex_amount, memex_address)
VALUES (1, 50000000, 'xTSNVy4GLEDETscV2HFQ8HoThzpWWmxArP')
ON CONFLICT (id) DO UPDATE
SET 
  memex_amount = EXCLUDED.memex_amount,
  memex_address = EXCLUDED.memex_address;