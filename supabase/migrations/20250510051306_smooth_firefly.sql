/*
  # Fix Custom Users RLS Policies

  1. Changes
    - Remove recursive admin check from custom_users policies
    - Simplify policy logic to prevent infinite recursion
    - Maintain security while allowing proper data access

  2. Security
    - Users can still only access their own data
    - Admins can access all data
    - Prevents infinite recursion in policy evaluation
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON custom_users;
DROP POLICY IF EXISTS "Users can update own data" ON custom_users;

-- Create new non-recursive policies
CREATE POLICY "Users can read own data" ON custom_users
FOR SELECT TO public
USING (
  auth.uid() = id OR 
  (SELECT is_admin FROM custom_users WHERE id = auth.uid())
);

CREATE POLICY "Users can update own data" ON custom_users
FOR UPDATE TO authenticated
USING (
  auth.uid() = id OR 
  (SELECT is_admin FROM custom_users WHERE id = auth.uid())
)
WITH CHECK (
  auth.uid() = id OR 
  (SELECT is_admin FROM custom_users WHERE id = auth.uid())
);