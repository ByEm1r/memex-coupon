/*
  # Fix Password Reset Requests Table

  1. Changes
    - Drop and recreate password_reset_requests table with correct schema
    - Add proper RLS policies
    - Fix column references in policies
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS password_reset_requests;

-- Create password_reset_requests table
CREATE TABLE password_reset_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_username text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Enable RLS
ALTER TABLE password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can create reset requests"
ON password_reset_requests
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can read reset requests"
ON password_reset_requests
FOR SELECT
TO public
USING (true);

CREATE POLICY "Only admins can update requests"
ON password_reset_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE id = auth.uid()
    AND is_admin = true
  )
);