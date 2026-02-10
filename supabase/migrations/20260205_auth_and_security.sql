-- Authentication and Security System Migration
-- Creates admin users table and security features

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- In production, use bcrypt hashed passwords
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'manager')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Insert default admin user (CHANGE PASSWORD IN PRODUCTION!)
INSERT INTO admin_users (email, password, name, role)
VALUES ('admin@stoneriverjunk.com', 'admin123', 'Admin User', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- Add reminder_sent column to bookings if not exists
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false;

-- Create email_templates table for template management
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT UNIQUE NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('booking_confirmation', 'invoice', 'payment_receipt', 'reminder', 'custom')),
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- Array of variable names used in template
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default email templates
INSERT INTO email_templates (template_name, template_type, subject, html_content, variables)
VALUES 
(
  'booking_confirmation',
  'booking_confirmation',
  'Booking Confirmation - {{service_type}}',
  '<!-- Will be loaded from file -->',
  '["customer_name", "booking_id", "service_type", "preferred_date", "preferred_time", "service_address", "estimated_load", "special_instructions", "business_name", "business_phone", "business_email"]'::jsonb
),
(
  'invoice_email',
  'invoice',
  'Invoice {{invoice_number}} - {{business_name}}',
  '<!-- Will be loaded from file -->',
  '["customer_name", "invoice_number", "invoice_date", "service_type", "total_amount", "invoice_id", "business_name", "business_phone", "business_email", "business_address", "notes"]'::jsonb
),
(
  'payment_receipt',
  'payment_receipt',
  'Payment Receipt - {{invoice_number}}',
  '<!-- Will be loaded from file -->',
  '["customer_name", "invoice_number", "payment_date", "amount_paid", "payment_method", "transaction_id", "business_name", "business_phone", "business_email"]'::jsonb
)
ON CONFLICT (template_name) DO NOTHING;

-- Create API rate limiting log table
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for rate limiting lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint ON api_rate_limits(ip_address, endpoint, window_start);

-- Create security_events table for logging
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('login_success', 'login_failed', 'token_expired', 'csrf_violation', 'rate_limit_exceeded', 'suspicious_activity')),
  ip_address TEXT,
  user_agent TEXT,
  user_id UUID REFERENCES admin_users(id),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for security event queries
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip_address, created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON admin_users TO authenticated;
GRANT ALL ON email_templates TO authenticated;
GRANT ALL ON api_rate_limits TO authenticated;
GRANT ALL ON security_events TO authenticated;

-- Add RLS policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- Admin users can read their own data
CREATE POLICY admin_users_read_own ON admin_users
  FOR SELECT
  USING (auth.uid() = id);

-- Email templates are readable by all authenticated users
CREATE POLICY email_templates_read ON email_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- Only super_admins can modify email templates
CREATE POLICY email_templates_modify ON email_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Security events are readable by admins
CREATE POLICY security_events_read ON security_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

COMMENT ON TABLE admin_users IS 'Admin user accounts with JWT authentication';
COMMENT ON TABLE email_templates IS 'Customizable email templates for automated emails';
COMMENT ON TABLE api_rate_limits IS 'Rate limiting tracking for API endpoints';
COMMENT ON TABLE security_events IS 'Security event logging for audit trail';
