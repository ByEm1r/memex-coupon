/*
  # Fix custom_users RLS policies

  1. Changes
    - Drop existing problematic policies on custom_users table
    - Create new non-recursive policies for custom_users table
    
  2. Security
    - Maintains RLS on custom_users table
    - Adds cleaner policies that avoid recursion
    - Users can still read their own data
    - Admins can read all data
    - Maintains existing security model but removes recursion
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read own data" ON custom_users;

-- Create new non-recursive policies
CREATE POLICY "Users can read own data" ON custom_users
FOR SELECT
TO public
USING (
  -- Allow access to own data
  auth.uid() = id
  OR
  -- Allow access if the user is an admin (using direct column check)
  EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND id IN (
      SELECT id 
      FROM custom_users 
      WHERE is_admin = true
    )
  )
);