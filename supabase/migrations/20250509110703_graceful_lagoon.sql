/*
  # Add user_id column to password_reset_requests table

  1. Changes
    - Add `user_id` column to `password_reset_requests` table
    - Add foreign key constraint to reference `custom_users` table
    - Add index for better query performance

  2. Security
    - No changes to RLS policies needed as existing policies already handle access control
*/

-- Add user_id column with foreign key constraint
ALTER TABLE password_reset_requests 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES custom_users(id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_user_id 
ON password_reset_requests(user_id);