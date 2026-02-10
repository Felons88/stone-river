-- Create notifications table for alerts
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- 'payment_received', 'fraud_alert', 'booking_created', 'invoice_sent', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    related_id UUID, -- ID of related entity (invoice, booking, payment, etc.)
    related_type VARCHAR(50), -- 'invoice', 'booking', 'payment', etc.
    metadata JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_type VARCHAR,
    p_title VARCHAR,
    p_message TEXT,
    p_severity VARCHAR DEFAULT 'info',
    p_related_id UUID DEFAULT NULL,
    p_related_type VARCHAR DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
BEGIN
    INSERT INTO notifications (type, title, message, severity, related_id, related_type, metadata)
    VALUES (p_type, p_title, p_message, p_severity, p_related_id, p_related_type, p_metadata)
    RETURNING id INTO v_notification_id;
    
    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create notification when payment is completed
CREATE OR REPLACE FUNCTION notify_payment_completed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        PERFORM create_notification(
            'payment_received',
            'Payment Received',
            'Payment of $' || NEW.amount || ' received via ' || NEW.gateway,
            'success',
            NEW.invoice_id,
            'payment',
            jsonb_build_object(
                'transaction_id', NEW.transaction_id,
                'amount', NEW.amount,
                'gateway', NEW.gateway
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payment_notification
AFTER INSERT OR UPDATE ON payment_transactions
FOR EACH ROW
EXECUTE FUNCTION notify_payment_completed();

-- Trigger to detect potential fraud (multiple failed payments)
CREATE OR REPLACE FUNCTION detect_fraud_attempts()
RETURNS TRIGGER AS $$
DECLARE
    v_failed_count INTEGER;
    v_customer_email VARCHAR;
BEGIN
    IF NEW.status = 'failed' THEN
        -- Count failed attempts in last hour from same email
        SELECT COUNT(*), customer_email INTO v_failed_count, v_customer_email
        FROM payment_transactions
        WHERE customer_email = NEW.customer_email
        AND status = 'failed'
        AND created_at > NOW() - INTERVAL '1 hour'
        GROUP BY customer_email;
        
        -- Alert if 3 or more failures
        IF v_failed_count >= 3 THEN
            PERFORM create_notification(
                'fraud_alert',
                'Potential Fraud Alert',
                'Multiple failed payment attempts detected from ' || v_customer_email,
                'error',
                NEW.id,
                'payment',
                jsonb_build_object(
                    'email', v_customer_email,
                    'failed_count', v_failed_count,
                    'last_attempt', NEW.created_at
                )
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_fraud_detection
AFTER INSERT OR UPDATE ON payment_transactions
FOR EACH ROW
EXECUTE FUNCTION detect_fraud_attempts();

-- Trigger for new bookings
CREATE OR REPLACE FUNCTION notify_new_booking()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM create_notification(
        'booking_created',
        'New Booking Received',
        'New booking from ' || NEW.name || ' for ' || NEW.preferred_date,
        'info',
        NEW.id,
        'booking',
        jsonb_build_object(
            'customer_name', NEW.name,
            'service_type', NEW.service_type,
            'date', NEW.preferred_date,
            'time', NEW.preferred_time
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_booking_notification
AFTER INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION notify_new_booking();
