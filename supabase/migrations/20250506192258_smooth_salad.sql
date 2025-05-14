-- Drop existing tables
DROP TABLE IF EXISTS password_reset_requests CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS custom_users CASCADE;

-- Create custom_users table with plain password storage
CREATE TABLE custom_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_username text UNIQUE,
  password text, -- Store plain password
  first_name text,
  last_name text,
  country text,
  store_name text,
  brand_description text,
  brand_website text,
  brand_logo text,
  is_admin boolean DEFAULT false,
  payment_made boolean DEFAULT false,
  payment_verified boolean DEFAULT false,
  payment_verification_date timestamptz,
  preferred_currency text DEFAULT 'USD',
  created_at timestamptz DEFAULT now()
);

-- Create coupons table
CREATE TABLE coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  code text NOT NULL,
  description text,
  image_url text,
  website_link text,
  fixed_discount numeric,
  percentage_discount numeric,
  validity_date timestamptz,
  memex_payment boolean DEFAULT false,
  helpful_votes integer DEFAULT 0,
  unhelpful_votes integer DEFAULT 0,
  category text,
  country text,
  brand text,
  approved boolean DEFAULT false,
  user_id uuid REFERENCES custom_users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create password reset requests table
CREATE TABLE password_reset_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_username text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for custom_users
CREATE POLICY "Anyone can create an account"
  ON custom_users FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can read own data"
  ON custom_users FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update own data"
  ON custom_users FOR UPDATE
  TO public
  USING (auth.uid()::text = id::text);

-- Create policies for coupons
CREATE POLICY "Anyone can read approved coupons"
  ON coupons FOR SELECT
  TO public
  USING (approved = true OR auth.uid()::text = user_id::text);

CREATE POLICY "Users can create coupons"
  ON coupons FOR INSERT
  TO public
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own coupons"
  ON coupons FOR UPDATE
  TO public
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own coupons"
  ON coupons FOR DELETE
  TO public
  USING (auth.uid()::text = user_id::text);

-- Create policies for password reset requests
CREATE POLICY "Anyone can create reset requests"
  ON password_reset_requests FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can read reset requests"
  ON password_reset_requests FOR SELECT
  TO public
  USING (true);

-- Insert admin user
INSERT INTO custom_users (
  id,
  telegram_username,
  password,
  first_name,
  last_name,
  country,
  is_admin,
  payment_made,
  payment_verified
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin',
  'admin123',
  'Admin',
  'User',
  'Global',
  true,
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- Insert sample users
INSERT INTO custom_users (
  telegram_username,
  password,
  first_name,
  last_name,
  country,
  store_name,
  brand_description,
  brand_website,
  payment_made
) VALUES
  (
    'john_doe',
    'admin123',
    'John',
    'Doe',
    'USA',
    'John''s Electronics',
    'Best electronics store in town',
    'https://johnselectronics.com',
    true
  ),
  (
    'jane_smith',
    'admin123',
    'Jane',
    'Smith',
    'UK',
    'Jane''s Fashion',
    'Trendy fashion for everyone',
    'https://janesfashion.com',
    true
  ),
  (
    'store_owner',
    'admin123',
    'Store',
    'Owner',
    'Germany',
    'Tech Haven',
    'Your one-stop shop for all things tech',
    'https://techhaven.com',
    true
  );

-- Insert sample coupons
INSERT INTO coupons (
  title,
  code,
  description,
  image_url,
  website_link,
  fixed_discount,
  percentage_discount,
  validity_date,
  memex_payment,
  category,
  country,
  brand,
  approved,
  user_id
) VALUES
  (
    'Amazon 20% Off Electronics',
    'TECH20',
    'Get 20% off on all electronics. Limited time offer!',
    'https://images.pexels.com/photos/1841841/pexels-photo-1841841.jpeg',
    'https://amazon.com',
    NULL,
    20,
    (CURRENT_DATE + INTERVAL '30 days')::timestamptz,
    false,
    'Electronics',
    'USA',
    'Amazon',
    true,
    (SELECT id FROM custom_users WHERE telegram_username = 'store_owner')
  ),
  (
    'Nike MEMEX Special: 30% Off',
    'MEMEX30',
    'Exclusive 30% discount for MEMEX users on all Nike products',
    'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
    'https://nike.com',
    NULL,
    30,
    (CURRENT_DATE + INTERVAL '60 days')::timestamptz,
    true,
    'Clothing',
    'USA',
    'Nike',
    true,
    (SELECT id FROM custom_users WHERE telegram_username = 'store_owner')
  ),
  (
    'Apple Store $100 Off',
    'APPLE100',
    'Special $100 off on select Apple products',
    'https://images.pexels.com/photos/1294886/pexels-photo-1294886.jpeg',
    'https://apple.com',
    100,
    NULL,
    (CURRENT_DATE + INTERVAL '45 days')::timestamptz,
    false,
    'Electronics',
    'USA',
    'Apple',
    true,
    (SELECT id FROM custom_users WHERE telegram_username = 'john_doe')
  ),
  (
    'Samsung TV Deal',
    'SAMSUNGTV',
    'Get $200 off on Samsung Smart TVs',
    'https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg',
    'https://samsung.com',
    200,
    NULL,
    (CURRENT_DATE + INTERVAL '30 days')::timestamptz,
    false,
    'Electronics',
    'South Korea',
    'Samsung',
    true,
    (SELECT id FROM custom_users WHERE telegram_username = 'jane_smith')
  ),
  (
    'MEMEX Gaming Bundle',
    'MEMEXGAME',
    'Special gaming bundle discount for MEMEX users',
    'https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg',
    'https://gaming.com',
    150,
    NULL,
    (CURRENT_DATE + INTERVAL '60 days')::timestamptz,
    true,
    'Electronics',
    'USA',
    'GameStop',
    true,
    (SELECT id FROM custom_users WHERE telegram_username = 'store_owner')
  );