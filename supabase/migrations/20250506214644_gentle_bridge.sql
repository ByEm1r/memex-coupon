/*
  # Add RLS policies for coupons table

  1. Security Changes
    - Enable RLS on coupons table
    - Add policies for:
      - Insert: Authenticated users can create coupons with their user_id
      - Select: Anyone can read approved coupons, users can read their own
      - Update: Users can update their own coupons, admins can update any
      - Delete: Users can delete their own coupons, admins can delete any

  2. Notes
    - Policies ensure users can only manage their own coupons
    - Admins have full access to all coupons
    - Public users can only view approved coupons
*/

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can read approved coupons" ON coupons;
DROP POLICY IF EXISTS "Users can create coupons" ON coupons;
DROP POLICY IF EXISTS "Users can update own coupons" ON coupons;
DROP POLICY IF EXISTS "Users can delete own coupons" ON coupons;

-- Create new policies
CREATE POLICY "Anyone can read approved coupons"
ON coupons
FOR SELECT
TO public
USING (
  approved = true OR 
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Users can create coupons"
ON coupons
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Users can update own coupons"
ON coupons
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE id = auth.uid() AND is_admin = true
  )
)
WITH CHECK (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Users can delete own coupons"
ON coupons
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE id = auth.uid() AND is_admin = true
  )
);