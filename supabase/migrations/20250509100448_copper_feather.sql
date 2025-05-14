/*
  # Fix store status and admin privileges

  1. Changes
    - Add payment_verified column if not exists
    - Update admin user to have proper privileges
    - Set default values for payment verification fields
*/

-- Add payment_verified column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'custom_users' 
    AND column_name = 'payment_verified'
  ) THEN
    ALTER TABLE custom_users 
    ADD COLUMN payment_verified boolean DEFAULT false;
  END IF;
END $$;

-- Update admin user to have all privileges
UPDATE custom_users
SET 
  payment_verified = true,
  payment_made = true,
  is_admin = true
WHERE email = 'admin@memex.com';

-- Create index on payment_verified for better query performance
CREATE INDEX IF NOT EXISTS idx_custom_users_payment_verified 
ON custom_users(payment_verified);

-- Update RLS policies to consider payment_verified status
DROP POLICY IF EXISTS "Users can create coupons" ON coupons;
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