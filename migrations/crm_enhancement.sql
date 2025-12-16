-- 🎂 CRM ENHANCEMENT MIGRATION
-- Run this in Supabase SQL Editor to add birthday and customer behavior fields

-- =============================================
-- 1. Add Birthday and Join Date fields
-- =============================================

ALTER TABLE customers ADD COLUMN IF NOT EXISTS birthday DATE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS join_date DATE DEFAULT CURRENT_DATE;

-- =============================================
-- 2. Add Customer Segment field (auto-calculated)
-- =============================================

ALTER TABLE customers ADD COLUMN IF NOT EXISTS segment VARCHAR(50) DEFAULT 'new';
-- Segments: 'champion', 'loyal', 'promising', 'new', 'at_risk', 'lost'

-- =============================================
-- 3. Add Last Activity Tracking
-- =============================================

ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_order_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;

-- =============================================
-- 4. Update existing customers with mock birthdays
-- =============================================

UPDATE customers 
SET 
    birthday = CASE 
        WHEN name LIKE '%สมชาย%' THEN '1985-12-20'::DATE  -- Birthday soon!
        WHEN name LIKE '%ลิซ่า%' THEN '1998-03-15'::DATE
        WHEN name LIKE '%จอร์จ%' THEN '1992-07-22'::DATE
        ELSE (CURRENT_DATE - (RANDOM() * 365 * 30)::INT)::DATE
    END,
    join_date = CASE 
        WHEN tier = 'vip' THEN CURRENT_DATE - INTERVAL '365 days'
        WHEN tier = 'member' THEN CURRENT_DATE - INTERVAL '90 days'
        ELSE CURRENT_DATE - INTERVAL '30 days'
    END,
    segment = CASE 
        WHEN tier = 'vip' THEN 'champion'
        WHEN tier = 'member' THEN 'promising'
        ELSE 'new'
    END
WHERE birthday IS NULL;

-- =============================================
-- 5. Create sample customers with different behaviors
-- =============================================

-- Champion Customer (ซื้อบ่อย, ยอดสูง)
INSERT INTO customers (name, phone, email, tier, points, total_spent, style_tags, notes, birthday, join_date, segment, last_order_at)
VALUES (
    'วิชัย พรีเมียม',
    '0891234567',
    'wichai@example.com',
    'platinum',
    2500,
    85000.00,
    ARRAY['luxury', 'brand-conscious'],
    'ลูกค้า VIP สั่งซื้อประจำทุกเดือน ชอบสินค้าพรีเมียม',
    '1975-01-15',
    CURRENT_DATE - INTERVAL '2 years',
    'champion',
    CURRENT_DATE - INTERVAL '5 days'
) ON CONFLICT DO NOTHING;

-- At Risk Customer (ไม่ซื้อนานแล้ว)
INSERT INTO customers (name, phone, email, tier, points, total_spent, style_tags, notes, birthday, join_date, segment, last_order_at)
VALUES (
    'มานี หายไป',
    '0823456789',
    'manee@example.com',
    'member',
    100,
    5500.00,
    ARRAY['minimal', 'budget'],
    'เคยซื้อบ่อยแต่หายไป 2 เดือนแล้ว ควรติดต่อ!',
    '1990-06-20',
    CURRENT_DATE - INTERVAL '6 months',
    'at_risk',
    CURRENT_DATE - INTERVAL '65 days'
) ON CONFLICT DO NOTHING;

-- New Customer (เพิ่งมา)
INSERT INTO customers (name, phone, email, tier, points, total_spent, style_tags, notes, birthday, join_date, segment, last_order_at)
VALUES (
    'นิว คัสโตเมอร์',
    '0834567890',
    'new@example.com',
    'member',
    0,
    0.00,
    ARRAY['trendy', 'first-time'],
    'ลูกค้าใหม่จาก LINE ยังไม่เคยสั่งซื้อ',
    '2000-12-25',
    CURRENT_DATE - INTERVAL '3 days',
    'new',
    NULL
) ON CONFLICT DO NOTHING;

-- Birthday Coming Soon Customer
INSERT INTO customers (name, phone, email, tier, points, total_spent, style_tags, notes, birthday, join_date, segment, last_order_at)
VALUES (
    'เบิร์ดเดย์ มาแล้ว',
    '0845678901',
    'birthday@example.com',
    'member',
    150,
    3200.00,
    ARRAY['gift', 'celebration'],
    'วันเกิดใกล้จะถึงแล้ว!',
    (CURRENT_DATE + INTERVAL '3 days')::DATE,  -- Birthday in 3 days!
    CURRENT_DATE - INTERVAL '60 days',
    'promising',
    CURRENT_DATE - INTERVAL '20 days'
) ON CONFLICT DO NOTHING;

