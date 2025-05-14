/*
  # Fix password reset request status update

  1. Changes
    - Add trigger to handle password reset request status updates
    - Ensure status and handled_at are properly updated
    - Add proper indexes for performance

  2. Security
    - Maintain existing RLS policies
    - No changes to access control
*/

-- Create trigger function to update handled_at timestamp
CREATE OR REPLACE FUNCTION update_password_reset_handled_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    NEW.handled_at = CASE 
      WHEN NEW.status IN ('approved', 'rejected') THEN now()
      ELSE NULL
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_password_reset_handled_at_trigger ON password_reset_requests;
CREATE TRIGGER update_password_reset_handled_at_trigger
  BEFORE UPDATE ON password_reset_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_password_reset_handled_at();

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_status 
ON password_reset_requests(status);

-- Create index for handled_at queries
CREATE INDEX IF NOT EXISTS idx_password_reset_requests_handled_at 
ON password_reset_requests(handled_at);