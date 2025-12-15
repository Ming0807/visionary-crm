-- ==========================================
-- 🧠 PHASE 4: ADVANCED CRM & LOYALTY
-- ==========================================
-- รันหลังจาก schema.sql

-- ==========================================
-- 📊 1. POINT TRANSACTIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS point_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason VARCHAR(100),
    reference_id UUID,
    created_by VARCHAR(100) DEFAULT 'system',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_point_tx_customer ON point_transactions(customer_id);

ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON point_transactions;
CREATE POLICY "Public Access" ON point_transactions FOR ALL USING (true);

-- ==========================================
-- 🔄 2. FUNCTION: Update Customer on Order Paid
-- ==========================================

CREATE OR REPLACE FUNCTION update_customer_on_order_paid()
RETURNS TRIGGER AS $$
DECLARE
    v_points_earned INTEGER;
    v_order_id UUID;
BEGIN
    -- Only trigger when payment_status changes TO 'paid'
    IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
        
        v_order_id := NEW.id;
        v_points_earned := FLOOR(NEW.total_amount / 100);
        
        -- Update customer: total_spent and points
        UPDATE customers SET
            total_spent = COALESCE(total_spent, 0) + NEW.total_amount,
            points = COALESCE(points, 0) + v_points_earned,
            updated_at = NOW()
        WHERE id = NEW.customer_id;
        
        -- Log point transaction
        INSERT INTO point_transactions (customer_id, amount, reason, reference_id, created_by)
        VALUES (NEW.customer_id, v_points_earned, 'order_paid', v_order_id, 'system');
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 🏆 3. FUNCTION: Auto Upgrade Tier
-- ==========================================

CREATE OR REPLACE FUNCTION update_customer_tier()
RETURNS TRIGGER AS $$
DECLARE
    v_new_tier VARCHAR(50);
BEGIN
    IF NEW.total_spent >= 50001 THEN
        v_new_tier := 'platinum';
    ELSIF NEW.total_spent >= 10001 THEN
        v_new_tier := 'vip';
    ELSE
        v_new_tier := 'member';
    END IF;
    
    IF NEW.tier IS DISTINCT FROM v_new_tier THEN
        NEW.tier := v_new_tier;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- ⚡ 4. CREATE TRIGGERS
-- ==========================================

DROP TRIGGER IF EXISTS on_order_payment_status_change ON orders;
DROP TRIGGER IF EXISTS on_customer_total_spent_change ON customers;

CREATE TRIGGER on_order_payment_status_change
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_on_order_paid();

CREATE TRIGGER on_customer_total_spent_change
    BEFORE UPDATE ON customers
    FOR EACH ROW
    WHEN (NEW.total_spent IS DISTINCT FROM OLD.total_spent)
    EXECUTE FUNCTION update_customer_tier();

-- ==========================================
-- 🔧 5. HELPER: Manual Point Adjustment
-- ==========================================

CREATE OR REPLACE FUNCTION adjust_customer_points(
    p_customer_id UUID,
    p_amount INTEGER,
    p_reason VARCHAR DEFAULT 'manual_adjustment',
    p_admin VARCHAR DEFAULT 'admin'
)
RETURNS INTEGER AS $$
DECLARE
    v_new_points INTEGER;
BEGIN
    UPDATE customers SET
        points = GREATEST(0, COALESCE(points, 0) + p_amount),
        updated_at = NOW()
    WHERE id = p_customer_id
    RETURNING points INTO v_new_points;
    
    INSERT INTO point_transactions (customer_id, amount, reason, created_by)
    VALUES (p_customer_id, p_amount, p_reason, p_admin);
    
    RETURN v_new_points;
END;
$$ LANGUAGE plpgsql;
