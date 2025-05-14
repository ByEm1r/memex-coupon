-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create reset requests" ON password_reset_requests;
DROP POLICY IF EXISTS "Anyone can read reset requests" ON password_reset_requests;
DROP POLICY IF EXISTS "Only admins can update requests" ON password_reset_requests;

-- Create new policies
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

CREATE POLICY "Allow Edge Function"
ON password_reset_requests
FOR ALL
TO service_role
USING (true);

CREATE POLICY "Allow Service Role"
ON password_reset_requests
FOR ALL
TO service_role
USING (true);

-- Add user_id column if it doesn't exist
ALTER TABLE password_reset_requests
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES custom_users(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_user_id 
ON password_reset_requests(user_id);