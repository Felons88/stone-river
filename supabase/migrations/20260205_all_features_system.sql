-- Complete Feature System Migration
-- Implements: Photos, Tracking, Pricing, Subscriptions, Referrals, Inventory, Portal, Quotes, Calendar, Donations

-- ==================== PHOTO UPLOAD SYSTEM ====================

-- Create storage bucket for photos (run in Supabase Storage UI or via API)
-- Bucket name: 'job-photos'

-- Create job_photos table
CREATE TABLE IF NOT EXISTS job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID,
  invoice_id UUID,
  photo_type TEXT CHECK (photo_type IN ('before', 'after', 'during', 'quote', 'other')),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by TEXT, -- 'customer' or 'admin'
  caption TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign keys if tables exist (skip if they don't to allow independent table creation)
DO $$ 
BEGIN
  -- Only add foreign key if bookings table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'bookings'
  ) THEN
    BEGIN
      ALTER TABLE job_photos ADD CONSTRAINT fk_job_photos_booking 
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add booking foreign key: %', SQLERRM;
    END;
  END IF;
  
  -- Only add foreign key if invoices table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'invoices'
  ) THEN
    BEGIN
      ALTER TABLE job_photos ADD CONSTRAINT fk_job_photos_invoice 
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add invoice foreign key: %', SQLERRM;
    END;
  END IF;
END $$;

CREATE INDEX idx_job_photos_booking ON job_photos(booking_id);
CREATE INDEX idx_job_photos_invoice ON job_photos(invoice_id);
CREATE INDEX idx_job_photos_featured ON job_photos(is_featured) WHERE is_featured = true;

-- ==================== PRICING CALCULATOR ====================

-- Create pricing_items table
CREATE TABLE IF NOT EXISTS pricing_items (
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

-- Insert common items
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

-- Create quote_requests table
CREATE TABLE IF NOT EXISTS quote_requests (
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

CREATE INDEX idx_quote_requests_status ON quote_requests(status);
CREATE INDEX idx_quote_requests_email ON quote_requests(email);

-- ==================== RECURRING SUBSCRIPTIONS ====================

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
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

-- Insert default plans
INSERT INTO subscription_plans (plan_name, description, frequency, price_per_period, included_pickups, max_volume_per_pickup) VALUES
('Monthly Basic', 'One pickup per month, up to 1/4 truck load', 'monthly', 99.00, 1, '1/4 truck'),
('Monthly Standard', 'One pickup per month, up to 1/2 truck load', 'monthly', 149.00, 1, '1/2 truck'),
('Bi-Weekly Premium', 'Two pickups per month, up to 1/2 truck load each', 'biweekly', 249.00, 2, '1/2 truck'),
('Quarterly Business', 'One pickup per quarter, up to full truck load', 'quarterly', 399.00, 1, 'full truck')
ON CONFLICT DO NOTHING;

-- Create customer_subscriptions table
CREATE TABLE IF NOT EXISTS customer_subscriptions (
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

-- Add foreign key
ALTER TABLE customer_subscriptions ADD CONSTRAINT fk_customer_subscriptions_plan 
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id);

CREATE INDEX idx_subscriptions_customer ON customer_subscriptions(customer_email);
CREATE INDEX idx_subscriptions_status ON customer_subscriptions(status);
CREATE INDEX idx_subscriptions_next_pickup ON customer_subscriptions(next_pickup_date);

-- ==================== REFERRAL PROGRAM ====================

-- Create referral_codes table
CREATE TABLE IF NOT EXISTS referral_codes (
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

CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_codes_customer ON referral_codes(customer_email);

-- Create referral_credits table
CREATE TABLE IF NOT EXISTS referral_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  credit_amount DECIMAL(10,2) NOT NULL,
  credit_source TEXT, -- 'referral_given', 'referral_received', 'loyalty', 'promo'
  referral_code TEXT,
  used_amount DECIMAL(10,2) DEFAULT 0,
  remaining_amount DECIMAL(10,2),
  invoice_id UUID,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 year'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key if invoices table exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'invoices'
  ) THEN
    BEGIN
      ALTER TABLE referral_credits ADD CONSTRAINT fk_referral_credits_invoice 
        FOREIGN KEY (invoice_id) REFERENCES invoices(id);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add invoice foreign key to referral_credits: %', SQLERRM;
    END;
  END IF;
END $$;

CREATE INDEX idx_referral_credits_customer ON referral_credits(customer_email);
CREATE INDEX idx_referral_credits_remaining ON referral_credits(remaining_amount) WHERE remaining_amount > 0;

-- ==================== MULTI-ITEM INVENTORY ====================

-- Create job_items table
CREATE TABLE IF NOT EXISTS job_items (
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

-- Add foreign keys if tables exist
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'bookings'
  ) THEN
    BEGIN
      ALTER TABLE job_items ADD CONSTRAINT fk_job_items_booking 
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add booking foreign key to job_items: %', SQLERRM;
    END;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'invoices'
  ) THEN
    BEGIN
      ALTER TABLE job_items ADD CONSTRAINT fk_job_items_invoice 
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add invoice foreign key to job_items: %', SQLERRM;
    END;
  END IF;
END $$;

CREATE INDEX idx_job_items_booking ON job_items(booking_id);
CREATE INDEX idx_job_items_disposal ON job_items(disposal_method);

-- ==================== CUSTOMER PORTAL ====================

-- Create customer_accounts table
CREATE TABLE IF NOT EXISTS customer_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- Will use bcrypt
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

CREATE INDEX idx_customer_accounts_email ON customer_accounts(email);

-- ==================== REAL-TIME JOB TRACKING ====================

-- Create job_tracking table
CREATE TABLE IF NOT EXISTS job_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID,
  driver_name TEXT,
  driver_phone TEXT,
  vehicle_info TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'en_route', 'arrived', 'in_progress', 'completed', 'cancelled')),
  current_location JSONB, -- {lat, lng, timestamp}
  estimated_arrival TIMESTAMPTZ,
  actual_arrival TIMESTAMPTZ,
  completion_time TIMESTAMPTZ,
  tracking_url TEXT,
  customer_notified BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key if bookings table exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'bookings'
  ) THEN
    BEGIN
      ALTER TABLE job_tracking ADD CONSTRAINT fk_job_tracking_booking 
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add booking foreign key to job_tracking: %', SQLERRM;
    END;
  END IF;
