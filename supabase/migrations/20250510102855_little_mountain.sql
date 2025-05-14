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
DROP POLICY IF EXISTS "Anyone can read store data" ON custom_users;
DROP POLICY IF EXISTS "Anyone can manage app settings" ON app_settings;
DROP POLICY IF EXISTS "Anyone can read coupons" ON coupons;
DROP POLICY IF EXISTS "Users can manage coupons" ON coupons;

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

CREATE POLICY "Anyone can read store data"
ON custom_users
FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can update own data"
ON custom_users
FOR UPDATE
TO public
USING (true);

-- Create policies for coupons
CREATE POLICY "Anyone can read coupons"
ON coupons
FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can manage coupons"
ON coupons
FOR ALL
TO public
USING (true);

-- Create policies for app_settings
CREATE POLICY "Anyone can read app settings"
ON app_settings
FOR SELECT
TO public
USING (true);

CREATE POLICY "Anyone can manage app settings"
ON app_settings
FOR ALL
TO public
USING (true);