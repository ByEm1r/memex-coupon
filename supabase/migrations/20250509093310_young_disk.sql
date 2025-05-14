-- Drop existing policies
DROP POLICY IF EXISTS "Users can update own data" ON custom_users;

-- Create new policy for updating user profiles
CREATE POLICY "Users can update own data"
ON custom_users
FOR UPDATE
TO public
USING (id::text = auth.uid()::text)
WITH CHECK (id::text = auth.uid()::text);

-- Ensure RLS is enabled
ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;