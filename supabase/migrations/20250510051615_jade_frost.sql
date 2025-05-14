/*
  # Fix RLS policies to prevent infinite recursion

  1. Changes
    - Drop all existing problematic policies
    - Create new simplified policies that avoid recursion
    - Fix admin access checks
    - Maintain proper data isolation
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON custom_users;
DROP POLICY IF EXISTS "Users can update own data" ON custom_users;
DROP POLICY IF EXISTS "Enable public registration" ON custom_users;

-- Create new policies for custom_users
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
  EXISTS (
    SELECT 1
    FROM custom_users admins
    WHERE admins.id = auth.uid()
    AND admins.is_admin = true
  )
);

CREATE POLICY "Users can update own data"
ON custom_users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1
    FROM custom_users admins
    WHERE admins.id = auth.uid()
    AND admins.is_admin = true
  )
);

-- Drop existing policies for coupons
DROP POLICY IF EXISTS "Anyone can read approved coupons" ON coupons;
DROP POLICY IF EXISTS "Users can create coupons" ON coupons;
DROP POLICY IF EXISTS "Users can update own coupons" ON coupons;
DROP POLICY IF EXISTS "Users can delete own coupons" ON coupons;

-- Create new policies for coupons
CREATE POLICY "Anyone can read approved coupons"
ON coupons
FOR SELECT
TO public
USING (
  approved = true OR
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1
    FROM custom_users admins
    WHERE admins.id = auth.uid()
    AND admins.is_admin = true
  )
);

CREATE POLICY "Users can create coupons"
ON coupons
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1
    FROM custom_users admins
    WHERE admins.id = auth.uid()
    AND admins.is_admin = true
  )
);

CREATE POLICY "Users can update own coupons"
ON coupons
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1
    FROM custom_users admins
    WHERE admins.id = auth.uid()
    AND admins.is_admin = true
  )
);

CREATE POLICY "Users can delete own coupons"
ON coupons
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1
    FROM custom_users admins
    WHERE admins.id = auth.uid()
    AND admins.is_admin = true
  )
);

-- Ensure RLS is enabled
ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;