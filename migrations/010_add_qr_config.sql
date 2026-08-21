-- Add qr_config column to branches table
ALTER TABLE branches
ADD COLUMN IF NOT EXISTS qr_config JSONB;
