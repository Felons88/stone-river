-- ==================== FIX RLS POLICIES FOR DEVELOPMENT ====================
-- Run this to allow anonymous access to all tables for development
-- In production, you should implement proper authentication

-- Disable RLS temporarily for development (REMOVE IN PRODUCTION)
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE referrals DISABLE ROW LEVEL SECURITY;
ALTER TABLE contact_forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE sms_subscribers DISABLE ROW LEVEL SECURITY;
ALTER TABLE sms_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaign_recipients DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_communications DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions DISABLE ROW LEVEL SECURITY;

-- ==================== COMPLETE! ====================
-- RLS disabled for all tables
-- Admin panel will now work without authentication errors
