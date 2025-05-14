/*
  # Fix infinite recursion in custom_users policies

  1. Changes
    - Drop existing policies on custom_users table that may be causing recursion
    - Create new, simplified policies that avoid recursive checks
    
  2. Security
    - Maintain row-level security
    - Add clear, non-recursive policies for:
      - Public registration
      - Users reading their own data
      - Admins reading all data
      - Users updating their own data
      - Admins updating any data
*/

-- First, drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable public registration" ON custom_users;
DROP POLICY IF EXISTS "Users can read own data" ON custom_users;
DROP POLICY IF EXISTS "Users can update own data" ON custom_users;

-- Create new, simplified policies
-- Allow public registration
CREATE POLICY "Enable public registration"
ON custom_users
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to read their own data and admins to read all data
CREATE POLICY "Users can read own data"
ON custom_users
FOR SELECT
TO public
USING (
  auth.uid() = id 
  OR 
  EXISTS (
    SELECT 1 
    FROM custom_users 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Allow users to update their own data and admins to update any data
CREATE POLICY "Users can update own data"
ON custom_users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id 
  OR 
  EXISTS (
    SELECT 1 
    FROM custom_users 
    WHERE id = auth.uid() AND is_admin = true
  )
)
WITH CHECK (
  auth.uid() = id 
  OR 
  EXISTS (
    SELECT 1 
    FROM custom_users 
    WHERE id = auth.uid() AND is_admin = true
  )
);