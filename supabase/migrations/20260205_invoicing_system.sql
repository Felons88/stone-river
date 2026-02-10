-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- Client info (cached for historical records)
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  client_address TEXT,
  
  -- Invoice details
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled
  
  -- Financial
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  balance_due DECIMAL(10, 2) NOT NULL,
  
  -- Payment info
  payment_method VARCHAR(50), -- cash, check, credit_card, bank_transfer, online
  payment_date TIMESTAMP,
  payment_reference VARCHAR(255),
  
  -- Payment link
  payment_link_id VARCHAR(100) UNIQUE,
  payment_link_expires_at TIMESTAMP,
  
  -- Notes
  notes TEXT,
  terms TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255),
  sent_at TIMESTAMP,
  paid_at TIMESTAMP
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Item details
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  
  -- Metadata
  item_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create invoice_payments table (for partial payments)
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Payment details
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_date TIMESTAMP NOT NULL DEFAULT NOW(),
  payment_reference VARCHAR(255),
  
  -- Notes
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255)
);

-- Create indexes
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_booking_id ON invoices(booking_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_payment_link_id ON invoices(payment_link_id);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);

-- Create function to update invoice totals
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices
  SET 
    subtotal = (
      SELECT COALESCE(SUM(total_price), 0)
      FROM invoice_items
      WHERE invoice_id = NEW.invoice_id
    ),
    updated_at = NOW()
  WHERE id = NEW.invoice_id;
  
  UPDATE invoices
  SET
    tax_amount = subtotal * (tax_rate / 100),
    total_amount = subtotal + (subtotal * (tax_rate / 100)) - discount_amount,
    balance_due = subtotal + (subtotal * (tax_rate / 100)) - discount_amount - amount_paid,
    updated_at = NOW()
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for invoice items
CREATE TRIGGER trigger_update_invoice_totals
AFTER INSERT OR UPDATE OR DELETE ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_invoice_totals();

-- Create function to update invoice balance when payment is added
CREATE OR REPLACE FUNCTION update_invoice_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices
  SET 
    amount_paid = (
      SELECT COALESCE(SUM(amount), 0)
      FROM invoice_payments
      WHERE invoice_id = NEW.invoice_id
    ),
    updated_at = NOW()
  WHERE id = NEW.invoice_id;
  
  UPDATE invoices
  SET
    balance_due = total_amount - amount_paid,
    status = CASE 
      WHEN balance_due <= 0 THEN 'paid'
      WHEN balance_due < total_amount THEN 'partial'
      ELSE status
    END,
    paid_at = CASE 
      WHEN balance_due <= 0 AND paid_at IS NULL THEN NOW()
      ELSE paid_at
    END,
    updated_at = NOW()
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for invoice payments
CREATE TRIGGER trigger_update_invoice_balance
AFTER INSERT OR UPDATE OR DELETE ON invoice_payments
FOR EACH ROW
EXECUTE FUNCTION update_invoice_balance();

-- Create function to generate invoice number
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

-- Add RLS policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (admin)
CREATE POLICY "Allow all for authenticated users" ON invoices FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON invoice_items FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON invoice_payments FOR ALL USING (true);

-- Allow public read access for payment links
CREATE POLICY "Allow public read for payment links" ON invoices 
  FOR SELECT 
  USING (payment_link_id IS NOT NULL AND payment_link_expires_at > NOW());
