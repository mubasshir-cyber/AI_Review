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
('user-admin-1', 'admin@agency.com', 'Agency Super Admin', 'AGENCY_ADMIN', NULL, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Businesses (Removed dummy data)

-- 4. Seed Branches (Commented out as there are no branches currently seeded)
-- INSERT INTO branches (id, business_id, name, address, city, state, zip_code, phone, google_review_url, service_tags, total_reviews, avg_rating, status)
-- VALUES ...

-- 5. Seed Advertisements (Matching diagram: "Special Offer! Get 20% OFF on all services", "Boost Your Business")
INSERT INTO advertisements (id, title, description, banner_bg_color, cta_text, cta_link, status, impressions, clicks)
VALUES
('ad-boost-1', '🚀 Boost Your Business with AI Reviews!', 'Get 3x more 5-star Google Reviews automatically with QR tabletop stands.', 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700', 'Inquire on WhatsApp', 'internal://whatsapp-enabled', 'ACTIVE', 1240, 185),
('ad-special-offer', '🎁 Special Offer! Get 20% OFF on all SaaS upgrades', 'Upgrade your business plan today and get unlimited AI review token generation.', 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600', 'Inquire on WhatsApp', 'internal://whatsapp-enabled', 'ACTIVE', 980, 142);
('ad-maintenance-notice', '🔧 Scheduled System Maintenance', 'Our platform will undergo brief routine updates tonight from 2:00 AM to 3:00 AM IST. Some services may experience brief interruptions.', 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700', 'Notice', 'internal://whatsapp-disabled', 'ACTIVE', 450, 12);
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- 6. Seed Reviews (Commented out as there are no reviews currently seeded)
-- INSERT INTO reviews (id, branch_id, branch_name, business_id, rating, service_tags, review_text, customer_name, customer_email, ai_generated, posted_to_google, copied_to_clipboard, tokens_used)
-- VALUES ...

-- 7. Seed Feedback (Commented out as there is no feedback currently seeded)
-- INSERT INTO feedback (id, branch_id, branch_name, business_id, rating, category, customer_name, customer_email, customer_phone, comments, status, owner_notes)
-- VALUES ...

-- 8. Seed API Key Config & Settings
INSERT INTO api_key_configs (id, gemini_api_key, openai_api_key, primary_model, prompt_template, temperature, is_custom_key_active)
VALUES
(1, '', '', 'google/gemini-2.5-flash-lite', 'Draft a warm, authentic 5-star Google review for {businessName} ({branchName}). Highlight: {serviceTags}. Note: {customNote}. Keep it concise under 3 sentences.', 0.70, true)
ON CONFLICT (id) DO UPDATE SET primary_model = EXCLUDED.primary_model;

INSERT INTO system_settings (id, agency_name, support_email, google_redirect_delay_ms, min_star_for_google, default_prompt)
VALUES
(1, 'Tap Review AI Agency Studio', 'support@tapreview.ai', 1500, 4, 'Default system prompt')
ON CONFLICT (id) DO UPDATE SET agency_name = EXCLUDED.agency_name;
