-- Add negative_tags column to branches table
ALTER TABLE branches
ADD COLUMN IF NOT EXISTS negative_tags JSONB DEFAULT '[]'::jsonb;
