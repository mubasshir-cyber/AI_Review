-- Create QR Scan Tracking Table
CREATE TABLE IF NOT EXISTS qr_scan_tracks (
    id VARCHAR(255) PRIMARY KEY,
    branch_id VARCHAR(255) NOT NULL,
    business_id VARCHAR(255) NOT NULL,
    device_type VARCHAR(50) DEFAULT 'Mobile',
    browser VARCHAR(100) DEFAULT 'Safari',
    city VARCHAR(100) DEFAULT 'Mumbai',
    country VARCHAR(100) DEFAULT 'India',
    referrer VARCHAR(255) DEFAULT 'QR Standee',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_qr_scan_branch ON qr_scan_tracks(branch_id);
CREATE INDEX IF NOT EXISTS idx_qr_scan_business ON qr_scan_tracks(business_id);
