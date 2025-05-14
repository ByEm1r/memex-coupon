/*
  # Update Coupon Table RLS Policies

  1. Changes
    - Drop existing RLS policies for coupons table
    - Add new comprehensive RLS policies for:
      - INSERT: Allow authenticated users to create coupons
      - SELECT: Allow public to read approved coupons, users to read their own, admins to read all
      - UPDATE: Allow users to update their own coupons, admins to update any
      - DELETE: Allow users to delete their own coupons, admins to delete any

  2. Security
    - Maintains data isolation between users
    - Preserves admin privileges
    - Ensures proper access control for all operations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read approved coupons" ON coupons;
DROP POLICY IF EXISTS "Users can create coupons" ON coupons;
DROP POLICY IF EXISTS "Users can delete own coupons" ON coupons;
DROP POLICY IF EXISTS "Users can update own coupons" ON coupons;

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "read_coupons" ON coupons
  FOR SELECT USING (
    approved = true OR 
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM custom_users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "insert_coupons" ON coupons
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM custom_users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "update_coupons" ON coupons
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM custom_users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "delete_coupons" ON coupons
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM custom_users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );