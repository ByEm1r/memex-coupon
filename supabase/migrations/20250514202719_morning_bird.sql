-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create reset requests" ON password_reset_requests;
DROP POLICY IF EXISTS "Anyone can read reset requests" ON password_reset_requests;
DROP POLICY IF EXISTS "Allow Edge Function" ON password_reset_requests;
DROP POLICY IF EXISTS "Allow Service Role" ON password_reset_requests;

-- Enable RLS
ALTER TABLE password_reset_requests ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Allow all operations for service role"
ON password_reset_requests
FOR ALL
TO service_role
USING (true);

-- Create policy for updating reset requests
CREATE POLICY "Allow update operations"
ON password_reset_requests
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Update trigger function
CREATE OR REPLACE FUNCTION update_password_reset_handled_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status AND NEW.status IN ('approved', 'rejected') THEN
    NEW.handled_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
DROP TRIGGER IF EXISTS update_password_reset_handled_at_trigger ON password_reset_requests;
CREATE TRIGGER update_password_reset_handled_at_trigger
  BEFORE UPDATE ON password_reset_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_password_reset_handled_at();

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_status 
ON password_reset_requests(status);

CREATE INDEX IF NOT EXISTS idx_password_reset_requests_handled_at 
ON password_reset_requests(handled_at);

-- Reset any stuck pending requests
UPDATE password_reset_requests 
SET status = 'pending', handled_at = NULL 
WHERE status = 'pending' AND handled_at IS NOT NULL;