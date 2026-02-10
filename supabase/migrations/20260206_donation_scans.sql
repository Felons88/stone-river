-- Add donation_scans table for AI scanning feature
CREATE TABLE IF NOT EXISTS donation_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  scanned_items JSONB,
  total_estimated_value DECIMAL(10,2) DEFAULT 0,
  scan_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add estimated_value and item_name to disposal_logs
ALTER TABLE disposal_logs 
ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS item_name TEXT,
ADD COLUMN IF NOT EXISTS item_condition TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_donation_scans_date ON donation_scans(scan_date DESC);
CREATE INDEX IF NOT EXISTS idx_disposal_logs_method ON disposal_logs(disposal_method);
