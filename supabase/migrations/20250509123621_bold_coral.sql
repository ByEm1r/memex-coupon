-- Add featured columns to coupons table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coupons' 
    AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE coupons 
    ADD COLUMN is_featured boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coupons' 
    AND column_name = 'featured_order'
  ) THEN
    ALTER TABLE coupons 
    ADD COLUMN featured_order integer DEFAULT 0;
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_coupons_featured 
ON coupons(is_featured, featured_order);

-- Update RLS policies for featured management
DROP POLICY IF EXISTS "Admins can manage featured status" ON coupons;

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