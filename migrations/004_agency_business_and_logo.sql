-- Tap Review AI Platform - Agency Business & Rating Card Migration
-- File: /migrations/004_agency_business_and_logo.sql

-- 1. Insert Agency Business if not exists
INSERT INTO businesses (id, name, owner_id, owner_name, owner_email, logo_url, category, plan_id, plan_name, branch_limit, monthly_token_limit, tokens_used_this_month, status)
VALUES
('biz-agency', 'Tap Review AI Agency', 'user-admin-1', 'Agency Super Admin', 'admin@agency.com', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200', 'SaaS & Marketing Agency', 'plan-enterprise', 'Enterprise Agency Plan', 50, 500000, 4200, 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    logo_url = EXCLUDED.logo_url,
    category = EXCLUDED.category;

-- 2. Insert Agency Main Branch if not exists
INSERT INTO branches (id, business_id, name, address, city, state, zip_code, phone, google_review_url, service_tags, total_reviews, avg_rating, status)
VALUES
('branch-agency-main', 'biz-agency', 'Agency Headquarters', '500 Tech Park, Suite 100', 'Mumbai', 'Maharashtra', '400051', '+91 99000 88776', 'https://search.google.com/local/writereview?placeid=ChIJAgencyReviewPlaceId', '["AI Software Setup", "Fast Customer Support", "High Marketing ROI", "Smooth Onboarding", "5-Star Service"]'::jsonb, 96, 4.98, 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    google_review_url = EXCLUDED.google_review_url;
