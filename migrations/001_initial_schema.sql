-- Tap Review AI Platform - PostgreSQL Migration Schema
-- File: /migrations/001_initial_schema.sql

-- Enable UUID extension if available
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EXCEPTION WHEN OTHERS THEN
    -- Extension might already exist or permission restricted
    NULL;
END $$;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'BUSINESS_OWNER',
    business_id VARCHAR(64),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SaaS Plans Table
CREATE TABLE IF NOT EXISTS plans (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price_monthly NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    price_yearly NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    max_branches INT NOT NULL DEFAULT 1,
    monthly_tokens INT NOT NULL DEFAULT 10000,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_popular BOOLEAN DEFAULT FALSE,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE'
);

-- 3. Businesses Table
CREATE TABLE IF NOT EXISTS businesses (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id VARCHAR(64) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    owner_email VARCHAR(255) NOT NULL,
    logo_url TEXT,
    phone TEXT,
    address TEXT,
    website TEXT,
    description TEXT,
    working_hours TEXT,
    category VARCHAR(128) NOT NULL DEFAULT 'General',
    plan_id VARCHAR(64) REFERENCES plans(id) ON DELETE SET NULL,
    plan_name VARCHAR(255) NOT NULL DEFAULT 'Starter Plan',
    branch_limit INT NOT NULL DEFAULT 5,
    monthly_token_limit INT NOT NULL DEFAULT 50000,
    tokens_used_this_month INT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Branches Table
CREATE TABLE IF NOT EXISTS branches (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL DEFAULT '',
    city VARCHAR(128) NOT NULL DEFAULT '',
    state VARCHAR(128) NOT NULL DEFAULT '',
    zip_code VARCHAR(32) NOT NULL DEFAULT '',
    phone VARCHAR(64) NOT NULL DEFAULT '',
    google_place_id VARCHAR(255),
    google_review_url TEXT NOT NULL,
    qr_code_url TEXT,
    service_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_reviews INT NOT NULL DEFAULT 0,
    avg_rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Reviews Table (Public 5-Star Reviews)
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(64) PRIMARY KEY,
    branch_id VARCHAR(64) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    branch_name VARCHAR(255) NOT NULL,
    business_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    service_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    review_text TEXT NOT NULL,
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    ai_generated BOOLEAN DEFAULT TRUE,
    posted_to_google BOOLEAN DEFAULT FALSE,
    copied_to_clipboard BOOLEAN DEFAULT FALSE,
    tokens_used INT DEFAULT 280,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Feedback Table (Gated Negative Reviews < 4 Stars)
CREATE TABLE IF NOT EXISTS feedback (
    id VARCHAR(64) PRIMARY KEY,
    branch_id VARCHAR(64) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    branch_name VARCHAR(255) NOT NULL,
    business_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    category VARCHAR(128) NOT NULL DEFAULT 'Service Quality',
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(64),
    comments TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'NEW',
    owner_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Advertisements Table (Agency Promotional Banners)
CREATE TABLE IF NOT EXISTS advertisements (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    banner_bg_color VARCHAR(128) DEFAULT 'bg-gradient-to-r from-blue-600 to-purple-600',
    banner_text_color VARCHAR(128) DEFAULT 'text-white',
    cta_text VARCHAR(128) NOT NULL DEFAULT 'Learn More',
    cta_link TEXT NOT NULL DEFAULT 'https://tapreview.ai/upgrade',
    target_plan_id VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id VARCHAR(64) PRIMARY KEY,
    business_id VARCHAR(64) NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    plan_id VARCHAR(64) NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    plan_name VARCHAR(255) NOT NULL,
    billing_cycle VARCHAR(32) NOT NULL DEFAULT 'MONTHLY',
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    next_billing_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. System Settings & API Key Configuration Table
CREATE TABLE IF NOT EXISTS api_key_configs (
    id INT PRIMARY KEY DEFAULT 1,
    gemini_api_key TEXT,
    openai_api_key TEXT,
    primary_model VARCHAR(128) DEFAULT 'google/gemini-2.5-flash-lite',
    prompt_template TEXT,
    temperature NUMERIC(3, 2) DEFAULT 0.70,
    is_custom_key_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY DEFAULT 1,
    agency_name VARCHAR(255) DEFAULT 'Tap Review AI Agency Studio',
    support_email VARCHAR(255) DEFAULT 'support@tapreview.ai',
    google_redirect_delay_ms INT DEFAULT 1500,
    min_star_for_google INT DEFAULT 4,
    default_prompt TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_branches_business_id ON branches(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_branch_id ON reviews(branch_id);
CREATE INDEX IF NOT EXISTS idx_feedback_business_id ON feedback(business_id);
CREATE INDEX IF NOT EXISTS idx_feedback_branch_id ON feedback(branch_id);