-- Lost Customer (หายไปนานมาก)
INSERT INTO customers (name, phone, email, tier, points, total_spent, style_tags, notes, birthday, join_date, segment, last_order_at)
VALUES (
    'หายนาน มาก',
    '0856789012',
    'lost@example.com',
    'member',
    50,
    1500.00,
    ARRAY['unknown'],
    'ไม่มีกิจกรรมมานานมาก อาจต้อง win-back',
    '1988-09-10',
    CURRENT_DATE - INTERVAL '1 year',
    'lost',
    CURRENT_DATE - INTERVAL '200 days'
) ON CONFLICT DO NOTHING;

-- =============================================
-- 7. MOCK BEHAVIOR DATA (สำคัญ! ต้อง run หลัง schema_phase2.sql)
-- =============================================

-- เพิ่ม behavior data ให้ลูกค้าที่มีอยู่
DO $$
DECLARE
    v_customer_id UUID;
    v_variant_id UUID;
    v_product_id UUID;
BEGIN
    -- หา customer และ variant IDs
    SELECT id INTO v_customer_id FROM customers WHERE name LIKE '%สมชาย%' LIMIT 1;
    SELECT pv.id, pv.product_id INTO v_variant_id, v_product_id 
    FROM product_variants pv LIMIT 1;
    
    IF v_customer_id IS NOT NULL AND v_variant_id IS NOT NULL THEN
        -- สมชาย: ดูสินค้าหลายครั้ง, เพิ่ม wishlist
        INSERT INTO customer_behaviors (customer_id, behavior_type, variant_id, product_id, metadata)
        VALUES 
            (v_customer_id, 'view', v_variant_id, v_product_id, '{"source": "homepage"}'),
            (v_customer_id, 'view', v_variant_id, v_product_id, '{"source": "search"}'),
            (v_customer_id, 'wishlist_add', v_variant_id, v_product_id, '{}'),
            (v_customer_id, 'view', v_variant_id, v_product_id, '{"source": "email_campaign"}');
    END IF;
    
    -- หา customer ลิซ่า
    SELECT id INTO v_customer_id FROM customers WHERE name LIKE '%ลิซ่า%' LIMIT 1;
    
    IF v_customer_id IS NOT NULL AND v_variant_id IS NOT NULL THEN
        -- ลิซ่า: cart abandon
        INSERT INTO customer_behaviors (customer_id, behavior_type, variant_id, product_id, metadata)
        VALUES 
            (v_customer_id, 'view', v_variant_id, v_product_id, '{"source": "tiktok"}'),
            (v_customer_id, 'cart_abandon', v_variant_id, v_product_id, '{"cart_value": 2590}');
    END IF;
    
    -- หา customer วิชัย (champion)
    SELECT id INTO v_customer_id FROM customers WHERE name LIKE '%วิชัย%' LIMIT 1;
    
    IF v_customer_id IS NOT NULL AND v_variant_id IS NOT NULL THEN
        -- วิชัย: ดูสินค้าเยอะ, wishlist หลายรายการ
        INSERT INTO customer_behaviors (customer_id, behavior_type, variant_id, product_id, metadata)
        VALUES 
            (v_customer_id, 'view', v_variant_id, v_product_id, '{}'),
            (v_customer_id, 'view', v_variant_id, v_product_id, '{}'),
            (v_customer_id, 'view', v_variant_id, v_product_id, '{}'),
            (v_customer_id, 'wishlist_add', v_variant_id, v_product_id, '{}'),
            (v_customer_id, 'search', NULL, NULL, '{"keyword": "titanium frames"}');
    END IF;
END $$;

-- =============================================
-- 6. Create function to auto-update customer segment
-- =============================================

CREATE OR REPLACE FUNCTION update_customer_segment()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate segment based on behavior
    IF NEW.total_spent >= 50000 AND NEW.last_order_at >= CURRENT_DATE - INTERVAL '30 days' THEN
        NEW.segment := 'champion';
    ELSIF NEW.total_spent >= 10000 OR NEW.points >= 500 THEN
        NEW.segment := 'loyal';
    ELSIF NEW.last_order_at IS NULL OR NEW.last_order_at < CURRENT_DATE - INTERVAL '180 days' THEN
        NEW.segment := 'lost';
    ELSIF NEW.last_order_at < CURRENT_DATE - INTERVAL '60 days' THEN
        NEW.segment := 'at_risk';
    ELSIF NEW.join_date >= CURRENT_DATE - INTERVAL '30 days' THEN
        NEW.segment := 'new';
    ELSE
        NEW.segment := 'promising';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop if exists first)
DROP TRIGGER IF EXISTS update_segment_trigger ON customers;
CREATE TRIGGER update_segment_trigger
    BEFORE INSERT OR UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_customer_segment();

-- =============================================
-- 8. Enable RLS for new fields (Fix duplicate policy error)
-- =============================================

-- ไม่ต้องสร้าง policy ใหม่ เพราะ customers มี policy อยู่แล้ว

-- Done! 🎉
SELECT 'Migration completed! Added birthday, segment, sample customers, and behaviors.' as status;
