/*
  # Add terms acceptance to custom_users table

  1. Changes
    - Add terms_accepted column to custom_users table
    - Add terms_accepted_at timestamp column
    - Make terms acceptance required for new users
*/

-- Add terms acceptance columns
ALTER TABLE custom_users
ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_custom_users_terms_accepted 
ON custom_users(terms_accepted);