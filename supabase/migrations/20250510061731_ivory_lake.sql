-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON custom_users;
DROP POLICY IF EXISTS "Users can update own data" ON custom_users;
DROP POLICY IF EXISTS "Enable public registration" ON custom_users;

-- Enable RLS
ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;

-- Create new policies for custom_users
CREATE POLICY "Enable public registration"
ON custom_users
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can read store data"
ON custom_users
FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can update own data"
ON custom_users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE id = auth.uid()
    AND is_admin = true
  )
);

-- Insert sample store data if not exists
INSERT INTO custom_users (
  email,
  password,
  store_name,
  country,
  payment_verified,
  payment_made,
  terms_accepted,
  terms_accepted_at
) VALUES 
  (
    'store1@example.com',
    'store123',
    'Electronics Store',
    'USA',
    true,
    true,
    true,
    now()
  ),
  (
    'store2@example.com',
    'store123',
    'Fashion Store',
    'UK',
    true,
    true,
    true,
    now()
  ),
  (
    'store3@example.com',
    'store123',
    'Tech Store',
    'Germany',
    true,
    true,
    true,
    now()
  )
ON CONFLICT (email) DO NOTHING;