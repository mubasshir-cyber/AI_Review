-- Tap Review AI Platform - Token Accounting & AI Model Pricing Migration
-- File: /migrations/003_token_usage_schema.sql

-- 1. AI Models Table
CREATE TABLE IF NOT EXISTS ai_models (
    id VARCHAR(64) PRIMARY KEY,
    provider VARCHAR(64) NOT NULL DEFAULT 'Google',
    model VARCHAR(128) NOT NULL UNIQUE,
    input_cost_per_1m NUMERIC(12, 6) NOT NULL DEFAULT 0.075,
    output_cost_per_1m NUMERIC(12, 6) NOT NULL DEFAULT 0.300,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Gemini Models
INSERT INTO ai_models (id, provider, model, input_cost_per_1m, output_cost_per_1m, active)
VALUES 
    ('model-gemini-36-flash', 'Google', 'gemini-3.6-flash', 0.075000, 0.300000, true),
    ('model-gemini-15-flash', 'Google', 'gemini-1.5-flash', 0.075000, 0.300000, true),
    ('model-gemini-15-pro', 'Google', 'gemini-1.5-pro', 1.250000, 5.000000, true)
ON CONFLICT (model) DO UPDATE SET
    input_cost_per_1m = EXCLUDED.input_cost_per_1m,
    output_cost_per_1m = EXCLUDED.output_cost_per_1m;

-- 2. Token Usage Table
CREATE TABLE IF NOT EXISTS token_usage (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) REFERENCES businesses(id) ON DELETE CASCADE,
    branch_id VARCHAR(64) REFERENCES branches(id) ON DELETE SET NULL,
    review_id VARCHAR(64) REFERENCES reviews(id) ON DELETE SET NULL,
    provider VARCHAR(64) NOT NULL DEFAULT 'Google',
    model VARCHAR(128) NOT NULL DEFAULT 'gemini-3.6-flash',
    prompt_tokens INT NOT NULL DEFAULT 0,
    completion_tokens INT NOT NULL DEFAULT 0,
    total_tokens INT NOT NULL DEFAULT 0,
    estimated_cost NUMERIC(12, 6) NOT NULL DEFAULT 0.000000,
    request_status VARCHAR(32) NOT NULL DEFAULT 'SUCCESS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_usage_business_id ON token_usage(business_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_branch_id ON token_usage(branch_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_created_at ON token_usage(created_at);

-- 3. Business Table Schema Extensions
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS monthly_tokens_used INT NOT NULL DEFAULT 0;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS remaining_tokens INT NOT NULL DEFAULT 50000;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS last_token_reset_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 4. Plans Table Schema Extensions
ALTER TABLE plans ADD COLUMN IF NOT EXISTS monthly_token_limit INT NOT NULL DEFAULT 50000;

-- 5. Subscriptions Table Schema Extensions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 month');

-- 6. Reviews Table Schema Extensions
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS token_usage_id VARCHAR(64) REFERENCES token_usage(id) ON DELETE SET NULL;
