-- Drop existing admin user if exists
DELETE FROM custom_users WHERE email = 'admin@memex.com';

-- Create new admin user with proper UUID
INSERT INTO custom_users (
  id,
  email,
  password,
  store_name,
  is_admin,
  payment_made,
  payment_verified,
  country
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',  -- Fixed UUID for admin
  'admin@memex.com',
  'admin123',
  'Admin Store',
  true,
  true,
  true,
  'Global'
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password = EXCLUDED.password,
  store_name = EXCLUDED.store_name,
  is_admin = EXCLUDED.is_admin;