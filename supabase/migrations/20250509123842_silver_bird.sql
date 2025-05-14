-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
DO $$ 
BEGIN
  -- For custom_users table
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_updated_at_custom_users'
  ) THEN
    CREATE TRIGGER set_updated_at_custom_users
    BEFORE UPDATE ON custom_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- For coupons table
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_updated_at_coupons'
  ) THEN
    CREATE TRIGGER set_updated_at_coupons
    BEFORE UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- For app_settings table
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_updated_at_app_settings'
  ) THEN
    CREATE TRIGGER set_updated_at_app_settings
    BEFORE UPDATE ON app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Ensure all tables have updated_at column
ALTER TABLE custom_users 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE coupons 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

ALTER TABLE app_settings 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Update RLS policies to ensure proper data access
ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Recreate policies with proper checks
DROP POLICY IF EXISTS "Users can update own data" ON custom_users;
CREATE POLICY "Users can update own data"
ON custom_users
FOR UPDATE
TO public
USING (id::text = auth.uid()::text)
WITH CHECK (id::text = auth.uid()::text);

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coupons_featured ON coupons(is_featured, featured_order);
CREATE INDEX IF NOT EXISTS idx_custom_users_payment_verified ON custom_users(payment_verified);
CREATE INDEX IF NOT EXISTS idx_custom_users_is_admin ON custom_users(is_admin);