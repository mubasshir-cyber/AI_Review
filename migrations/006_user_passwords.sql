-- Tap Review AI Platform - Password & User Status Migration
-- File: /migrations/006_user_passwords.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT '$2a$10$wTz6CgKx7y8vL9.9uO7/E.1n2j5q1n/kZ7iW3wY3x4v5u6t7r8s9';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'ACTIVE';
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

UPDATE users SET password = '$2a$10$wTz6CgKx7y8vL9.9uO7/E.1n2j5q1n/kZ7iW3wY3x4v5u6t7r8s9' WHERE password IS NULL OR password = '' OR password = 'password123';
UPDATE users SET status = 'ACTIVE' WHERE status IS NULL;

