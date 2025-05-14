/*
  # Update users schema to use email instead of telegram_username
  
  1. Changes
    - Add email column to custom_users
    - Drop telegram_username column
    - Update admin and sample users
    - Update password reset requests table
    
  2. Security
    - Maintain existing RLS policies
*/

-- First add the new email column
ALTER TABLE custom_users 
  ADD COLUMN IF NOT EXISTS email text;

-- Copy existing telegram_username values to email
UPDATE custom_users
SET email = telegram_username;

-- Make email required and unique
ALTER TABLE custom_users
  ALTER COLUMN email SET NOT NULL,
  ADD CONSTRAINT custom_users_email_key UNIQUE (email);

-- Update admin user
UPDATE custom_users
SET 
  email = 'admin@memex.com',
  password = 'admin123',
  store_name = 'Admin Store'
WHERE is_admin = true;

-- Update sample users
UPDATE custom_users
SET 
  email = 'store1@example.com',
  store_name = 'Electronics Store'
WHERE telegram_username = 'john_doe';

UPDATE custom_users
SET 
  email = 'store2@example.com',
  store_name = 'Fashion Store'
WHERE telegram_username = 'jane_smith';

UPDATE custom_users
SET 
  email = 'store3@example.com',
  store_name = 'Tech Store'
WHERE telegram_username = 'store_owner';

-- Update password reset requests table
ALTER TABLE password_reset_requests
  ADD COLUMN IF NOT EXISTS email text;

-- Copy existing telegram_username values to email in password_reset_requests
UPDATE password_reset_requests
SET email = telegram_username;

-- Make email required in password_reset_requests
ALTER TABLE password_reset_requests
  ALTER COLUMN email SET NOT NULL;

-- Drop the old telegram_username columns
ALTER TABLE custom_users
  DROP COLUMN IF EXISTS telegram_username CASCADE;

ALTER TABLE password_reset_requests
  DROP COLUMN IF EXISTS telegram_username CASCADE;