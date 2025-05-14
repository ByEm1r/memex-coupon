/*
  # Add featured coupons functionality

  1. Changes
    - Add is_featured column to coupons table
    - Add featured_order column for controlling display order
    - Add RLS policies for featured coupon management
    - Add index for better performance

  2. Security
    - Only admins can mark coupons as featured
    - Anyone can read featured status
*/

-- Add new columns to coupons table
ALTER TABLE coupons
ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_order integer DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_coupons_featured 
ON coupons(is_featured, featured_order);

-- Update RLS policies to allow admins to manage featured status
CREATE POLICY "Admins can manage featured status"
ON coupons
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