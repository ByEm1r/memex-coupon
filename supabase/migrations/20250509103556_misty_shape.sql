-- Drop existing policies
DROP POLICY IF EXISTS "Users can update own data" ON custom_users;
DROP POLICY IF EXISTS "Users can create coupons" ON coupons;
DROP POLICY IF EXISTS "Users can update own coupons" ON coupons;
DROP POLICY IF EXISTS "Only admins can update app settings" ON app_settings;

-- Create new policies with proper checks
CREATE POLICY "Users can update own data"
ON custom_users
FOR UPDATE
TO public
USING (id::text = auth.uid()::text)
WITH CHECK (id::text = auth.uid()::text);

CREATE POLICY "Users can create coupons"
ON coupons
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE id = auth.uid() 
    AND (payment_verified = true OR is_admin = true)
  )
);

CREATE POLICY "Users can update own coupons"
ON coupons
FOR UPDATE
TO authenticated
USING (
  user_id::text = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE id = auth.uid() AND is_admin = true
  )
)
WITH CHECK (
  user_id::text = auth.uid()::text OR
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Only admins can update app settings"
ON app_settings
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE id = auth.uid() AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Ensure all tables have RLS enabled
ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_custom_users_payment_verified ON custom_users(payment_verified);
CREATE INDEX IF NOT EXISTS idx_custom_users_is_admin ON custom_users(is_admin);
CREATE INDEX IF NOT EXISTS idx_coupons_user_id ON coupons(user_id);