-- Complete Database Schema for StoneRiver Junk Removal
-- Run this in your Supabase SQL Editor

-- ==================== BOOKINGS TABLE ====================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('residential', 'commercial', 'demolition')),
  load_size TEXT NOT NULL CHECK (load_size IN ('quarter', 'half', 'threeQuarter', 'full')),
  preferred_date DATE NOT NULL,
  preferred_time TEXT NOT NULL,
  alternate_date DATE,
  alternate_time TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== GALLERY ITEMS TABLE ====================
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('residential', 'commercial', 'demolition')),
  description TEXT,
  location TEXT,
  date TEXT,
  before_image_url TEXT NOT NULL,
  after_image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== BLOG POSTS TABLE ====================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  author TEXT DEFAULT 'StoneRiver Team',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== REVIEWS TABLE ====================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  location TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  service TEXT NOT NULL,
  text TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== REFERRALS TABLE ====================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  referrer_name TEXT NOT NULL,
  referrer_email TEXT NOT NULL,
  referrer_phone TEXT NOT NULL,
  referee_name TEXT,
  referee_email TEXT,
  referee_phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  credit_amount DECIMAL(10,2) DEFAULT 25.00,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== CONTACT FORMS TABLE ====================
CREATE TABLE IF NOT EXISTS contact_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service_type TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
  category TEXT,
  sentiment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== SMS SUBSCRIBERS TABLE ====================
CREATE TABLE IF NOT EXISTS sms_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== SMS NOTIFICATIONS TABLE ====================
CREATE TABLE IF NOT EXISTS sms_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('confirmation', 'reminder', 'on_way', 'complete', 'custom')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== JOB PHOTOS TABLE (existing) ====================
CREATE TABLE IF NOT EXISTS job_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  before_url TEXT NOT NULL,
  after_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== INDEXES FOR PERFORMANCE ====================
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(preferred_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

CREATE INDEX IF NOT EXISTS idx_contact_forms_status ON contact_forms(status);
CREATE INDEX IF NOT EXISTS idx_contact_forms_created ON contact_forms(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sms_notifications_booking ON sms_notifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_sms_notifications_status ON sms_notifications(status);

-- ==================== ROW LEVEL SECURITY (RLS) ====================
-- Enable RLS on all tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public can read published blog posts" ON blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public can read approved reviews" ON reviews
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Public can read gallery items" ON gallery_items
  FOR SELECT USING (true);

-- Public can insert (for forms and bookings)
CREATE POLICY "Public can insert bookings" ON bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can insert contact forms" ON contact_forms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can insert reviews" ON reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can insert referrals" ON referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can subscribe to SMS" ON sms_subscribers
  FOR INSERT WITH CHECK (true);

-- Admin full access (you'll need to set up authentication)
-- For now, allow all operations for development
CREATE POLICY "Allow all operations on bookings" ON bookings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on gallery_items" ON gallery_items
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on blog_posts" ON blog_posts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on reviews" ON reviews
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on referrals" ON referrals
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on contact_forms" ON contact_forms
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on sms_subscribers" ON sms_subscribers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on sms_notifications" ON sms_notifications
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on job_photos" ON job_photos
  FOR ALL USING (true) WITH CHECK (true);

-- ==================== STORAGE BUCKETS ====================
-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for gallery bucket
CREATE POLICY "Public can view gallery images" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Authenticated can upload gallery images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Authenticated can update gallery images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'gallery');

CREATE POLICY "Authenticated can delete gallery images" ON storage.objects
  FOR DELETE USING (bucket_id = 'gallery');

-- ==================== FUNCTIONS ====================
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_items_updated_at BEFORE UPDATE ON gallery_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_forms_updated_at BEFORE UPDATE ON contact_forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_subscribers_updated_at BEFORE UPDATE ON sms_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== SAMPLE DATA (Optional) ====================
-- Insert sample gallery item
INSERT INTO gallery_items (title, category, description, location, date, before_image_url, after_image_url)
VALUES 
  ('Garage Cleanout', 'residential', 'Complete garage transformation in Eden Prairie', 'Eden Prairie, MN', 'January 2026', '/placeholder.svg', '/placeholder.svg'),
  ('Office Renovation', 'commercial', 'Full office cleanout for corporate relocation', 'St. Cloud, MN', 'December 2025', '/placeholder.svg', '/placeholder.svg')
ON CONFLICT DO NOTHING;

-- Insert sample reviews
INSERT INTO reviews (name, location, rating, service, text, verified, status)
VALUES 
  ('Sarah Johnson', 'St. Cloud, MN', 5, 'Residential Cleanout', 'Absolutely fantastic service! They removed 20 years of garage clutter in just 2 hours.', true, 'approved'),
  ('Mike Peterson', 'Sauk Rapids, MN', 5, 'Demolition', 'Had an old deck that needed to go. StoneRiver demolished it and hauled everything away same day.', true, 'approved')
ON CONFLICT DO NOTHING;
