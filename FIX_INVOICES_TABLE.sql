-- ============================================
-- FIX INVOICES TABLE - Add Missing Columns
-- Run this in Supabase SQL Editor if you get column errors
-- ============================================

-- Add missing columns to invoices table if they don't exist
DO $$ 
BEGIN
    -- Add payment_link_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'payment_link_id'
    ) THEN
        ALTER TABLE invoices ADD COLUMN payment_link_id VARCHAR(100) UNIQUE;
    END IF;

    -- Add payment_link_expires_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'payment_link_expires_at'
    ) THEN
        ALTER TABLE invoices ADD COLUMN payment_link_expires_at TIMESTAMP;
    END IF;

    -- Add client_name if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'client_name'
    ) THEN
        ALTER TABLE invoices ADD COLUMN client_name VARCHAR(255) NOT NULL DEFAULT 'Unknown';
    END IF;

    -- Add client_email if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'client_email'
    ) THEN
        ALTER TABLE invoices ADD COLUMN client_email VARCHAR(255) NOT NULL DEFAULT 'unknown@example.com';
    END IF;

    -- Add client_address if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'client_address'
    ) THEN
        ALTER TABLE invoices ADD COLUMN client_address TEXT;
    END IF;

    -- Add client_phone if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'client_phone'
    ) THEN
        ALTER TABLE invoices ADD COLUMN client_phone VARCHAR(50);
    END IF;

    -- Add sent_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'sent_at'
    ) THEN
        ALTER TABLE invoices ADD COLUMN sent_at TIMESTAMP;
    END IF;

    -- Add paid_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'paid_at'
    ) THEN
        ALTER TABLE invoices ADD COLUMN paid_at TIMESTAMP;
    END IF;

    -- Add notes if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'notes'
    ) THEN
        ALTER TABLE invoices ADD COLUMN notes TEXT;
    END IF;

    -- Add terms if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'terms'
    ) THEN
        ALTER TABLE invoices ADD COLUMN terms TEXT;
    END IF;

    -- Add payment_method if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE invoices ADD COLUMN payment_method VARCHAR(50);
    END IF;

    -- Add payment_date if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'payment_date'
    ) THEN
        ALTER TABLE invoices ADD COLUMN payment_date TIMESTAMP;
    END IF;

    -- Add payment_reference if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'payment_reference'
    ) THEN
        ALTER TABLE invoices ADD COLUMN payment_reference VARCHAR(255);
    END IF;

    -- Add created_by if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'created_by'
    ) THEN
        ALTER TABLE invoices ADD COLUMN created_by VARCHAR(255);
    END IF;

    -- Add issue_date if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'issue_date'
    ) THEN
        ALTER TABLE invoices ADD COLUMN issue_date DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;

    -- Add due_date if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'due_date'
    ) THEN
        ALTER TABLE invoices ADD COLUMN due_date DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;

    -- Add status if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'status'
    ) THEN
        ALTER TABLE invoices ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'draft';
    END IF;

    -- Add subtotal if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'subtotal'
    ) THEN
        ALTER TABLE invoices ADD COLUMN subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0;
    END IF;

    -- Add tax_rate if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'tax_rate'
    ) THEN
        ALTER TABLE invoices ADD COLUMN tax_rate DECIMAL(5, 2) DEFAULT 0;
    END IF;

    -- Add tax_amount if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'tax_amount'
    ) THEN
        ALTER TABLE invoices ADD COLUMN tax_amount DECIMAL(10, 2) DEFAULT 0;
    END IF;

    -- Add discount_amount if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'discount_amount'
    ) THEN
        ALTER TABLE invoices ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0;
    END IF;

    -- Add total_amount if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE invoices ADD COLUMN total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0;
    END IF;

    -- Add amount_paid if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'amount_paid'
    ) THEN
        ALTER TABLE invoices ADD COLUMN amount_paid DECIMAL(10, 2) DEFAULT 0;
    END IF;

    -- Add balance_due if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'balance_due'
    ) THEN
        ALTER TABLE invoices ADD COLUMN balance_due DECIMAL(10, 2) NOT NULL DEFAULT 0;
    END IF;

    -- Add invoice_number if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'invoice_number'
    ) THEN
        ALTER TABLE invoices ADD COLUMN invoice_number VARCHAR(50) UNIQUE NOT NULL DEFAULT 'TEMP-' || gen_random_uuid()::text;
    END IF;

    -- Add client_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'client_id'
    ) THEN
        ALTER TABLE invoices ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
    END IF;

    -- Add booking_id if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'booking_id'
    ) THEN
        ALTER TABLE invoices ADD COLUMN booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL;
    END IF;

    -- Add created_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE invoices ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    END IF;

    -- Add updated_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE invoices ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- Create index for payment_link_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_invoices_payment_link_id ON invoices(payment_link_id);

-- Create function to generate invoice number if it doesn't exist
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  year_prefix TEXT;
BEGIN
  year_prefix := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 6) AS INTEGER)), 0) + 1
  INTO next_number
  FROM invoices
  WHERE invoice_number LIKE year_prefix || '-%';
  
  RETURN year_prefix || '-' || LPAD(next_number::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Enable RLS if not already enabled
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to ensure they're correct
DROP POLICY IF EXISTS "Allow all for authenticated users" ON invoices;
DROP POLICY IF EXISTS "Allow public read for payment links" ON invoices;

CREATE POLICY "Allow all for authenticated users" ON invoices FOR ALL USING (true);
CREATE POLICY "Allow public read for payment links" ON invoices 
  FOR SELECT 
  USING (payment_link_id IS NOT NULL AND payment_link_expires_at > NOW());

-- Success message
SELECT 'Invoices table fixed successfully! All missing columns added.' AS status;
