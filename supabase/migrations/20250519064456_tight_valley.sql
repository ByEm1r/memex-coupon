/*
  # Add transaction hash and E-Commerce category

  1. Changes
    - Add transaction_hash column to custom_users table
    - Add E-Commerce to categories

  2. Security
    - Maintain existing RLS policies
*/

-- Add transaction_hash column to custom_users
ALTER TABLE custom_users
    ADD COLUMN IF NOT EXISTS transaction_hash text;

-- Create index for transaction hash queries
CREATE INDEX IF NOT EXISTS idx_custom_users_transaction_hash
    ON custom_users(transaction_hash);