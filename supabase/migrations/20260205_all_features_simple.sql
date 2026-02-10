-- Simplified Feature System Migration (No Foreign Keys)
-- Drops and recreates tables to avoid conflicts

-- Drop existing tables if they exist
DROP TABLE IF EXISTS disposal_logs CASCADE;
DROP TABLE IF EXISTS job_tracking CASCADE;
DROP TABLE IF EXISTS job_items CASCADE;
DROP TABLE IF EXISTS job_photos CASCADE;
DROP TABLE IF EXISTS availability_calendar CASCADE;
DROP TABLE IF EXISTS customer_accounts CASCADE;
DROP TABLE IF EXISTS referral_credits CASCADE;
DROP TABLE IF EXISTS referral_codes CASCADE;
DROP TABLE IF EXISTS customer_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS quote_requests CASCADE;
DROP TABLE IF EXISTS pricing_items CASCADE;
DROP TABLE IF EXISTS disposal_partners CASCADE;

-- ==================== PHOTO UPLOAD SYSTEM ====================

CREATE TABLE job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID,
  invoice_id UUID,
  photo_type TEXT CHECK (photo_type IN ('before', 'after', 'during', 'quote', 'other')),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by TEXT,
  caption TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_photos_booking ON job_photos(booking_id);
CREATE INDEX IF NOT EXISTS idx_job_photos_invoice ON job_photos(invoice_id);
CREATE INDEX IF NOT EXISTS idx_job_photos_featured ON job_photos(is_featured) WHERE is_featured = true;

-- ==================== PRICING CALCULATOR ====================

CREATE TABLE pricing_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('furniture', 'appliances', 'electronics', 'construction', 'yard_waste', 'general', 'hazardous')),
  base_price DECIMAL(10,2),
  volume_cubic_feet DECIMAL(10,2),
  weight_estimate_lbs INTEGER,
  requires_special_handling BOOLEAN DEFAULT false,
  disposal_fee DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO pricing_items (item_name, category, base_price, volume_cubic_feet, weight_estimate_lbs) VALUES
('Sofa/Couch', 'furniture', 75.00, 50, 150),
('Mattress (Twin)', 'furniture', 40.00, 20, 50),
('Mattress (Full/Queen)', 'furniture', 50.00, 30, 70),
('Mattress (King)', 'furniture', 60.00, 40, 90),
('Recliner', 'furniture', 50.00, 35, 100),
('Dining Table', 'furniture', 60.00, 40, 120),
('Dresser', 'furniture', 55.00, 35, 150),
('Desk', 'furniture', 45.00, 30, 80),
('Refrigerator', 'appliances', 80.00, 60, 250),
('Washing Machine', 'appliances', 70.00, 50, 200),
('Dryer', 'appliances', 70.00, 50, 150),
('Stove/Oven', 'appliances', 75.00, 45, 200),
('Dishwasher', 'appliances', 60.00, 35, 150),
('TV (up to 50")', 'electronics', 40.00, 15, 50),
('TV (50"+)', 'electronics', 60.00, 25, 80),
('Computer/Monitor', 'electronics', 25.00, 5, 30),
('Treadmill', 'electronics', 80.00, 60, 250),
('Hot Tub', 'appliances', 300.00, 200, 800),
('Carpet (per room)', 'construction', 50.00, 30, 100),
('Drywall (per sheet)', 'construction', 15.00, 10, 50),
('Wood Pile (cubic yard)', 'yard_waste', 40.00, 27, 500),
('Yard Debris (bag)', 'yard_waste', 10.00, 3, 30)
ON CONFLICT DO NOTHING;

CREATE TABLE quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service_address TEXT NOT NULL,
  selected_items JSONB DEFAULT '[]'::jsonb,
  estimated_volume TEXT,
  estimated_price DECIMAL(10,2),
  special_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'booked', 'declined', 'expired')),
  follow_up_count INTEGER DEFAULT 0,
  last_follow_up_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_requests_email ON quote_requests(email);

-- ==================== RECURRING SUBSCRIPTIONS ====================

CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly')),
  price_per_period DECIMAL(10,2) NOT NULL,
  included_pickups INTEGER DEFAULT 1,
  max_volume_per_pickup TEXT,
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO subscription_plans (plan_name, description, frequency, price_per_period, included_pickups, max_volume_per_pickup) VALUES
('Monthly Basic', 'One pickup per month, up to 1/4 truck load', 'monthly', 99.00, 1, '1/4 truck'),
('Monthly Standard', 'One pickup per month, up to 1/2 truck load', 'monthly', 149.00, 1, '1/2 truck'),
('Bi-Weekly Premium', 'Two pickups per month, up to 1/2 truck load each', 'biweekly', 249.00, 2, '1/2 truck'),
('Quarterly Business', 'One pickup per quarter, up to full truck load', 'quarterly', 399.00, 1, 'full truck')
ON CONFLICT DO NOTHING;

