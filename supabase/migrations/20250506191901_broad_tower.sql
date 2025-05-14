/*
  # Create initial database schema

  1. New Tables
    - `custom_users`
      - `id` (uuid, primary key)
      - `telegram_username` (text)
      - `first_name` (text)
      - `last_name` (text)
      - `country` (text)
      - `password_hash` (text)
      - `is_admin` (boolean)
      - `created_at` (timestamp)
      
    - `coupons`
      - `id` (uuid, primary key)
      - `title` (text)
      - `code` (text)
      - `description` (text)
      - `image_url` (text)
      - `website_link` (text)
      - `fixed_discount` (numeric)
      - `percentage_discount` (numeric)
      - `validity_date` (timestamp)
      - `memex_payment` (boolean)
      - `helpful_votes` (integer)
      - `unhelpful_votes` (integer)
      - `category` (text)
      - `country` (text)
      - `brand` (text)
      - `approved` (boolean)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create custom_users table
CREATE TABLE IF NOT EXISTS custom_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_username text,
  first_name text,
  last_name text,
  country text,
  password_hash text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for custom_users
ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;

-- Create policy for custom_users
CREATE POLICY "Users can read own data" 
  ON custom_users
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
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
  user_id uuid REFERENCES custom_users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS for coupons
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Create policies for coupons
CREATE POLICY "Anyone can read approved coupons"
  ON coupons
  FOR SELECT
  TO public
  USING (approved = true);

CREATE POLICY "Users can create coupons"
  ON coupons
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coupons"
  ON coupons
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);