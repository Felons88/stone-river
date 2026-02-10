-- Completely disable RLS for job_photos table
-- Run this in Supabase SQL Editor if the other fixes don't work

ALTER TABLE job_photos DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE tablename = 'job_photos';
