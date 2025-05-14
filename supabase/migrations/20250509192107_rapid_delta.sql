-- Drop all existing policies first
DO $$ 
BEGIN
  -- Drop policies for custom_users
  DROP POLICY IF EXISTS "Users can read own data" ON custom_users;
  DROP POLICY IF EXISTS "Users can update own data" ON custom_users;
  DROP POLICY IF EXISTS "Anyone can create an account" ON custom_users;

  -- Drop policies for coupons
  DROP POLICY IF EXISTS "Anyone can read approved coupons" ON coupons;
  DROP POLICY IF EXISTS "Users can create coupons" ON coupons;
  DROP POLICY IF EXISTS "Users can update own coupons" ON coupons;
  DROP POLICY IF EXISTS "Users can delete own coupons" ON coupons;
  DROP POLICY IF EXISTS "Admins can manage featured coupons" ON coupons;
  DROP POLICY IF EXISTS "read_coupons" ON coupons;
  DROP POLICY IF EXISTS "insert_coupons" ON coupons;
  DROP POLICY IF EXISTS "update_coupons" ON coupons;
  DROP POLICY IF EXISTS "delete_coupons" ON coupons;

  -- Drop policies for app_settings
  DROP POLICY IF EXISTS "Anyone can read app settings" ON app_settings;
  DROP POLICY IF EXISTS "Admins can manage app settings" ON app_settings;
  DROP POLICY IF EXISTS "Only admins can update app settings" ON app_settings;
END $$;

-- Enable RLS on all tables
ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create new policies for custom_users
CREATE POLICY "Users can read own data"
ON custom_users FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can update own data"
ON custom_users FOR UPDATE
TO authenticated
USING (id::text = auth.uid()::text OR EXISTS (
  SELECT 1 FROM custom_users
  WHERE id::text = auth.uid()::text AND is_admin = true
));

-- Create new policies for coupons
CREATE POLICY "Anyone can read approved coupons"
ON coupons FOR SELECT
TO public
USING (approved = true OR user_id::text = auth.uid()::text OR EXISTS (
  SELECT 1 FROM custom_users
  WHERE id::text = auth.uid()::text AND is_admin = true
));

CREATE POLICY "Users can create coupons"
ON coupons FOR INSERT
TO authenticated
WITH CHECK (user_id::text = auth.uid()::text OR EXISTS (
  SELECT 1 FROM custom_users
  WHERE id::text = auth.uid()::text AND is_admin = true
));

CREATE POLICY "Users can update own coupons"
ON coupons FOR UPDATE
TO authenticated
USING (user_id::text = auth.uid()::text OR EXISTS (
  SELECT 1 FROM custom_users
  WHERE id::text = auth.uid()::text AND is_admin = true
));

CREATE POLICY "Users can delete own coupons"
ON coupons FOR DELETE
TO authenticated
USING (user_id::text = auth.uid()::text OR EXISTS (
  SELECT 1 FROM custom_users
  WHERE id::text = auth.uid()::text AND is_admin = true
));

-- Create new policies for app_settings
CREATE POLICY "Anyone can read app settings"
ON app_settings FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can manage app settings"
ON app_settings FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM custom_users
  WHERE id::text = auth.uid()::text AND is_admin = true
));