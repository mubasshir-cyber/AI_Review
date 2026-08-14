-- Tap Review AI Platform - Schema Update
-- File: /migrations/003_add_business_profile_columns.sql

-- Add newly required profile fields to the businesses table if they don't already exist.
-- This ensures existing deployments receive the columns without dropping existing data.

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS working_hours TEXT;
