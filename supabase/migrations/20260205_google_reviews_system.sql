-- Google Reviews Integration System
-- This migration creates tables for storing Google reviews and managing Google Business Profile integration

-- Google Business Profile Settings
CREATE TABLE IF NOT EXISTS google_business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id VARCHAR(255) UNIQUE NOT NULL,
    business_name VARCHAR(255),
    review_url TEXT,
    api_key TEXT,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_enabled BOOLEAN DEFAULT TRUE,
    sync_interval_hours INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Google Reviews Table (enhanced version of existing reviews table)
CREATE TABLE IF NOT EXISTS google_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_review_id VARCHAR(255) UNIQUE,
    author_name VARCHAR(255) NOT NULL,
    author_photo_url TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    review_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reply_text TEXT,
    reply_date TIMESTAMP WITH TIME ZONE,
    source VARCHAR(50) DEFAULT 'google',
    status VARCHAR(50) DEFAULT 'published',
    is_featured BOOLEAN DEFAULT FALSE,
    synced_from_google BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review sync log to track sync operations
CREATE TABLE IF NOT EXISTS review_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_completed_at TIMESTAMP WITH TIME ZONE,
    reviews_fetched INTEGER DEFAULT 0,
    reviews_added INTEGER DEFAULT 0,
    reviews_updated INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'running',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Google Site Kit Settings
CREATE TABLE IF NOT EXISTS google_sitekit_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id VARCHAR(255),
    analytics_id VARCHAR(255),
    search_console_url TEXT,
    tag_manager_id VARCHAR(255),
    adsense_client_id VARCHAR(255),
    credentials JSONB,
    is_connected BOOLEAN DEFAULT FALSE,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_google_reviews_rating ON google_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_google_reviews_date ON google_reviews(review_date DESC);
CREATE INDEX IF NOT EXISTS idx_google_reviews_status ON google_reviews(status);
CREATE INDEX IF NOT EXISTS idx_google_reviews_featured ON google_reviews(is_featured);
CREATE INDEX IF NOT EXISTS idx_review_sync_log_date ON review_sync_log(sync_started_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_google_business_settings_updated_at
    BEFORE UPDATE ON google_business_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_reviews_updated_at
    BEFORE UPDATE ON google_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_sitekit_settings_updated_at
    BEFORE UPDATE ON google_sitekit_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to get average rating
CREATE OR REPLACE FUNCTION get_average_rating()
RETURNS NUMERIC AS $$
BEGIN
    RETURN (
        SELECT COALESCE(AVG(rating), 0)
        FROM google_reviews
        WHERE status = 'published'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get review stats
CREATE OR REPLACE FUNCTION get_review_stats()
RETURNS TABLE (
    total_reviews BIGINT,
    average_rating NUMERIC,
    five_star BIGINT,
    four_star BIGINT,
    three_star BIGINT,
    two_star BIGINT,
    one_star BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_reviews,
        COALESCE(AVG(rating), 0) as average_rating,
        COUNT(*) FILTER (WHERE rating = 5)::BIGINT as five_star,
        COUNT(*) FILTER (WHERE rating = 4)::BIGINT as four_star,
        COUNT(*) FILTER (WHERE rating = 3)::BIGINT as three_star,
        COUNT(*) FILTER (WHERE rating = 2)::BIGINT as two_star,
        COUNT(*) FILTER (WHERE rating = 1)::BIGINT as one_star
    FROM google_reviews
    WHERE status = 'published';
END;
$$ LANGUAGE plpgsql;

-- Insert default settings (update with your actual Google Place ID)
INSERT INTO google_business_settings (place_id, business_name, review_url, sync_enabled)
VALUES (
    'YOUR_GOOGLE_PLACE_ID',
    'StoneRiver Junk Removal',
    'https://g.page/r/YOUR_GOOGLE_PLACE_ID/review',
    TRUE
)
ON CONFLICT (place_id) DO NOTHING;

-- Create notification when new review is synced
CREATE OR REPLACE FUNCTION notify_new_review()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.synced_from_google = TRUE THEN
        PERFORM create_notification(
            'review_received',
            'New Google Review',
            'New ' || NEW.rating || '-star review from ' || NEW.author_name,
            CASE 
                WHEN NEW.rating >= 4 THEN 'success'
                WHEN NEW.rating = 3 THEN 'warning'
                ELSE 'error'
            END,
            NEW.id,
            'review',
            jsonb_build_object(
                'rating', NEW.rating,
                'author', NEW.author_name,
                'review_text', NEW.review_text
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_new_review_notification
AFTER INSERT ON google_reviews
FOR EACH ROW
EXECUTE FUNCTION notify_new_review();
