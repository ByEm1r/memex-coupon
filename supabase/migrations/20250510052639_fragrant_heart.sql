-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON custom_users;
DROP POLICY IF EXISTS "Users can update own data" ON custom_users;
DROP POLICY IF EXISTS "Enable public registration" ON custom_users;
DROP POLICY IF EXISTS "Anyone can read approved coupons" ON coupons;
DROP POLICY IF EXISTS "Users can create coupons" ON coupons;
DROP POLICY IF EXISTS "Users can update own coupons" ON coupons;
DROP POLICY IF EXISTS "Users can delete own coupons" ON coupons;
DROP POLICY IF EXISTS "Anyone can read app settings" ON app_settings;
DROP POLICY IF EXISTS "Admins can manage app settings" ON app_settings;

-- Drop existing admin check function if exists
DROP FUNCTION IF EXISTS is_admin();

-- Create admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
DECLARE
  _is_admin boolean;
BEGIN
  SELECT is_admin INTO _is_admin
  FROM custom_users
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(_is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for custom_users
CREATE POLICY "Enable public registration"
ON custom_users
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can read own data"
ON custom_users
FOR SELECT
TO public
USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own data"
ON custom_users
FOR UPDATE
TO authenticated
USING (auth.uid() = id OR is_admin());

-- Create policies for coupons
CREATE POLICY "Anyone can read approved coupons"
ON coupons
FOR SELECT
TO public
USING (approved = true OR user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can create coupons"
ON coupons
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can update own coupons"
ON coupons
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can delete own coupons"
ON coupons
FOR DELETE
TO authenticated
USING (user_id = auth.uid() OR is_admin());

-- Create policies for app_settings
CREATE POLICY "Anyone can read app settings"
ON app_settings
FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage app settings"
ON app_settings
FOR ALL
TO authenticated
USING (is_admin());

-- Delete existing admin user if exists
DELETE FROM custom_users WHERE email = 'admin@memex.com';

-- Create new admin user with fixed UUID
INSERT INTO custom_users (
  id,
  email,
  password,
  store_name,
  is_admin,
  payment_made,
  payment_verified,
  country,
  terms_accepted,
  terms_accepted_at
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'admin@memex.com',
  'admin123',
  'Admin Store',
  true,
  true,
  true,
  'Global',
  true,
  now()
);

-- Ensure default app settings exist
INSERT INTO app_settings (id, memex_amount, memex_address)
VALUES (1, 50000000, 'xTSNVy4GLEDETscV2HFQ8HoThzpWWmxArP')
ON CONFLICT (id) DO UPDATE
SET 
  memex_amount = EXCLUDED.memex_amount,
  memex_address = EXCLUDED.memex_address;