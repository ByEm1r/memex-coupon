-- First drop all existing policies
DROP POLICY IF EXISTS "Users can read own data" ON custom_users;
DROP POLICY IF EXISTS "Users can update own data" ON custom_users;
DROP POLICY IF EXISTS "Enable public registration" ON custom_users;
DROP POLICY IF EXISTS "Anyone can read approved coupons" ON coupons;
DROP POLICY IF EXISTS "Users can create coupons" ON coupons;
DROP POLICY IF EXISTS "Users can update own coupons" ON coupons;
DROP POLICY IF EXISTS "Users can delete own coupons" ON coupons;

-- Enable RLS
ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Simple, non-recursive policies for custom_users
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
  (SELECT is_admin FROM custom_users WHERE id = auth.uid())
);

CREATE POLICY "Users can update own data"
ON custom_users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR
  (SELECT is_admin FROM custom_users WHERE id = auth.uid())
);

-- Simple, non-recursive policies for coupons
CREATE POLICY "Anyone can read approved coupons"
ON coupons
FOR SELECT
TO public
USING (
  approved = true OR
  user_id = auth.uid() OR
  (SELECT is_admin FROM custom_users WHERE id = auth.uid())
);

CREATE POLICY "Users can create coupons"
ON coupons
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR
  (SELECT is_admin FROM custom_users WHERE id = auth.uid())
);

CREATE POLICY "Users can update own coupons"
ON coupons
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR
  (SELECT is_admin FROM custom_users WHERE id = auth.uid())
);

CREATE POLICY "Users can delete own coupons"
ON coupons
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() OR
  (SELECT is_admin FROM custom_users WHERE id = auth.uid())
);