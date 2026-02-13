-- AI Features Migration
-- Adds tables for AI-powered client management

-- AI Analysis Cache
CREATE TABLE IF NOT EXISTS ai_analysis_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_email TEXT NOT NULL,
    analysis_type TEXT NOT NULL, -- 'client_analysis', 'predictive_analytics', 'recommendations'
    analysis_data JSONB NOT NULL,
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT ai_analysis_cache_client_email_key UNIQUE (client_email, analysis_type)
);

-- AI Insights History
CREATE TABLE IF NOT EXISTS ai_insights_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_email TEXT NOT NULL,
    insight_type TEXT NOT NULL, -- 'risk', 'loyalty', 'engagement', 'opportunity', 'recommendation'
    insight_text TEXT NOT NULL,
    confidence_score DECIMAL(3,2),
    applied BOOLEAN DEFAULT FALSE,
    applied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT ai_insights_history_client_email_key UNIQUE (client_email, insight_text, created_at)
);

-- AI Model Usage Tracking
CREATE TABLE IF NOT EXISTS ai_model_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL DEFAULT 'gemini-pro',
    endpoint TEXT NOT NULL,
    request_tokens INTEGER,
    response_tokens INTEGER,
    total_tokens INTEGER,
    cost DECIMAL(10,6),
    response_time_ms INTEGER,
    status TEXT NOT NULL, -- 'success', 'error', 'rate_limited'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client Preferences (Enhanced)
CREATE TABLE IF NOT EXISTS client_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_email TEXT NOT NULL UNIQUE,
    priority_level TEXT NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'medium', 'high', 'urgent'
    account_status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'suspended', 'pending'
    communication_preferences JSONB DEFAULT '{}',
    service_preferences JSONB DEFAULT '{}',
    billing_preferences JSONB DEFAULT '{}',
    notification_preferences JSONB DEFAULT '{}',
    custom_tags TEXT[] DEFAULT '{}',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Predictions
CREATE TABLE IF NOT EXISTS ai_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_email TEXT NOT NULL,
    prediction_type TEXT NOT NULL, -- 'next_booking_probability', 'lifetime_value', 'churn_risk', 'best_contact_time'
    prediction_value DECIMAL(10,2),
    prediction_text TEXT,
    confidence_score DECIMAL(3,2),
    factors JSONB, -- Factors that influenced the prediction
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT ai_predictions_client_email_type_unique UNIQUE (client_email, prediction_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_analysis_cache_client_email ON ai_analysis_cache(client_email);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_cache_expires_at ON ai_analysis_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_insights_history_client_email ON ai_insights_history(client_email);
CREATE INDEX IF NOT EXISTS idx_ai_insights_history_created_at ON ai_insights_history(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_model_usage_created_at ON ai_model_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_client_preferences_email ON client_preferences(client_email);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_client_email ON ai_predictions(client_email);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_valid_until ON ai_predictions(valid_until);

-- RLS Policies
ALTER TABLE ai_analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;

-- AI Analysis Cache Policies
CREATE POLICY "Admins can view all AI analysis" ON ai_analysis_cache
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = auth.email()
        )
    );

-- AI Insights History Policies
CREATE POLICY "Admins can view all AI insights" ON ai_insights_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = auth.email()
        )
    );

-- AI Model Usage Policies
CREATE POLICY "Admins can view AI usage" ON ai_model_usage
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = auth.email()
        )
    );

-- Client Preferences Policies
CREATE POLICY "Admins can manage client preferences" ON client_preferences
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = auth.email()
        )
    );

-- AI Predictions Policies
CREATE POLICY "Admins can view AI predictions" ON ai_predictions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.email = auth.email()
        )
    );

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_ai_analysis_cache_updated_at 
    BEFORE UPDATE ON ai_analysis_cache 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_preferences_updated_at 
    BEFORE UPDATE ON client_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default preferences for existing clients
INSERT INTO client_preferences (client_email)
SELECT DISTINCT email 
FROM clients 
WHERE email NOT IN (SELECT client_email FROM client_preferences);

-- AI Configuration
CREATE TABLE IF NOT EXISTS ai_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key TEXT NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default AI configuration
INSERT INTO ai_configuration (config_key, config_value, description) VALUES
('gemini_api_key', 'AIzaSyCfwsggzyCCEzXG-kvEhut1oThptWZbeuk', 'Google Gemini API Key'),
('gemini_model', 'gemini-pro', 'Default Gemini model'),
('ai_cache_duration_hours', '24', 'AI analysis cache duration in hours'),
('enable_ai_insights', 'true', 'Enable AI insights generation'),
('max_tokens_per_request', '1000', 'Maximum tokens per AI request'),
('temperature', '0.7', 'AI model temperature for creativity')
ON CONFLICT (config_key) DO NOTHING;

-- Create trigger for updated_at on ai_configuration
CREATE TRIGGER update_ai_configuration_updated_at 
    BEFORE UPDATE ON ai_configuration 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
