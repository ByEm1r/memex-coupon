-- Drop existing policies for coupons
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
CREATE INDEX IF NOT EXISTS idx_coupons_featured 
ON coupons(is_featured, featured_order);

-- Ensure RLS is enabled
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;