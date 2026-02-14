-- Add only the missing description column to contact_forms table
-- Run this in your Supabase SQL Editor

-- Add description column to match frontend formData
ALTER TABLE contact_forms 
ADD COLUMN description TEXT;

-- Add index for the new column for better performance
CREATE INDEX IF NOT EXISTS idx_contact_forms_description ON contact_forms(description);

-- Update existing contact forms with default values if needed
UPDATE contact_forms SET description = message WHERE description IS NULL AND message IS NOT NULL;
