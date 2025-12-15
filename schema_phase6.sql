-- ==========================================
-- 🎟️ PHASE 6: PROMOTIONS & COUPONS
-- ==========================================
-- รันหลังจาก schema_phase5.sql

-- ==========================================
-- 🎫 1. COUPONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_purchase DECIMAL(10,2) DEFAULT 0,
    max_discount DECIMAL(10,2), -- NULL = no limit
    usage_limit INTEGER, -- NULL = unlimited
    usage_count INTEGER DEFAULT 0,
    per_customer_limit INTEGER DEFAULT 1, -- How many times each customer can use
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active, expires_at);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON coupons;
CREATE POLICY "Public Access" ON coupons FOR ALL USING (true);

-- ==========================================
-- 📊 2. COUPON USAGES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS coupon_usages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon ON coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_customer ON coupon_usages(customer_id);

ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON coupon_usages;
CREATE POLICY "Public Access" ON coupon_usages FOR ALL USING (true);

-- ==========================================
-- 🔧 3. ADD COUPON FIELDS TO ORDERS
-- ==========================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);

-- ==========================================
-- 🔄 4. FUNCTION: Validate Coupon
-- ==========================================

CREATE OR REPLACE FUNCTION validate_coupon(
    p_code VARCHAR,
    p_customer_id UUID DEFAULT NULL,
    p_cart_total DECIMAL DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
    v_coupon RECORD;
    v_customer_usage INTEGER;
    v_discount DECIMAL;
BEGIN
    -- Find coupon
    SELECT * INTO v_coupon FROM coupons 
    WHERE UPPER(code) = UPPER(p_code) AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object('valid', false, 'error', 'Coupon not found');
    END IF;
    
    -- Check dates
    IF v_coupon.starts_at IS NOT NULL AND v_coupon.starts_at > NOW() THEN
        RETURN json_build_object('valid', false, 'error', 'Coupon not yet active');
    END IF;
    
    IF v_coupon.expires_at IS NOT NULL AND v_coupon.expires_at < NOW() THEN
        RETURN json_build_object('valid', false, 'error', 'Coupon expired');
    END IF;
    
    -- Check usage limit
    IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
        RETURN json_build_object('valid', false, 'error', 'Coupon usage limit reached');
    END IF;
    
    -- Check minimum purchase
    IF p_cart_total < v_coupon.min_purchase THEN
        RETURN json_build_object(
            'valid', false, 
            'error', 'Minimum purchase of ' || v_coupon.min_purchase || ' required'
        );
    END IF;
    
    -- Check per-customer limit
    IF p_customer_id IS NOT NULL AND v_coupon.per_customer_limit IS NOT NULL THEN
        SELECT COUNT(*) INTO v_customer_usage 
        FROM coupon_usages 
        WHERE coupon_id = v_coupon.id AND customer_id = p_customer_id;
        
        IF v_customer_usage >= v_coupon.per_customer_limit THEN
            RETURN json_build_object('valid', false, 'error', 'You have already used this coupon');
        END IF;
    END IF;
    
    -- Calculate discount
    IF v_coupon.discount_type = 'percentage' THEN
        v_discount := p_cart_total * (v_coupon.discount_value / 100);
        IF v_coupon.max_discount IS NOT NULL AND v_discount > v_coupon.max_discount THEN
            v_discount := v_coupon.max_discount;
        END IF;
    ELSE
        v_discount := v_coupon.discount_value;
    END IF;
    
    RETURN json_build_object(
        'valid', true,
        'coupon_id', v_coupon.id,
        'code', v_coupon.code,
        'description', v_coupon.description,
        'discount_type', v_coupon.discount_type,
        'discount_value', v_coupon.discount_value,
        'calculated_discount', v_discount,
        'min_purchase', v_coupon.min_purchase,
        'max_discount', v_coupon.max_discount
    );
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 🎯 5. INSERT SAMPLE COUPONS
-- ==========================================

INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase, max_discount, usage_limit, expires_at)
VALUES 
    ('WELCOME10', 'Welcome 10% off for new customers', 'percentage', 10, 500, 200, 100, NOW() + INTERVAL '30 days'),
    ('FLAT100', 'Flat ฿100 off on orders above ฿1000', 'fixed', 100, 1000, NULL, 50, NOW() + INTERVAL '30 days'),
    ('VIP20', 'VIP 20% discount', 'percentage', 20, 1000, 500, NULL, NOW() + INTERVAL '60 days')
ON CONFLICT (code) DO NOTHING;
