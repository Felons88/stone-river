-- Fix status constraint to include 'pending' status from frontend
-- Run this in your Supabase SQL Editor

-- Drop the existing status check constraint
ALTER TABLE contact_forms DROP CONSTRAINT IF EXISTS contact_forms_status_check;

-- Add new constraint that includes 'pending' status
ALTER TABLE contact_forms 
ADD CONSTRAINT contact_forms_status_check 
CHECK (status IN ('new', 'pending', 'in_progress', 'resolved', 'archived'));
