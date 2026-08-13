-- Tap Review AI Platform - Seed Data Script
-- File: /migrations/002_seed_data.sql

-- 1. Seed Plans
INSERT INTO plans (id, name, price_monthly, price_yearly, max_branches, monthly_tokens, features, is_popular, status)
VALUES
('plan-starter', 'Starter Plan', 29.00, 290.00, 2, 20000, '["Up to 2 Branches", "20,000 AI Tokens/mo", "Basic QR Poster Download", "Google Review Auto-Redirect"]'::jsonb, false, 'ACTIVE'),
('plan-pro', 'Professional Plan', 69.00, 690.00, 5, 50000, '["Up to 5 Branches", "50,000 AI Tokens/mo", "Custom Branding & QR Studio", "Negative Feedback Gatekeeper", "Priority Support"]'::jsonb, true, 'ACTIVE'),
('plan-enterprise', 'Enterprise Agency Plan', 199.00, 1990.00, 25, 250000, '["Up to 25 Branches", "250,000 AI Tokens/mo", "Multi-Location QR Table Tents", "Full API Access & Webhooks", "Dedicated Account Manager"]'::jsonb, false, 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price_monthly = EXCLUDED.price_monthly;

-- 2. Seed Users
INSERT INTO users (id, email, name, role, business_id, avatar_url)
VALUES
('user-admin-1', 'admin@agency.com', 'Agency Super Admin', 'AGENCY_ADMIN', NULL, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'),
('user-owner-smile', 'owner@business.com', 'Dr. Michael Carter', 'BUSINESS_OWNER', 'biz-smile-dental', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Businesses (Matching diagram: Smile Dental Clinic, Bright Coaching, Green Mart)
INSERT INTO businesses (id, name, owner_id, owner_name, owner_email, logo_url, category, plan_id, plan_name, branch_limit, monthly_token_limit, tokens_used_this_month, status)
VALUES
('biz-smile-dental', 'Smile Dental Clinic', 'user-owner-smile', 'Dr. Michael Carter', 'owner@business.com', 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=200', 'Healthcare & Dental', 'plan-pro', 'Professional Plan', 10, 100000, 12500, 'ACTIVE'),
('biz-bright-coaching', 'Bright Coaching Institute', 'user-owner-bright', 'Sarah Jenkins', 'sarah@brightcoaching.com', NULL, 'Education & Tutoring', 'plan-pro', 'Professional Plan', 5, 50000, 18400, 'ACTIVE'),
('biz-green-mart', 'Green Mart Supermarket', 'user-owner-green', 'Rahul Sharma', 'rahul@greenmart.in', NULL, 'Retail & Grocery', 'plan-starter', 'Starter Plan', 5, 50000, 8900, 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, branch_limit = EXCLUDED.branch_limit;

-- 4. Seed Branches (Matching diagram: Main Branch, Andheri Branch, Thane Branch, Downtown)
INSERT INTO branches (id, business_id, name, address, city, state, zip_code, phone, google_review_url, service_tags, total_reviews, avg_rating, status)
VALUES
('branch-smile-main', 'biz-smile-dental', 'Main Branch', '102 Marine Lines, Fort', 'Mumbai', 'Maharashtra', '400001', '+91 98200 11223', 'https://search.google.com/local/writereview?placeid=ChIJN1t_t_U02jAR302001', '["Friendly Staff", "Gentle Care", "Clean Environment", "Painless Treatment", "Quick Service"]'::jsonb, 142, 4.95, 'ACTIVE'),
('branch-smile-andheri', 'biz-smile-dental', 'Andheri Branch', '405 Link Road, Andheri West', 'Mumbai', 'Maharashtra', '400053', '+91 98200 44556', 'https://search.google.com/local/writereview?placeid=ChIJN1t_t_U02jAR302002', '["Friendly Staff", "Gentle Care", "Clean Environment", "Great Value"]'::jsonb, 88, 4.88, 'ACTIVE'),
('branch-smile-thane', 'biz-smile-dental', 'Thane Branch', '201 Ghodbunder Road', 'Thane', 'Maharashtra', '400607', '+91 98200 77889', 'https://search.google.com/local/writereview?placeid=ChIJN1t_t_U02jAR302003', '["Painless Treatment", "Quick Appointment", "Modern Equipment"]'::jsonb, 64, 4.90, 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 5. Seed Advertisements (Matching diagram: "Special Offer! Get 20% OFF on all services", "Boost Your Business")
INSERT INTO advertisements (id, title, description, banner_bg_color, cta_text, cta_link, status, impressions, clicks)
VALUES
('ad-boost-1', '🚀 Boost Your Business with AI Reviews!', 'Get 3x more 5-star Google Reviews automatically with QR tabletop stands.', 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700', 'Learn More', 'https://tapreview.ai/growth', 'ACTIVE', 1240, 185),
('ad-special-offer', '🎁 Special Offer! Get 20% OFF on all SaaS upgrades', 'Upgrade your business plan today and get unlimited AI review token generation.', 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600', 'Claim 20% Off', 'https://tapreview.ai/upgrade', 'ACTIVE', 980, 142)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- 6. Seed Reviews (5 Star AI Generated Reviews)
INSERT INTO reviews (id, branch_id, branch_name, business_id, rating, service_tags, review_text, customer_name, customer_email, ai_generated, posted_to_google, copied_to_clipboard, tokens_used)
VALUES
('rev-1', 'branch-smile-main', 'Main Branch', 'biz-smile-dental', 5, '["Gentle Care", "Friendly Staff"]'::jsonb, 'I had a fantastic experience at Smile Dental Clinic (Main Branch)! The staff was extremely friendly and Dr. Carter made the entire procedure painless and smooth.', 'Amit Verma', 'amit.v@gmail.com', true, true, true, 280),
('rev-2', 'branch-smile-andheri', 'Andheri Branch', 'biz-smile-dental', 5, '["Clean Environment", "Quick Service"]'::jsonb, 'Very clean facility and polite staff. Didn''t have to wait long for my appointment. Highly recommended for dental checkups in Andheri!', 'Priya Patel', 'priya.p@gmail.com', true, true, true, 260)
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Feedback (Negative Gated Reviews < 4 Stars)
INSERT INTO feedback (id, branch_id, branch_name, business_id, rating, category, customer_name, customer_email, customer_phone, comments, status, owner_notes)
VALUES
('fb-1', 'branch-smile-main', 'Main Branch', 'biz-smile-dental', 3, 'Wait Time', 'Rohan Mehta', 'rohan.m@gmail.com', '+91 98765 43210', 'Had to wait 25 minutes past my scheduled appointment time. Treatment was good though.', 'NEW', NULL)
ON CONFLICT (id) DO NOTHING;

-- 8. Seed API Key Config & Settings
INSERT INTO api_key_configs (id, gemini_api_key, openai_api_key, primary_model, prompt_template, temperature, is_custom_key_active)
VALUES
(1, '', '', 'google/gemini-2.5-flash-lite', 'Draft a warm, authentic 5-star Google review for {businessName} ({branchName}). Highlight: {serviceTags}. Note: {customNote}. Keep it concise under 3 sentences.', 0.70, true)
ON CONFLICT (id) DO UPDATE SET primary_model = EXCLUDED.primary_model;

INSERT INTO system_settings (id, agency_name, support_email, google_redirect_delay_ms, min_star_for_google, default_prompt)
VALUES
(1, 'Tap Review AI Agency Studio', 'support@tapreview.ai', 1500, 4, 'Default system prompt')
ON CONFLICT (id) DO UPDATE SET agency_name = EXCLUDED.agency_name;
