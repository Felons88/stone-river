-- ============================================
-- CLEAN PAYMENT SYSTEM MIGRATION
-- Drops existing tables and recreates them properly
-- ============================================

-- Drop existing tables in correct order
DROP TABLE IF EXISTS payment_refunds CASCADE;
DROP TABLE IF EXISTS payment_disputes CASCADE;
DROP TABLE IF EXISTS payment_risk_rules CASCADE;
DROP TABLE IF EXISTS payment_events CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS log_payment_event CASCADE;
DROP FUNCTION IF EXISTS calculate_payment_risk_score CASCADE;
DROP FUNCTION IF EXISTS update_invoice_on_payment CASCADE;

-- Create payment_transactions table
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  gateway VARCHAR(50) NOT NULL,
  gateway_transaction_id VARCHAR(255),
  
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  fee_amount DECIMAL(10, 2) DEFAULT 0,
  net_amount DECIMAL(10, 2),
  
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50),
  
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  customer_ip VARCHAR(45),
  
  risk_score INTEGER DEFAULT 0,
  risk_level VARCHAR(20) DEFAULT 'low',
  fraud_flags TEXT[],
  
  gateway_response JSONB,
  error_code VARCHAR(100),
  error_message TEXT,
  
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  refunded_at TIMESTAMP
);

-- Create payment_events table
CREATE TABLE payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES payment_transactions(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  
  event_type VARCHAR(100) NOT NULL,
  event_status VARCHAR(50) NOT NULL,
  gateway VARCHAR(50),
  amount DECIMAL(10, 2),
  
  user_agent TEXT,
  ip_address VARCHAR(45),
  location JSONB,
  device_info JSONB,
  
  event_data JSONB,
  error_details JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create payment_risk_rules table
CREATE TABLE payment_risk_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(255) NOT NULL,
  rule_type VARCHAR(50) NOT NULL,
  
  conditions JSONB NOT NULL,
  risk_score INTEGER NOT NULL,
  action VARCHAR(50) DEFAULT 'flag',
  
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payment_disputes table
CREATE TABLE payment_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES payment_transactions(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  
  dispute_id VARCHAR(255) UNIQUE NOT NULL,
  gateway VARCHAR(50) NOT NULL,
  reason VARCHAR(100),
  amount DECIMAL(10, 2) NOT NULL,
  
  status VARCHAR(50) DEFAULT 'open',
  
  evidence JSONB,
  notes TEXT,
  
  dispute_date TIMESTAMP NOT NULL,
  respond_by_date TIMESTAMP,
  resolved_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payment_refunds table
CREATE TABLE payment_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES payment_transactions(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  
  refund_id VARCHAR(255) UNIQUE NOT NULL,
  gateway VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  reason VARCHAR(255),
  
  status VARCHAR(50) DEFAULT 'pending',
  
  initiated_by VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_payment_transactions_invoice_id ON payment_transactions(invoice_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_gateway ON payment_transactions(gateway);
CREATE INDEX idx_payment_transactions_risk_level ON payment_transactions(risk_level);
CREATE INDEX idx_payment_transactions_created_at ON payment_transactions(created_at);
CREATE INDEX idx_payment_events_transaction_id ON payment_events(transaction_id);
CREATE INDEX idx_payment_events_invoice_id ON payment_events(invoice_id);
CREATE INDEX idx_payment_events_event_type ON payment_events(event_type);
CREATE INDEX idx_payment_events_created_at ON payment_events(created_at);
CREATE INDEX idx_payment_disputes_transaction_id ON payment_disputes(transaction_id);
CREATE INDEX idx_payment_disputes_status ON payment_disputes(status);
CREATE INDEX idx_payment_refunds_transaction_id ON payment_refunds(transaction_id);

-- Function to log payment event
CREATE OR REPLACE FUNCTION log_payment_event(
  p_transaction_id UUID,
  p_invoice_id UUID,
  p_event_type VARCHAR,
  p_event_status VARCHAR,
  p_gateway VARCHAR,
  p_amount DECIMAL,
  p_event_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO payment_events (
    transaction_id,
    invoice_id,
    event_type,
    event_status,
    gateway,
    amount,
    event_data
  ) VALUES (
    p_transaction_id,
    p_invoice_id,
    p_event_type,
    p_event_status,
    p_gateway,
    p_amount,
    p_event_data
  ) RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update invoice on payment completion
CREATE OR REPLACE FUNCTION update_invoice_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE invoices
    SET
      amount_paid = amount_paid + NEW.amount,
      balance_due = total_amount - (amount_paid + NEW.amount),
      status = CASE
        WHEN (total_amount - (amount_paid + NEW.amount)) <= 0 THEN 'paid'
        ELSE 'partial'
      END,
      payment_method = NEW.gateway,
      payment_date = NEW.completed_at,
      paid_at = CASE
        WHEN (total_amount - (amount_paid + NEW.amount)) <= 0 THEN NEW.completed_at
        ELSE paid_at
      END,
      updated_at = NOW()
    WHERE id = NEW.invoice_id;
    
    PERFORM log_payment_event(
      NEW.id,
      NEW.invoice_id,
      'payment.completed',
      'success',
      NEW.gateway,
      NEW.amount,
      jsonb_build_object('transaction_id', NEW.transaction_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoice_on_payment
AFTER INSERT OR UPDATE ON payment_transactions
FOR EACH ROW
EXECUTE FUNCTION update_invoice_on_payment();

-- Enable RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_risk_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_refunds ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow all for authenticated users" ON payment_transactions FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON payment_events FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON payment_risk_rules FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON payment_disputes FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON payment_refunds FOR ALL USING (true);

-- Insert default risk rules
INSERT INTO payment_risk_rules (rule_name, rule_type, conditions, risk_score, action, priority) VALUES
('High Amount Transaction', 'amount', '{"threshold": 5000}', 25, 'review', 1),
('Multiple Transactions', 'velocity', '{"count": 3, "window": "1 hour"}', 30, 'flag', 2),
('Failed Attempts', 'behavior', '{"failed_count": 5, "window": "24 hours"}', 40, 'block', 3);

-- Success message
SELECT 'Payment system created successfully!' AS status;