CREATE TABLE customer_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  plan_id UUID,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  next_pickup_date DATE,
  pickups_used INTEGER DEFAULT 0,
  pickups_remaining INTEGER,
  service_address TEXT NOT NULL,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON customer_subscriptions(customer_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON customer_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_pickup ON customer_subscriptions(next_pickup_date);

-- ==================== REFERRAL PROGRAM ====================

CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  credit_amount DECIMAL(10,2) DEFAULT 25.00,
  times_used INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 999,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_customer ON referral_codes(customer_email);

CREATE TABLE referral_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  credit_amount DECIMAL(10,2) NOT NULL,
  credit_source TEXT,
  referral_code TEXT,
  used_amount DECIMAL(10,2) DEFAULT 0,
  remaining_amount DECIMAL(10,2),
  invoice_id UUID,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 year'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_credits_customer ON referral_credits(customer_email);
CREATE INDEX IF NOT EXISTS idx_referral_credits_remaining ON referral_credits(remaining_amount) WHERE remaining_amount > 0;

-- ==================== MULTI-ITEM INVENTORY ====================

CREATE TABLE job_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID,
  invoice_id UUID,
  item_name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER DEFAULT 1,
  volume_cubic_feet DECIMAL(10,2),
  weight_lbs INTEGER,
  disposal_method TEXT CHECK (disposal_method IN ('landfill', 'recycle', 'donate', 'resell', 'hazardous')),
  disposal_location TEXT,
  item_condition TEXT CHECK (item_condition IN ('poor', 'fair', 'good', 'excellent')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_items_booking ON job_items(booking_id);
CREATE INDEX IF NOT EXISTS idx_job_items_disposal ON job_items(disposal_method);

-- ==================== CUSTOMER PORTAL ====================

CREATE TABLE customer_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  default_address TEXT,
  is_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  reset_token TEXT,
  reset_token_expires TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_accounts_email ON customer_accounts(email);

-- ==================== REAL-TIME JOB TRACKING ====================

CREATE TABLE job_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID,
  driver_name TEXT,
  driver_phone TEXT,
  vehicle_info TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled')),
  current_location JSONB,
  estimated_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  completion_time TIMESTAMPTZ,
  tracking_url TEXT,
  customer_notified BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_tracking_booking ON job_tracking(booking_id);
CREATE INDEX IF NOT EXISTS idx_job_tracking_status ON job_tracking(status);

-- ==================== DONATION/RECYCLING PARTNERS ====================

CREATE TABLE disposal_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name TEXT NOT NULL,
  partner_type TEXT CHECK (partner_type IN ('donation', 'recycling', 'landfill', 'hazardous', 'resale')),
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  accepted_items TEXT[],
  hours_of_operation JSONB,
  requires_appointment BOOLEAN DEFAULT false,
  tax_deductible BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO disposal_partners (partner_name, partner_type, address, phone, accepted_items, tax_deductible) VALUES
('Goodwill - St. Cloud', 'donation', '1230 2nd St S, St. Cloud, MN 56301', '(320) 251-7991', ARRAY['furniture', 'clothing', 'electronics', 'household'], true),
('Habitat for Humanity ReStore', 'donation', 'St. Cloud, MN', '(320) 240-8056', ARRAY['furniture', 'appliances', 'building materials'], true),
('Tri-County Solid Waste', 'recycling', 'St. Cloud, MN', '(320) 255-6300', ARRAY['metal', 'electronics', 'appliances'], false),
('Stearns County Landfill', 'landfill', 'St. Cloud, MN', '(320) 656-6100', ARRAY['general waste', 'construction debris'], false)
ON CONFLICT DO NOTHING;

CREATE TABLE disposal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID,
  partner_id UUID,
  item_category TEXT,
  quantity INTEGER,
  weight_lbs INTEGER,
  disposal_method TEXT,
  receipt_number TEXT,
  tax_receipt_issued BOOLEAN DEFAULT false,
  environmental_impact JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disposal_logs_booking ON disposal_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_disposal_logs_partner ON disposal_logs(partner_id);

-- ==================== SERVICE AREA CALENDAR ====================

CREATE TABLE availability_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  max_bookings INTEGER DEFAULT 3,
  current_bookings INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  blocked_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_availability_date_slot ON availability_calendar(date, time_slot);

-- ==================== HELPER FUNCTIONS ====================

CREATE OR REPLACE FUNCTION calculate_remaining_credit(p_customer_email TEXT)
RETURNS DECIMAL(10,2) AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(remaining_amount) 
     FROM referral_credits 
     WHERE customer_email = p_customer_email 
     AND remaining_amount > 0 
     AND (expires_at IS NULL OR expires_at > NOW())),
    0
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_referral_code(p_customer_name TEXT)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    v_code := UPPER(SUBSTRING(REPLACE(p_customer_name, ' ', ''), 1, 4)) || 
              LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = v_code) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ All feature tables created successfully!';
  RAISE NOTICE '📊 Tables: job_photos, pricing_items, quote_requests, subscription_plans, customer_subscriptions';
  RAISE NOTICE '📊 Tables: referral_codes, referral_credits, job_items, customer_accounts, job_tracking';
  RAISE NOTICE '📊 Tables: disposal_partners, disposal_logs, availability_calendar';
  RAISE NOTICE '🎉 Database is ready for all 10 features!';
END $$;
