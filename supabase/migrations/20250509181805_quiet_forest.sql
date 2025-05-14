/*
  # Fix featured coupons functionality

  1. Changes
    - Add missing columns if they don't exist
    - Update RLS policies for featured coupons
    - Add proper indexes
*/

-- Add columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coupons' 
    AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE coupons ADD COLUMN is_featured boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coupons' 
    AND column_name = 'featured_order'
  ) THEN
    ALTER TABLE coupons ADD COLUMN featured_order integer DEFAULT 0;
  END IF;
END $$;

-- Drop existing featured policies
DROP POLICY IF EXISTS "Admins can manage featured coupons" ON coupons;
DROP POLICY IF EXISTS "Admins can manage featured status" ON coupons;

-- Create new policy for managing featured coupons
CREATE POLICY "Admins can manage featured coupons"
ON coupons
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE custom_users.id::text = auth.uid()::text
    AND custom_users.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE custom_users.id::text = auth.uid()::text
    AND custom_users.is_admin = true
  )
);

-- Create index for better performance
DROP INDEX IF EXISTS idx_coupons_featured;
CREATE INDEX idx_coupons_featured ON coupons(is_featured, featured_order);

-- Ensure RLS is enabled
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;