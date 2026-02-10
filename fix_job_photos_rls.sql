-- Fix RLS policies for job_photos table
-- Run this in Supabase SQL Editor

-- First, disable RLS temporarily
ALTER TABLE job_photos DISABLE ROW LEVEL SECURITY;

-- Then re-enable RLS
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert job photos
CREATE POLICY "Users can insert job photos" ON job_photos
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to view job photos
CREATE POLICY "Users can view job photos" ON job_photos
FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update job photos
CREATE POLICY "Users can update job photos" ON job_photos
FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete job photos
CREATE POLICY "Users can delete job photos" ON job_photos
FOR DELETE USING (auth.role() = 'authenticated');

-- Alternative: Allow all authenticated users full access (simpler)
-- Uncomment this if you want simpler permissions:
-- DROP POLICY IF EXISTS "Users can insert job photos" ON job_photos;
-- DROP POLICY IF EXISTS "Users can view job photos" ON job_photos;
-- DROP POLICY IF EXISTS "Users can update job photos" ON job_photos;
-- DROP POLICY IF EXISTS "Users can delete job photos" ON job_photos;
-- CREATE POLICY "Allow authenticated users full access to job_photos" ON job_photos
-- FOR ALL USING (auth.role() = 'authenticated');
