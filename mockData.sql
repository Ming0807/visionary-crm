-- 🛒 MOCK DATA SCRIPT
-- Script นี้จะใช้ภาษา PL/pgSQL เพื่อให้เราดึง ID ที่เพิ่งสร้างมาเชื่อมโยงกันได้ถูกต้อง (Product -> Variant -> Inventory)

DO $$
DECLARE
    -- ตัวแปรสำหรับเก็บ ID ชั่วคราว
    cust_somchai_id UUID;
    cust_lisa_id UUID;
    
    prod_retro_id UUID;
    var_retro_black_id UUID;
    var_retro_gold_id UUID;
    
    prod_pilot_id UUID;
    var_pilot_silver_id UUID;
    
    order_id UUID;
BEGIN

    -- =============================================
    -- 1. สร้างลูกค้า (Customers)
    -- =============================================
    
    -- ลูกค้าคนที่ 1: สมชาย (เก็บ ID ไว้ใช้สร้างออเดอร์)
    INSERT INTO customers (name, phone, email, tier, points, total_spent, style_tags, notes)
    VALUES ('สมชาย ใจดี', '0811111111', 'somchai@example.com', 'vip', 500, 15990.00, ARRAY['classic', 'business'], 'ลูกค้าชอบสินค้าสีเข้ม ไม่ชอบรอนาน')
    RETURNING id INTO cust_somchai_id;
    
    -- ลูกค้าคนที่ 2: ลิซ่า
    INSERT INTO customers (name, phone, email, tier, points, total_spent, style_tags, notes)
    VALUES ('ลิซ่า แฟชั่น', '0899999999', 'lisa@example.com', 'member', 50, 2500.00, ARRAY['korean-style', 'trendy'], 'ติดตามมาจาก TikTok ชอบของเซลล์')
    RETURNING id INTO cust_lisa_id;

    -- ลูกค้าคนที่ 3: จอร์จ
    INSERT INTO customers (name, phone, email, tier, style_tags)
    VALUES ('จอร์จ ซาร่า', '0822222222', 'george@example.com', 'general', ARRAY['sport', 'outdoors']);

    -- =============================================
    -- 2. สร้างสินค้าชิ้นที่ 1: รุ่น "Vintage Round" (ทรงกลมวินเทจ)
    -- =============================================
    
    INSERT INTO products (name, description, brand, category, gender, base_price)
    VALUES (
        'Vintage Round Master', 
        'แว่นตาทรงกลมสไตล์วินเทจ เหมาะสำหรับคนหน้าเหลี่ยมและหน้ารูปไข่ กรอบทำจากไทเทเนียมน้ำหนักเบา', 
        'Visionary Classic', 
        'Sunglasses', 
        'unisex', 
        2590.00
    ) RETURNING id INTO prod_retro_id;

    -- 2.1 เพิ่มสี: สีดำ (Black)
    INSERT INTO product_variants (product_id, sku, color_name, color_code, frame_material, price, images)
    VALUES (
        prod_retro_id, 
        'VRM-001-BLK', 
        'Matte Black', 
        '#000000', 
        'Titanium', 
        2590.00, 
        '["https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500&q=80"]'::jsonb
    ) RETURNING id INTO var_retro_black_id;

    -- 2.2 เพิ่มสี: สีทอง (Gold)
    INSERT INTO product_variants (product_id, sku, color_name, color_code, frame_material, price, images)
    VALUES (
        prod_retro_id, 
        'VRM-001-GLD', 
        'Rose Gold', 
        '#B76E79', 
        'Titanium', 
        2790.00, -- สีนี้แพงกว่านิดหน่อย
        '["https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=500&q=80"]'::jsonb
    ) RETURNING id INTO var_retro_gold_id;

    -- =============================================
    -- 3. สร้างสินค้าชิ้นที่ 2: รุ่น "Sky Pilot" (ทรงนักบิน)
    -- =============================================

    INSERT INTO products (name, description, brand, category, gender, base_price)
    VALUES (
        'Sky Pilot Aviator', 
        'แว่นทรงนักบินสุดคลาสสิก เลนส์ G15 กันแดด 100% ขาแว่นสปริง ใส่สบายตลอดวัน', 
        'Visionary Active', 
        'Sunglasses', 
        'men', 
        3200.00
    ) RETURNING id INTO prod_pilot_id;

    -- 3.1 เพิ่มสี: สีเงิน (Silver)
    INSERT INTO product_variants (product_id, sku, color_name, color_code, frame_material, price, images)
    VALUES (
        prod_pilot_id, 
        'SPA-002-SLV', 
        'Classic Silver', 
        '#C0C0C0', 
        'Stainless Steel', 
        3200.00, 
        '["https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=500&q=80"]'::jsonb
    ) RETURNING id INTO var_pilot_silver_id;

    -- =============================================
    -- 4. เติมสต็อก (Inventory)
    -- =============================================
    
    INSERT INTO inventory (variant_id, quantity, location) VALUES 
    (var_retro_black_id, 15, 'main_warehouse'), -- สีดำเหลือ 15
    (var_retro_gold_id, 5, 'main_warehouse'),  -- สีทองเหลือ 5 (ใกล้หมด)
    (var_pilot_silver_id, 50, 'main_warehouse'); -- ทรงนักบินเหลือเพียบ

    -- =============================================
    -- 5. สร้างออเดอร์จำลอง (Mock Orders)
    -- =============================================
    
    -- ออเดอร์ที่ 1: คุณสมชาย ซื้อแว่นสีดำ จ่ายเงินแล้ว
    INSERT INTO orders (
        order_number, customer_id, platform_source, 
        total_amount, payment_status, fulfillment_status, 
        shipping_address
    ) VALUES (
        'INV-20251213-001', cust_somchai_id, 'line',
        2590.00, 'paid', 'shipped',
        '{"name": "สมชาย", "line1": "123 ถ.สุขุมวิท", "city": "กทม", "zip": "10110"}'::jsonb
    ) RETURNING id INTO order_id;

    -- รายการในออเดอร์ (Order Items)
    INSERT INTO order_items (order_id, variant_id, product_name_snapshot, sku_snapshot, quantity, price_per_unit)
    VALUES (order_id, var_retro_black_id, 'Vintage Round Master (Matte Black)', 'VRM-001-BLK', 1, 2590.00);

    -- ออเดอร์ที่ 2: ออเดอร์ใหม่จากเว็บ ยังไม่จ่ายเงิน (Pending)
    INSERT INTO orders (
        order_number, platform_source, 
        total_amount, payment_status, fulfillment_status
    ) VALUES (
        'INV-20251213-002', 'web',
        6400.00, 'pending_payment', 'unfulfilled'
    );
    -- (สมมติว่าเป็น Guest User ไม่ระบุ Customer ID)

END $$;