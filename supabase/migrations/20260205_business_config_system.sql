-- Business Configuration System
-- Centralized configuration table for all API keys and business settings

CREATE TABLE IF NOT EXISTS business_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key VARCHAR(255) UNIQUE NOT NULL,
    config_value TEXT,
    config_type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json, encrypted
    category VARCHAR(100), -- api_keys, business_info, integrations, etc.
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    is_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_business_config_key ON business_config(config_key);
CREATE INDEX IF NOT EXISTS idx_business_config_category ON business_config(category);

-- Trigger for updated_at
CREATE TRIGGER update_business_config_updated_at
    BEFORE UPDATE ON business_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default configuration values
INSERT INTO business_config (config_key, config_value, config_type, category, description, is_required) VALUES
-- Business Information
('business_name', 'StoneRiver Junk Removal', 'string', 'business_info', 'Business name', true),
('business_phone', '(612) 685-4696', 'string', 'business_info', 'Primary phone number', true),
('business_email', 'noreply@stoneriverjunk.com', 'string', 'business_info', 'Primary email address', true),
('business_address', '', 'string', 'business_info', 'Business address', false),
('business_hours', '{"monday":"8:00 AM - 6:00 PM","tuesday":"8:00 AM - 6:00 PM","wednesday":"8:00 AM - 6:00 PM","thursday":"8:00 AM - 6:00 PM","friday":"8:00 AM - 6:00 PM","saturday":"9:00 AM - 4:00 PM","sunday":"Closed"}', 'json', 'business_info', 'Business operating hours', false),
('service_area_zipcodes', '[]', 'json', 'business_info', 'Service area zip codes', false),

-- API Keys (encrypted)
('stripe_secret_key', '', 'string', 'api_keys', 'Stripe secret key', true),
('stripe_publishable_key', '', 'string', 'api_keys', 'Stripe publishable key', true),
('paypal_client_id', '', 'string', 'api_keys', 'PayPal client ID', false),
('paypal_client_secret', '', 'string', 'api_keys', 'PayPal client secret', false),
('twilio_account_sid', '', 'string', 'api_keys', 'Twilio account SID', false),
('twilio_auth_token', '', 'string', 'api_keys', 'Twilio auth token', false),
('twilio_phone_number', '', 'string', 'api_keys', 'Twilio phone number', false),
('google_places_api_key', '', 'string', 'api_keys', 'Google Places API key', false),
('google_place_id', '', 'string', 'api_keys', 'Google Business Place ID', false),
('gemini_api_key', '', 'string', 'api_keys', 'Google Gemini API key', false),

-- SMTP Settings
('smtp_host', 'smtp-relay.brevo.com', 'string', 'email', 'SMTP host', true),
('smtp_port', '587', 'number', 'email', 'SMTP port', true),
('smtp_user', '', 'string', 'email', 'SMTP username', true),
('smtp_password', '', 'string', 'email', 'SMTP password', true),
('smtp_from_name', 'StoneRiver Junk Removal', 'string', 'email', 'Email sender name', true),
('smtp_from_email', 'noreply@stoneriverjunk.com', 'string', 'email', 'Email sender address', true),

-- Google Site Kit
('google_analytics_id', '', 'string', 'google_sitekit', 'Google Analytics Measurement ID', false),
('google_tag_manager_id', '', 'string', 'google_sitekit', 'Google Tag Manager Container ID', false),
('google_search_console_url', '', 'string', 'google_sitekit', 'Search Console Property URL', false),
('google_adsense_client_id', '', 'string', 'google_sitekit', 'Google AdSense Publisher ID', false),
('google_property_id', '', 'string', 'google_sitekit', 'Google Cloud Project Property ID', false),

-- Pricing
('pricing_quarter_load', '150', 'number', 'pricing', 'Quarter load price', true),
('pricing_half_load', '250', 'number', 'pricing', 'Half load price', true),
('pricing_three_quarter_load', '350', 'number', 'pricing', 'Three-quarter load price', true),
('pricing_full_load', '450', 'number', 'pricing', 'Full load price', true),
('stripe_processing_fee_percent', '3.5', 'number', 'pricing', 'Stripe processing fee percentage', true),

-- Features
('enable_online_booking', 'true', 'boolean', 'features', 'Enable online booking', true),
('enable_online_payments', 'true', 'boolean', 'features', 'Enable online payments', true),
('enable_sms_notifications', 'false', 'boolean', 'features', 'Enable SMS notifications', false),
('enable_email_marketing', 'false', 'boolean', 'features', 'Enable email marketing', false),
('enable_referral_program', 'false', 'boolean', 'features', 'Enable referral program', false),
('enable_google_reviews_sync', 'true', 'boolean', 'features', 'Enable Google reviews sync', false)

ON CONFLICT (config_key) DO NOTHING;

-- Function to get config value
CREATE OR REPLACE FUNCTION get_config(p_key VARCHAR)
RETURNS TEXT AS $$
DECLARE
    v_value TEXT;
BEGIN
    SELECT config_value INTO v_value
    FROM business_config
    WHERE config_key = p_key;
    
    RETURN v_value;
END;
$$ LANGUAGE plpgsql;

-- Function to set config value
CREATE OR REPLACE FUNCTION set_config(p_key VARCHAR, p_value TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO business_config (config_key, config_value)
    VALUES (p_key, p_value)
    ON CONFLICT (config_key) 
    DO UPDATE SET 
        config_value = EXCLUDED.config_value,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get all configs by category
CREATE OR REPLACE FUNCTION get_configs_by_category(p_category VARCHAR)
RETURNS TABLE (
    config_key VARCHAR,
    config_value TEXT,
    config_type VARCHAR,
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bc.config_key,
        bc.config_value,
        bc.config_type,
        bc.description
    FROM business_config bc
    WHERE bc.category = p_category
    ORDER BY bc.config_key;
END;
$$ LANGUAGE plpgsql;
