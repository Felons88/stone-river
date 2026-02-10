-- Add missing columns to bookings table
-- Run this in Supabase SQL Editor

-- Make address nullable since we use service_address now
ALTER TABLE bookings
ALTER COLUMN address DROP NOT NULL;

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'MN',
ADD COLUMN IF NOT EXISTS zip TEXT,
ADD COLUMN IF NOT EXISTS service_address TEXT;

-- Update existing records to use address as service_address if null
UPDATE bookings
SET service_address = address
WHERE service_address IS NULL;

-- Add in_progress status to existing check constraint
ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE bookings
ADD CONSTRAINT bookings_status_check
CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled'));

-- Update service_type and load_size constraints to match new values
ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS bookings_service_type_check;

ALTER TABLE bookings
ADD CONSTRAINT bookings_service_type_check
CHECK (service_type IN ('residential', 'commercial', 'demolition', 'Junk Removal', 'Furniture Removal', 'Appliance Removal', 'Yard Waste', 'Construction Debris'));

ALTER TABLE bookings
DROP CONSTRAINT IF EXISTS bookings_load_size_check;

ALTER TABLE bookings
ADD CONSTRAINT bookings_load_size_check
CHECK (load_size IN ('quarter', 'half', 'threeQuarter', 'full', '1/4 Truck', '1/2 Truck', '3/4 Truck', 'Full Truck'));
