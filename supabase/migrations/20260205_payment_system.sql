-- ============================================
-- PAYMENT GATEWAY SYSTEM MIGRATION
-- Includes payment transactions, event logging, and risk management
-- ============================================

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Transaction details
  transaction_id VARCHAR(255) UNIQUE NOT NULL,
  gateway VARCHAR(50) NOT NULL, -- stripe, paypal, cashapp, venmo
  gateway_transaction_id VARCHAR(255),
  
  -- Amount details
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  fee_amount DECIMAL(10, 2) DEFAULT 0,
  net_amount DECIMAL(10, 2),
  
  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed, refunded, disputed
  payment_method VARCHAR(50), -- card, bank_account, wallet, etc
  
  -- Customer info
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  customer_ip VARCHAR(45),
  
  -- Risk assessment
  risk_score INTEGER DEFAULT 0, -- 0-100
  risk_level VARCHAR(20) DEFAULT 'low', -- low, medium, high, blocked
  fraud_flags TEXT[], -- Array of fraud indicators
  
  -- Gateway response
  gateway_response JSONB,
  error_code VARCHAR(100),
  error_message TEXT,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  refunded_at TIMESTAMP
);

-- Create payment_events table for logging
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES payment_transactions(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Event details
  event_type VARCHAR(100) NOT NULL,
  event_status VARCHAR(50) NOT NULL,
  gateway VARCHAR(50),
  amount DECIMAL(10, 2),
  
  -- Context
  user_agent TEXT,
  ip_address VARCHAR(45),
  location JSONB,
  device_info JSONB,
  
  -- Event payload
  event_data JSONB,
  error_details JSONB,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create payment_risk_rules table
CREATE TABLE IF NOT EXISTS payment_risk_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(255) NOT NULL,
  rule_type VARCHAR(50) NOT NULL, -- velocity, amount, location, device, behavior
  
  -- Rule configuration
  conditions JSONB NOT NULL,
  risk_score INTEGER NOT NULL, -- Points to add if rule matches
  action VARCHAR(50) DEFAULT 'flag', -- flag, review, block
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payment_disputes table
CREATE TABLE IF NOT EXISTS payment_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES payment_transactions(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Dispute details
  dispute_id VARCHAR(255) UNIQUE NOT NULL,
  gateway VARCHAR(50) NOT NULL,
  reason VARCHAR(100),
  amount DECIMAL(10, 2) NOT NULL,
  
  -- Status
  status VARCHAR(50) DEFAULT 'open', -- open, under_review, won, lost, closed
  
  -- Evidence
  evidence JSONB,
  notes TEXT,
  
  -- Dates
  dispute_date TIMESTAMP NOT NULL,
  respond_by_date TIMESTAMP,
  resolved_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payment_refunds table
CREATE TABLE IF NOT EXISTS payment_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES payment_transactions(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Refund details
  refund_id VARCHAR(255) UNIQUE NOT NULL,
  gateway VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  reason VARCHAR(255),
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  
  -- Metadata
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

-- Function to calculate risk score
CREATE OR REPLACE FUNCTION calculate_payment_risk_score(
  p_transaction_id UUID,
  p_amount DECIMAL,
  p_customer_email VARCHAR,
  p_customer_ip VARCHAR
)
RETURNS INTEGER AS $$
DECLARE
  v_risk_score INTEGER := 0;
  v_recent_transactions INTEGER;
  v_failed_attempts INTEGER;
BEGIN
  -- Check transaction velocity (multiple transactions in short time)
  SELECT COUNT(*) INTO v_recent_transactions
  FROM payment_transactions
  WHERE customer_email = p_customer_email
    AND created_at > NOW() - INTERVAL '1 hour'
    AND id != p_transaction_id;
  
  IF v_recent_transactions > 3 THEN
    v_risk_score := v_risk_score + 30;
  ELSIF v_recent_transactions > 1 THEN
    v_risk_score := v_risk_score + 15;
  END IF;
  
  -- Check failed attempts
  SELECT COUNT(*) INTO v_failed_attempts
  FROM payment_transactions
  WHERE customer_ip = p_customer_ip
    AND status = 'failed'
    AND created_at > NOW() - INTERVAL '24 hours';
  
  IF v_failed_attempts > 5 THEN
    v_risk_score := v_risk_score + 40;
  ELSIF v_failed_attempts > 2 THEN
    v_risk_score := v_risk_score + 20;
  END IF;
  
  -- Check high amount
  IF p_amount > 5000 THEN
    v_risk_score := v_risk_score + 25;
  ELSIF p_amount > 2000 THEN
    v_risk_score := v_risk_score + 10;
  END IF;
  
  RETURN LEAST(v_risk_score, 100);
END;
$$ LANGUAGE plpgsql;

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
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update invoice
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
    
    -- Log event
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
AFTER UPDATE ON payment_transactions
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
('Failed Attempts', 'behavior', '{"failed_count": 5, "window": "24 hours"}', 40, 'block', 3),
('Suspicious Location', 'location', '{"high_risk_countries": ["XX"]}', 20, 'review', 4);

-- Success message
SELECT 'Payment gateway system created successfully!' AS status;
