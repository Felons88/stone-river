-- Debug query to check contact_forms table data
-- Run this in your Supabase SQL Editor to see what's in the table

SELECT 
  id,
  name,
  email,
  phone,
  address,
  service_type,
  description,
  message,
  status,
  created_at
FROM contact_forms 
ORDER BY created_at DESC 
LIMIT 10;

-- Also check the table structure
\d contact_forms;
