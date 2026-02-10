-- Customer Portal Accounts Table
-- This table stores customer login credentials for the customer portal

-- Drop existing table if it exists to ensure clean state
DROP TABLE IF EXISTS customer_accounts CASCADE;

CREATE TABLE customer_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_customer_accounts_email ON customer_accounts(email);
CREATE INDEX IF NOT EXISTS idx_customer_accounts_active ON customer_accounts(is_active);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_customer_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customer_accounts_updated_at
  BEFORE UPDATE ON customer_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_accounts_updated_at();

-- Disable RLS for now (backend needs full access)
-- We'll re-enable with proper policies later
ALTER TABLE customer_accounts DISABLE ROW LEVEL SECURITY;
