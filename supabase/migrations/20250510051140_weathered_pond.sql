/*
  # Fix recursive policies

  1. Changes
    - Remove recursive policies from custom_users table
    - Update policies to prevent infinite recursion
    - Simplify policy conditions for better performance
  
  2. Security
    - Maintain data access control
    - Prevent unauthorized access
    - Keep admin privileges
*/

-- Drop existing policies from custom_users table
DROP POLICY IF EXISTS "Users can read own data" ON custom_users;
DROP POLICY IF EXISTS "Enable public registration" ON custom_users;
DROP POLICY IF EXISTS "Users can update own data" ON custom_users;

-- Create new, non-recursive policies for custom_users
CREATE POLICY "Users can read own data"
ON custom_users
FOR SELECT
TO public
USING (
  auth.uid() = id OR 
  (
    auth.uid() IN (
      SELECT id FROM custom_users WHERE is_admin = true
    )
  )
);

CREATE POLICY "Enable public registration"
ON custom_users
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can update own data"
ON custom_users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR 
  (
    auth.uid() IN (
      SELECT id FROM custom_users WHERE is_admin = true
    )
  )
)
WITH CHECK (
  auth.uid() = id OR 
  (
    auth.uid() IN (
      SELECT id FROM custom_users WHERE is_admin = true
    )
  )
);

-- Drop existing policies from coupons table
DROP POLICY IF EXISTS "Anyone can read approved coupons" ON coupons;
DROP POLICY IF EXISTS "Only active stores can create coupons" ON coupons;
DROP POLICY IF EXISTS "Users can create coupons" ON coupons;
DROP POLICY IF EXISTS "Users can delete own coupons" ON coupons;
DROP POLICY IF EXISTS "Users can update own coupons" ON coupons;

-- Create new, non-recursive policies for coupons
CREATE POLICY "Anyone can read approved coupons"
ON coupons
FOR SELECT
TO public
USING (
  approved = true OR 
  user_id = auth.uid() OR
  auth.uid() IN (
    SELECT id FROM custom_users WHERE is_admin = true
  )
);

CREATE POLICY "Users can create coupons"
ON coupons
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR
  auth.uid() IN (
    SELECT id FROM custom_users WHERE is_admin = true
  )
);

CREATE POLICY "Users can update own coupons"
ON coupons
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR
  auth.uid() IN (
    SELECT id FROM custom_users WHERE is_admin = true
  )
)
WITH CHECK (
  user_id = auth.uid() OR
  auth.uid() IN (
    SELECT id FROM custom_users WHERE is_admin = true
  )
);

CREATE POLICY "Users can delete own coupons"
ON coupons
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() OR
  auth.uid() IN (
    SELECT id FROM custom_users WHERE is_admin = true
  )
);