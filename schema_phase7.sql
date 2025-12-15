-- ==========================================
-- 📣 PHASE 7: AUTOMATED MARKETING
-- ==========================================
-- รันหลังจาก schema_phase6.sql

-- ==========================================
-- 👤 1. ADD BIRTHDAY TO CUSTOMERS
-- ==========================================

ALTER TABLE customers ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_order_date TIMESTAMPTZ;

-- Update last_order_date from existing orders
UPDATE customers c SET last_order_date = (
    SELECT MAX(created_at) FROM orders WHERE customer_id = c.id
) WHERE last_order_date IS NULL;

-- ==========================================
-- 📊 2. CAMPAIGNS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    campaign_type VARCHAR(50) NOT NULL CHECK (
        campaign_type IN ('birthday', 're_engagement', 'point_expiration', 'promotion', 'custom')
    ),
    status VARCHAR(20) DEFAULT 'draft' CHECK (
        status IN ('draft', 'active', 'paused', 'completed')
    ),
    target_audience JSONB DEFAULT '{}',
    message_template TEXT NOT NULL,
    coupon_id UUID REFERENCES coupons(id),
    send_channel VARCHAR(20) DEFAULT 'line' CHECK (
        send_channel IN ('line', 'email', 'both')
    ),
    schedule_type VARCHAR(20) DEFAULT 'manual' CHECK (
        schedule_type IN ('manual', 'daily', 'weekly', 'monthly', 'once')
    ),
    scheduled_at TIMESTAMPTZ,
    last_run_at TIMESTAMPTZ,
    total_sent INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON campaigns;
CREATE POLICY "Public Access" ON campaigns FOR ALL USING (true);

-- ==========================================
-- 📝 3. CAMPAIGN LOGS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS campaign_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'sent' CHECK (
        status IN ('sent', 'delivered', 'opened', 'clicked', 'failed')
    ),
    message_content TEXT,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_campaign_logs_campaign ON campaign_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_customer ON campaign_logs(customer_id);

ALTER TABLE campaign_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Access" ON campaign_logs;
CREATE POLICY "Public Access" ON campaign_logs FOR ALL USING (true);

-- ==========================================
-- 🎂 4. FUNCTION: Get Birthday Customers
-- ==========================================

CREATE OR REPLACE FUNCTION get_birthday_customers_today()
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    birthday DATE,
    line_user_id TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.birthday,
        si.social_user_id as line_user_id
    FROM customers c
    LEFT JOIN social_identities si ON si.customer_id = c.id AND si.platform = 'line'
    WHERE 
        EXTRACT(MONTH FROM c.birthday) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(DAY FROM c.birthday) = EXTRACT(DAY FROM CURRENT_DATE);
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 😴 5. FUNCTION: Get Inactive Customers
-- ==========================================

CREATE OR REPLACE FUNCTION get_inactive_customers(days_inactive INTEGER DEFAULT 30)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    email VARCHAR,
    phone VARCHAR,
    last_order_date TIMESTAMPTZ,
    days_since_order INTEGER,
    line_user_id TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.last_order_date,
        EXTRACT(DAY FROM NOW() - c.last_order_date)::INTEGER as days_since_order,
        si.social_user_id as line_user_id
    FROM customers c
    LEFT JOIN social_identities si ON si.customer_id = c.id AND si.platform = 'line'
    WHERE 
        c.last_order_date IS NOT NULL
        AND c.last_order_date < NOW() - (days_inactive || ' days')::INTERVAL
    ORDER BY c.last_order_date ASC;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 🎁 6. INSERT SAMPLE CAMPAIGNS
-- ==========================================

INSERT INTO campaigns (name, description, campaign_type, status, message_template, schedule_type)
VALUES 
    (
        'Birthday Wishes', 
        'Automatic birthday greetings with special discount', 
        'birthday', 
        'active',
        'สุขสันต์วันเกิดครับ/ค่ะ คุณ{{name}} 🎂🎉 รับส่วนลดพิเศษ 15% สำหรับการซื้อครั้งต่อไป ใช้โค้ด BDAY15 ภายใน 7 วันนี้เท่านั้น!',
        'daily'
    ),
    (
        'We Miss You', 
        'Re-engagement campaign for inactive customers', 
        're_engagement', 
        'active',
        'สวัสดีครับ/ค่ะ คุณ{{name}} 💙 เราคิดถึงคุณนะ! เรามีสินค้าใหม่มากมายที่อยากให้คุณมาดู รับส่วนลด 10% เมื่อกลับมาช้อปกับเรา ใช้โค้ด MISSYOU10',
        'weekly'
    )
ON CONFLICT DO NOTHING;
