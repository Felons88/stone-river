-- Simple fix for job_photos RLS - allow all authenticated users
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert job photos" ON job_photos;
DROP POLICY IF EXISTS "Users can view job photos" ON job_photos;
DROP POLICY IF EXISTS "Users can update job photos" ON job_photos;
DROP POLICY IF EXISTS "Users can delete job photos" ON job_photos;
DROP POLICY IF EXISTS "Allow all operations on job_photos" ON job_photos;

-- Create single policy for all operations
CREATE POLICY "Allow authenticated users full access to job_photos" ON job_photos
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Also try disabling RLS completely if still not working
-- ALTER TABLE job_photos DISABLE ROW LEVEL SECURITY;
