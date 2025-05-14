-- Insert admin user if not exists
INSERT INTO custom_users (
  id,
  telegram_username,
  first_name,
  last_name,
  country,
  password_hash,
  is_admin
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin',
  'Admin',
  'User',
  'Global',
  '$2a$10$zXzfvHpWVWrWNtPUuHGiXOgbz1CMbT2E.2wqHYvvxjxGNJQzDnFZy', -- admin123
  true
) ON CONFLICT (id) DO NOTHING;

-- Insert sample users
INSERT INTO custom_users (
  telegram_username,
  first_name,
  last_name,
  country,
  password_hash
) VALUES
  ('john_doe', 'John', 'Doe', 'USA', '$2a$10$zXzfvHpWVWrWNtPUuHGiXOgbz1CMbT2E.2wqHYvvxjxGNJQzDnFZy'),
  ('jane_smith', 'Jane', 'Smith', 'UK', '$2a$10$zXzfvHpWVWrWNtPUuHGiXOgbz1CMbT2E.2wqHYvvxjxGNJQzDnFZy'),
  ('store_owner', 'Store', 'Owner', 'Germany', '$2a$10$zXzfvHpWVWrWNtPUuHGiXOgbz1CMbT2E.2wqHYvvxjxGNJQzDnFZy');

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