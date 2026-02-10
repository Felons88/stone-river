-- Fix RLS policies for donation_scans table
-- Run this in Supabase SQL Editor

-- First, disable RLS temporarily
ALTER TABLE donation_scans DISABLE ROW LEVEL SECURITY;

-- Then re-enable RLS
ALTER TABLE donation_scans ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert their own scans
CREATE POLICY "Users can insert their own donation scans" ON donation_scans
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to view their own scans
CREATE POLICY "Users can view their own donation scans" ON donation_scans
FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update their own scans
CREATE POLICY "Users can update their own donation scans" ON donation_scans
FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete their own scans
CREATE POLICY "Users can delete their own donation scans" ON donation_scans
FOR DELETE USING (auth.role() = 'authenticated');

-- Alternative: Allow all authenticated users to manage donation_scans
-- Uncomment this if you want simpler permissions:
-- DROP POLICY IF EXISTS "Users can insert their own donation scans" ON donation_scans;
-- DROP POLICY IF EXISTS "Users can view their own donation scans" ON donation_scans;
-- DROP POLICY IF EXISTS "Users can update their own donation scans" ON donation_scans;
-- DROP POLICY IF EXISTS "Users can delete their own donation scans" ON donation_scans;
-- CREATE POLICY "Allow authenticated users full access to donation_scans" ON donation_scans
-- FOR ALL USING (auth.role() = 'authenticated');
