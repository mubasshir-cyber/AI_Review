-- Tap Review AI Platform - Password Reset Tokens Migration
-- File: /migrations/007_password_resets.sql

-- Add reset token columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS reset_token TEXT,
ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP WITH TIME ZONE;
