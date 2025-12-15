-- ==========================================
-- 🚀 PHASE 2: ADVANCED CRM SCHEMA
-- ==========================================
-- รันหลังจาก schema.sql และ mockData.sql

-- ==========================================
-- 📊 1. BEHAVIORAL TRACKING
-- ==========================================

-- ตารางเก็บพฤติกรรมลูกค้า
CREATE TABLE IF NOT EXISTS customer_behaviors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    behavior_type VARCHAR(50) NOT NULL,  -- 'view', 'wishlist_add', 'wishlist_remove', 'cart_abandon'
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',  -- เก็บข้อมูลเพิ่มเติม เช่น session_id, referrer
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index สำหรับ query หา behavior ของลูกค้า
CREATE INDEX IF NOT EXISTS idx_customer_behaviors_customer ON customer_behaviors(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_behaviors_type ON customer_behaviors(behavior_type);
CREATE INDEX IF NOT EXISTS idx_customer_behaviors_variant ON customer_behaviors(variant_id);

-- ==========================================
-- 🎁 2. LOYALTY & GAMIFICATION
-- ==========================================

-- ตารางกำหนด Tier และสิทธิประโยชน์
CREATE TABLE IF NOT EXISTS loyalty_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,  -- 'Bronze', 'Silver', 'Gold', 'Platinum'
    min_spending DECIMAL(10,2) NOT NULL DEFAULT 0,  -- ยอดขั้นต่ำเพื่อได้ tier นี้
    points_multiplier DECIMAL(3,2) DEFAULT 1.00,  -- ตัวคูณแต้ม (Gold = 1.5x)
    benefits JSONB DEFAULT '[]',  -- สิทธิประโยชน์ต่างๆ
    color_code VARCHAR(20),  -- สีไว้แสดง UI
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ใส่ค่า Tier เริ่มต้น
INSERT INTO loyalty_tiers (name, min_spending, points_multiplier, benefits, color_code) VALUES
('Bronze', 0, 1.00, '["Free shipping on orders over ฿1,500"]', '#CD7F32'),
('Silver', 5000, 1.25, '["Free shipping on orders over ฿1,000", "5% birthday discount"]', '#C0C0C0'),
('Gold', 15000, 1.50, '["Free shipping all orders", "10% birthday discount", "Early access to sales"]', '#FFD700'),
('Platinum', 50000, 2.00, '["Free shipping all orders", "15% birthday discount", "Early access to sales", "Exclusive events", "Personal stylist"]', '#E5E4E2')
ON CONFLICT (name) DO NOTHING;

-- ตารางรายการแต้ม (Point Transactions)
CREATE TABLE IF NOT EXISTS point_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,  -- บวก = ได้แต้ม, ลบ = ใช้แต้ม
    transaction_type VARCHAR(50) NOT NULL,  -- 'earn_purchase', 'earn_review', 'earn_referral', 'earn_birthday', 'redeem_discount', 'redeem_item', 'expire', 'adjust'
    reference_id UUID,  -- order_id หรือ review_id ที่เชื่อมโยง
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_point_transactions_customer ON point_transactions(customer_id);

-- ตารางรหัสแนะนำเพื่อน (Referral Codes)
CREATE TABLE IF NOT EXISTS referral_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL UNIQUE,  -- รหัสส่วนตัว เช่น REF-SOMCHAI-2024
    uses_count INTEGER DEFAULT 0,
    max_uses INTEGER DEFAULT 10,
    reward_points INTEGER DEFAULT 100,  -- แต้มที่ได้ต่อการใช้
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);

-- ==========================================
-- 🎫 3. CUSTOMER SERVICE & TICKETING
-- ==========================================

