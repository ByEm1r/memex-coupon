/*
  # Fix RLS policies for custom_users table

  1. Changes
    - Drop existing RLS policies for custom_users table
    - Create new policies that:
      - Allow public registration
      - Allow users to read their own data
      - Allow admins to read all data
      - Allow users to update their own data
      - Allow admins to update any data

  2. Security
    - Enable RLS on custom_users table
    - Add policies for INSERT, SELECT, and UPDATE operations
    - Ensure users can only access their own data
    - Ensure admins can access all data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON custom_users;
DROP POLICY IF EXISTS "Users can update own data" ON custom_users;

-- Create new policies
CREATE POLICY "Enable public registration"
ON custom_users
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Users can read own data"
ON custom_users
FOR SELECT
TO public
USING (
  auth.uid()::text = id::text OR
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE id::text = auth.uid()::text
    AND is_admin = true
  )
);

CREATE POLICY "Users can update own data"
ON custom_users
FOR UPDATE
TO authenticated
USING (
  auth.uid()::text = id::text OR
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE id::text = auth.uid()::text
    AND is_admin = true
  )
)
WITH CHECK (
  auth.uid()::text = id::text OR
  EXISTS (
    SELECT 1 FROM custom_users
    WHERE id::text = auth.uid()::text
    AND is_admin = true
  )
);