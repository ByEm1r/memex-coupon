/*
  # Create password reset requests table

  1. New Tables
    - `password_reset_requests`
      - `id` (uuid, primary key)
      - `telegram_username` (text, not null)
      - `status` (text, default: 'pending')
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `password_reset_requests` table
    - Add policy for admins to read all requests
    - Add policy for admins to update request status
    - Add policy for admins to delete requests
*/

-- Create the password reset requests table
CREATE TABLE IF NOT EXISTS password_reset_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_username text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can read all password reset requests"
  ON password_reset_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM custom_users
      WHERE custom_users.id = auth.uid()
      AND custom_users.is_admin = true
    )
  );

CREATE POLICY "Admins can update password reset requests"
  ON password_reset_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM custom_users
      WHERE custom_users.id = auth.uid()
      AND custom_users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM custom_users
      WHERE custom_users.id = auth.uid()
      AND custom_users.is_admin = true
    )
  );

CREATE POLICY "Admins can delete password reset requests"
  ON password_reset_requests
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM custom_users
      WHERE custom_users.id = auth.uid()
      AND custom_users.is_admin = true
    )
  );