END $$;

CREATE INDEX idx_job_tracking_booking ON job_tracking(booking_id);
CREATE INDEX idx_job_tracking_status ON job_tracking(status);

-- ==================== DONATION/RECYCLING PARTNERS ====================

-- Create disposal_partners table
CREATE TABLE IF NOT EXISTS disposal_partners (
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

-- Insert common partners
INSERT INTO disposal_partners (partner_name, partner_type, address, phone, accepted_items, tax_deductible) VALUES
('Goodwill - St. Cloud', 'donation', '1230 2nd St S, St. Cloud, MN 56301', '(320) 251-7991', ARRAY['furniture', 'clothing', 'electronics', 'household'], true),
('Habitat for Humanity ReStore', 'donation', 'St. Cloud, MN', '(320) 240-8056', ARRAY['furniture', 'appliances', 'building materials'], true),
('Tri-County Solid Waste', 'recycling', 'St. Cloud, MN', '(320) 255-6300', ARRAY['metal', 'electronics', 'appliances'], false),
('Stearns County Landfill', 'landfill', 'St. Cloud, MN', '(320) 656-6100', ARRAY['general waste', 'construction debris'], false)
ON CONFLICT DO NOTHING;

-- Create disposal_logs table
CREATE TABLE IF NOT EXISTS disposal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID,
  partner_id UUID,
  item_category TEXT,
  quantity INTEGER,
  weight_lbs INTEGER,
  disposal_method TEXT,
  receipt_number TEXT,
  tax_receipt_issued BOOLEAN DEFAULT false,
  environmental_impact JSONB, -- {co2_saved, landfill_diverted, etc}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign keys
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'bookings'
  ) THEN
    BEGIN
      ALTER TABLE disposal_logs ADD CONSTRAINT fk_disposal_logs_booking 
        FOREIGN KEY (booking_id) REFERENCES bookings(id);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not add booking foreign key to disposal_logs: %', SQLERRM;
    END;
  END IF;
  
  BEGIN
    ALTER TABLE disposal_logs ADD CONSTRAINT fk_disposal_logs_partner 
      FOREIGN KEY (partner_id) REFERENCES disposal_partners(id);
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not add partner foreign key to disposal_logs: %', SQLERRM;
  END;
END $$;

CREATE INDEX idx_disposal_logs_booking ON disposal_logs(booking_id);
CREATE INDEX idx_disposal_logs_partner ON disposal_logs(partner_id);

-- ==================== SERVICE AREA CALENDAR ====================

-- Create availability_calendar table
CREATE TABLE IF NOT EXISTS availability_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  time_slot TEXT NOT NULL, -- '08:00-10:00', '10:00-12:00', etc.
  max_bookings INTEGER DEFAULT 3,
  current_bookings INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  blocked_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_availability_date_slot ON availability_calendar(date, time_slot);

-- ==================== TRIGGERS AND FUNCTIONS ====================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_pricing_items_updated_at BEFORE UPDATE ON pricing_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quote_requests_updated_at BEFORE UPDATE ON quote_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_subscriptions_updated_at BEFORE UPDATE ON customer_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_accounts_updated_at BEFORE UPDATE ON customer_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_tracking_updated_at BEFORE UPDATE ON job_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate remaining credit
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

-- Function to generate unique referral code
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
GRANT ALL ON job_photos TO authenticated;
GRANT ALL ON pricing_items TO authenticated;
GRANT ALL ON quote_requests TO authenticated;
GRANT ALL ON subscription_plans TO authenticated;
GRANT ALL ON customer_subscriptions TO authenticated;
GRANT ALL ON referral_codes TO authenticated;
GRANT ALL ON referral_credits TO authenticated;
GRANT ALL ON job_items TO authenticated;
GRANT ALL ON customer_accounts TO authenticated;
GRANT ALL ON job_tracking TO authenticated;
GRANT ALL ON disposal_partners TO authenticated;
GRANT ALL ON disposal_logs TO authenticated;
GRANT ALL ON availability_calendar TO authenticated;

COMMENT ON TABLE job_photos IS 'Before/after photos for jobs and marketing';
COMMENT ON TABLE pricing_items IS 'Item-based pricing database for calculator';
COMMENT ON TABLE quote_requests IS 'Customer quote requests with follow-up tracking';
COMMENT ON TABLE subscription_plans IS 'Recurring service subscription plans';
COMMENT ON TABLE customer_subscriptions IS 'Active customer subscriptions';
COMMENT ON TABLE referral_codes IS 'Customer referral codes for rewards';
COMMENT ON TABLE referral_credits IS 'Customer credit balance tracking';
COMMENT ON TABLE job_items IS 'Detailed item inventory per job';
COMMENT ON TABLE customer_accounts IS 'Customer portal login accounts';
COMMENT ON TABLE job_tracking IS 'Real-time GPS and status tracking';
COMMENT ON TABLE disposal_partners IS 'Donation and recycling partner locations';
COMMENT ON TABLE disposal_logs IS 'Environmental impact tracking';
COMMENT ON TABLE availability_calendar IS 'Service area availability scheduling';
