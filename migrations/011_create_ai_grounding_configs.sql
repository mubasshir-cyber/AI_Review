-- Migration 011: Add google_review_url to businesses and create ai_grounding_configs table

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS google_review_url TEXT;

CREATE TABLE IF NOT EXISTS ai_grounding_configs (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
    team_size VARCHAR(128) NOT NULL DEFAULT 'Solo / Freelancer (1)',
    location_setup VARCHAR(128) NOT NULL DEFAULT 'Physical Store / Office (In-person)',
    business_age VARCHAR(128) NOT NULL DEFAULT '1 - 3 Years',
    target_audience VARCHAR(64) NOT NULL DEFAULT 'B2B',
    supported_languages JSONB NOT NULL DEFAULT '["English", "Hinglish"]'::jsonb,
    tone_enthusiasm VARCHAR(128) NOT NULL DEFAULT 'Subtle & Professional (B2B/Medical)',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_grounding_business_id ON ai_grounding_configs(business_id);