-- Enum สำหรับสถานะ Claim
DO $$ BEGIN
    CREATE TYPE claim_status_type AS ENUM ('pending', 'reviewing', 'approved', 'rejected', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE claim_type AS ENUM ('claim', 'return', 'exchange');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ตารางแจ้งเคลม/คืนสินค้า
CREATE TABLE IF NOT EXISTS claims_returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    order_item_id UUID REFERENCES order_items(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    claim_type claim_type NOT NULL DEFAULT 'return',
    reason VARCHAR(100),  -- 'defective', 'wrong_item', 'not_as_described', 'change_mind', 'other'
    description TEXT,
    images JSONB DEFAULT '[]',  -- รูปภาพหลักฐาน
    
    status claim_status_type DEFAULT 'pending',
    admin_notes TEXT,
    refund_amount DECIMAL(10,2),
    refund_points INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID  -- admin user id
);

CREATE INDEX IF NOT EXISTS idx_claims_customer ON claims_returns(customer_id);
CREATE INDEX IF NOT EXISTS idx_claims_order ON claims_returns(order_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims_returns(status);

-- ==========================================
-- 📈 4. RFM SEGMENTATION
-- ==========================================

-- เพิ่ม columns ใน customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS rfm_segment VARCHAR(50);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS rfm_score VARCHAR(10);  -- เช่น "555", "321"
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_purchase_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS purchase_count INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS avg_order_value DECIMAL(10,2) DEFAULT 0;

-- Function คำนวณ RFM Score สำหรับลูกค้า 1 คน
CREATE OR REPLACE FUNCTION calculate_customer_rfm(p_customer_id UUID)
RETURNS TABLE(recency_score INT, frequency_score INT, monetary_score INT, segment VARCHAR) AS $$
DECLARE
    v_days_since_purchase INT;
    v_order_count INT;
    v_total_spent DECIMAL;
    v_r INT;
    v_f INT;
    v_m INT;
    v_segment VARCHAR(50);
BEGIN
    -- ดึงข้อมูลจาก orders
    SELECT 
        COALESCE(EXTRACT(DAY FROM NOW() - MAX(created_at)), 999)::INT,
        COUNT(*)::INT,
        COALESCE(SUM(total_amount), 0)
    INTO v_days_since_purchase, v_order_count, v_total_spent
    FROM orders 
    WHERE customer_id = p_customer_id AND payment_status = 'paid';
    
    -- คำนวณ R Score (1-5, 5 = ซื้อล่าสุด)
    v_r := CASE 
        WHEN v_days_since_purchase <= 30 THEN 5
        WHEN v_days_since_purchase <= 60 THEN 4
        WHEN v_days_since_purchase <= 90 THEN 3
        WHEN v_days_since_purchase <= 180 THEN 2
        ELSE 1
    END;
    
    -- คำนวณ F Score (1-5, 5 = ซื้อบ่อย)
    v_f := CASE 
        WHEN v_order_count >= 10 THEN 5
        WHEN v_order_count >= 5 THEN 4
        WHEN v_order_count >= 3 THEN 3
        WHEN v_order_count >= 2 THEN 2
        ELSE 1
    END;
    
    -- คำนวณ M Score (1-5, 5 = ใช้จ่ายเยอะ)
    v_m := CASE 
        WHEN v_total_spent >= 50000 THEN 5
        WHEN v_total_spent >= 20000 THEN 4
        WHEN v_total_spent >= 10000 THEN 3
        WHEN v_total_spent >= 5000 THEN 2
        ELSE 1
    END;
    
    -- กำหนด Segment
    v_segment := CASE
        WHEN v_r >= 4 AND v_f >= 4 AND v_m >= 4 THEN 'Champion'
        WHEN v_r >= 3 AND v_f >= 3 AND v_m >= 3 THEN 'Loyal'
        WHEN v_r >= 4 AND v_f <= 2 THEN 'New Customer'
        WHEN v_r >= 3 AND v_f >= 3 AND v_m <= 2 THEN 'Promising'
        WHEN v_r <= 2 AND v_f >= 3 THEN 'At Risk'
        WHEN v_r <= 2 AND v_f <= 2 AND v_m >= 3 THEN 'Cant Lose'
        WHEN v_r <= 2 AND v_f <= 2 THEN 'Hibernating'
        ELSE 'Others'
    END;
    
    RETURN QUERY SELECT v_r, v_f, v_m, v_segment;
END;
$$ LANGUAGE plpgsql;

-- Function อัพเดท RFM ทุกคน
CREATE OR REPLACE FUNCTION update_all_rfm()
RETURNS void AS $$
DECLARE
    v_customer RECORD;
    v_rfm RECORD;
BEGIN
    FOR v_customer IN SELECT id FROM customers LOOP
        SELECT * INTO v_rfm FROM calculate_customer_rfm(v_customer.id);
        
        UPDATE customers SET
            rfm_score = v_rfm.recency_score::TEXT || v_rfm.frequency_score::TEXT || v_rfm.monetary_score::TEXT,
            rfm_segment = v_rfm.segment,
            last_purchase_at = (SELECT MAX(created_at) FROM orders WHERE customer_id = v_customer.id AND payment_status = 'paid'),
            purchase_count = (SELECT COUNT(*) FROM orders WHERE customer_id = v_customer.id AND payment_status = 'paid'),
            avg_order_value = (SELECT COALESCE(AVG(total_amount), 0) FROM orders WHERE customer_id = v_customer.id AND payment_status = 'paid')
        WHERE id = v_customer.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 🔧 5. HELPER FUNCTIONS
-- ==========================================

-- Function ตัดสต็อก (ถ้ายังไม่มี)
CREATE OR REPLACE FUNCTION decrement_inventory(p_variant_id UUID, p_quantity INT)
RETURNS void AS $$
BEGIN
    UPDATE inventory 
    SET quantity = quantity - p_quantity,
        updated_at = NOW()
    WHERE variant_id = p_variant_id;
END;
$$ LANGUAGE plpgsql;

-- Function เพิ่มแต้มให้ลูกค้า
CREATE OR REPLACE FUNCTION add_customer_points(
    p_customer_id UUID, 
    p_points INT, 
    p_type VARCHAR, 
    p_reference_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    -- บันทึก transaction
    INSERT INTO point_transactions (customer_id, points, transaction_type, reference_id, description)
    VALUES (p_customer_id, p_points, p_type, p_reference_id, p_description);
    
    -- อัพเดทแต้มรวมใน customers
    UPDATE customers 
    SET points = points + p_points,
        updated_at = NOW()
    WHERE id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

-- Function อัพเดท Tier ตาม spending
CREATE OR REPLACE FUNCTION update_customer_tier(p_customer_id UUID)
RETURNS void AS $$
DECLARE
    v_total_spent DECIMAL;
    v_new_tier VARCHAR;
BEGIN
    SELECT total_spent INTO v_total_spent FROM customers WHERE id = p_customer_id;
    
    SELECT name INTO v_new_tier 
    FROM loyalty_tiers 
    WHERE min_spending <= v_total_spent 
    ORDER BY min_spending DESC 
    LIMIT 1;
    
    UPDATE customers SET tier = LOWER(v_new_tier) WHERE id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 🔒 6. RLS POLICIES
-- ==========================================

ALTER TABLE customer_behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims_returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Access" ON customer_behaviors FOR ALL USING (true);
CREATE POLICY "Public Access" ON loyalty_tiers FOR ALL USING (true);
CREATE POLICY "Public Access" ON point_transactions FOR ALL USING (true);
CREATE POLICY "Public Access" ON referral_codes FOR ALL USING (true);
CREATE POLICY "Public Access" ON claims_returns FOR ALL USING (true);

-- ==========================================
-- 🎯 7. AUTO-TRIGGER: เพิ่มแต้มเมื่อซื้อ
-- ==========================================

CREATE OR REPLACE FUNCTION on_order_paid()
RETURNS TRIGGER AS $$
DECLARE
    v_points INT;
    v_multiplier DECIMAL;
BEGIN
    -- เฉพาะเมื่อสถานะเปลี่ยนเป็น paid
    IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
        -- ดึง multiplier ของ tier
        SELECT COALESCE(lt.points_multiplier, 1) INTO v_multiplier
        FROM customers c
        LEFT JOIN loyalty_tiers lt ON LOWER(lt.name) = c.tier
        WHERE c.id = NEW.customer_id;
        
        -- คำนวณแต้ม (1 บาท = 1 แต้ม * multiplier)
        v_points := FLOOR(NEW.total_amount * COALESCE(v_multiplier, 1));
        
        -- เพิ่มแต้ม
        IF NEW.customer_id IS NOT NULL THEN
            PERFORM add_customer_points(
                NEW.customer_id, 
                v_points, 
                'earn_purchase', 
                NEW.id, 
                'Points from order ' || NEW.order_number
            );
            
            -- อัพเดท total_spent
            UPDATE customers 
            SET total_spent = total_spent + NEW.total_amount
            WHERE id = NEW.customer_id;
            
            -- อัพเดท tier
            PERFORM update_customer_tier(NEW.customer_id);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_order_paid ON orders;
CREATE TRIGGER trigger_order_paid
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION on_order_paid();

-- รัน RFM ครั้งแรก
SELECT update_all_rfm();
