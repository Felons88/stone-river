-- Customer notification preferences table
CREATE TABLE IF NOT EXISTS customer_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT UNIQUE NOT NULL,
  
  -- Email preferences
  email_booking_confirmation BOOLEAN DEFAULT true,
  email_invoices BOOLEAN DEFAULT true,
  email_promotions BOOLEAN DEFAULT true,
  
  -- SMS preferences
  sms_reminders BOOLEAN DEFAULT true,
  sms_updates BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_customer_preferences_email ON customer_preferences(customer_email);

-- Disable RLS for now
ALTER TABLE customer_preferences DISABLE ROW LEVEL SECURITY;
