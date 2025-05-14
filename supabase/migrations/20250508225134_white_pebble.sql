/*
  # Add telegram_username column to custom_users table

  1. Changes
    - Add `telegram_username` column to `custom_users` table
      - Type: text
      - Nullable: true (to maintain compatibility with existing records)

  2. Security
    - No changes to RLS policies needed
    - Column inherits existing table-level security
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'custom_users' 
    AND column_name = 'telegram_username'
  ) THEN
    ALTER TABLE custom_users 
    ADD COLUMN telegram_username text;
  END IF;
END $$;