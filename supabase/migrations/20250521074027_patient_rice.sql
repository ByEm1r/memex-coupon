-- Add currency column to coupons table
ALTER TABLE coupons
    ADD COLUMN IF NOT EXISTS currency text DEFAULT 'MEMEX';

-- Set default currency for existing coupons
UPDATE coupons
SET currency = 'MEMEX'
WHERE currency IS NULL;