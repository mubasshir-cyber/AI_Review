-- Tap Review AI Platform - Super Admin Seed
-- File: /migrations/008_super_admin_seed.sql

INSERT INTO users (id, email, name, role, business_id, avatar_url, password, status)
VALUES
('user-super-admin', 'superadmin@tapreview.ai', 'System Super Admin', 'AGENCY_ADMIN', NULL, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', '$2b$10$9PToR2v3qXZWa9RpMe0qieEc.JqgUhbECNx9D9AU2jC8mYJgaGnn.', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET 
    password = EXCLUDED.password,
    status = EXCLUDED.status;
