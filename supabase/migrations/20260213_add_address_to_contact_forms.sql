-- Fix contact_forms table schema to match frontend usage
-- Run this in your Supabase SQL Editor

-- Add missing address column
ALTER TABLE contact_forms 
ADD COLUMN address TEXT;

-- Add description column to match frontend formData
ALTER TABLE contact_forms 
ADD COLUMN description TEXT;

-- Add indexes for the new columns for better performance
CREATE INDEX IF NOT EXISTS idx_contact_forms_address ON contact_forms(address);
CREATE INDEX IF NOT EXISTS idx_contact_forms_description ON contact_forms(description);

-- Update existing contact forms with default values if needed
UPDATE contact_forms SET address = 'Not provided' WHERE address IS NULL;
UPDATE contact_forms SET description = message WHERE description IS NULL AND message IS NOT NULL;
