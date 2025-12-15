-- 🛠️ SYSTEM SETUP & RESET
-- ล้างค่าเก่าทิ้งก่อน (เฉพาะตอนเริ่มโปรเจกต์ใหม่)
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_mappings CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS social_identities CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TYPE IF EXISTS platform_type CASCADE;
DROP TYPE IF EXISTS order_status_type CASCADE;
DROP TYPE IF EXISTS fulfillment_status_type CASCADE;

-- เปิดใช้งาน UUID Extension (สำหรับสร้าง ID ยาวๆ ไม่ซ้ำกัน)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 🛠️ ENUM DEFINITIONS (ตัวเลือกคงที่)
-- รองรับอนาคต: เพิ่ม 'tiktok', 'facebook' ได้ที่นี่
CREATE TYPE platform_type AS ENUM ('web', 'line', 'facebook', 'tiktok', 'shopee', 'lazada', 'pos');
CREATE TYPE order_status_type AS ENUM ('pending_payment', 'verifying', 'paid', 'cancelled', 'refunded');
CREATE TYPE fulfillment_status_type AS ENUM ('unfulfilled', 'packing', 'shipped', 'delivered', 'returned');

-- ==========================================
-- 👥 1. CUSTOMER & CRM MODULE
-- ==========================================

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,                                      -- ชื่อที่ใช้เรียก
    phone TEXT,                                     -- เบอร์โทร (Key หลักในการระบุตัวตน)
    email TEXT,
    address JSONB DEFAULT '{}',                     -- เก็บที่อยู่เป็น JSON (ยืดหยุ่นตาม Platform)
    
    -- CRM Fields
    tier VARCHAR(50) DEFAULT 'member',              -- member, vip, platinum
    points INTEGER DEFAULT 0,                       -- แต้มสะสม
    total_spent DECIMAL(10,2) DEFAULT 0.00,         -- ยอดซื้อรวมตลอดชีพ (LTV)
    
    -- Intelligence Fields
    style_tags TEXT[],                              -- AI Tagging: ['vintage', 'cat-eye', 'metal-frame']
    notes TEXT,                                     -- โน้ตลับแอดมิน
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตารางเชื่อมตัวตน (Omnichannel Identity)
-- 1 คน มีได้หลาย Social ID (LINE, FB, TikTok)
CREATE TABLE social_identities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    platform platform_type NOT NULL,
    social_user_id TEXT NOT NULL,                   -- User ID ของ Platform นั้น (เช่น U1234...)
    profile_data JSONB,                             -- รูปโปรไฟล์, Display Name ณ ขณะนั้น
    is_following BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE (platform, social_user_id)               -- ห้ามซ้ำ user เดิมใน platform เดิม
);

-- ==========================================
-- 🛍️ 2. FASHION PRODUCT MODULE (Variant System)
-- ==========================================

-- ตารางแม่: รุ่นสินค้า (The Model)
-- เช่น "Rayban Aviator" (ยังไม่ระบุสี)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    brand VARCHAR(100),
    category VARCHAR(100),                          -- Sunglasses, Eyeglasses, Accessories
    gender VARCHAR(20) DEFAULT 'unisex',            -- men, women, unisex
    base_price DECIMAL(10,2),                       -- ราคาตั้งต้น (เพื่อแสดงโชว์)
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตารางลูก: ตัวเลือกสินค้า (The Variant)
-- เช่น "Rayban Aviator - สีทอง เลนส์เขียว"
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE NOT NULL,                       -- รหัสสินค้าจริง *ห้ามซ้ำ* (ใช้ยิงบาร์โค้ด)
    
    -- Fashion Attributes
    color_name VARCHAR(50),                         -- Gold, Black, Tortoise
    color_code VARCHAR(20),                         -- HEX Code เช่น #FFD700 (ไว้โชว์ปุ่มสีบนเว็บ)
    frame_material VARCHAR(50),                     -- Metal, Acetate, TR90
    size_label VARCHAR(20),                         -- S, M, L, 55mm
    
    price DECIMAL(10,2) NOT NULL,                   -- ราคาขายจริงของสีนี้
    cost_price DECIMAL(10,2) DEFAULT 0.00,          -- ราคาทุน
    
    images JSONB DEFAULT '[]',                      -- รูปเฉพาะสีนี้ (Array of URL)
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตารางคลังสินค้า (Inventory)
-- แยกออกมาเพื่อให้ตัดสต็อกง่าย และรองรับหลายคลังในอนาคต
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,            -- จำนวนคงเหลือ
    reserved_quantity INTEGER DEFAULT 0,            -- จองไว้ในตะกร้า (ยังไม่จ่าย)
    location VARCHAR(50) DEFAULT 'main_warehouse',  -- เผื่อมีหน้าร้านหลายสาขา
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE (variant_id, location)
);

-- ตารางเชื่อมสินค้าภายนอก (Mapping)
-- สำหรับ TikTok/LINE Shop (Variant เรา = ID ไหนของเขา)
CREATE TABLE product_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    platform platform_type NOT NULL,
    external_variant_id TEXT NOT NULL,              -- ID ใน TikTok/LINE
    external_product_id TEXT,                       -- ID แม่ใน TikTok/LINE
    sync_status BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMPTZ,
    
    UNIQUE (platform, external_variant_id)
);

-- ==========================================
-- 📦 3. ORDER MODULE
-- ==========================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,              -- INV-20251201-001
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    platform_source platform_type DEFAULT 'web',
    external_order_ref TEXT,
    
    -- Amounts
    subtotal DECIMAL(10,2) DEFAULT 0.00,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    shipping_cost DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    
    -- Status
    payment_status order_status_type DEFAULT 'pending_payment',
    fulfillment_status fulfillment_status_type DEFAULT 'unfulfilled',
    
    -- Evidence & Logistics
    slip_image_url TEXT,
    shipping_address JSONB,                         -- Snapshot ที่อยู่ ณ ตอนซื้อ
    tracking_number TEXT,
    shipping_carrier VARCHAR(50),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name_snapshot TEXT,                     -- ชื่อสินค้าตอนซื้อ (เผื่อเปลี่ยนชื่อทีหลัง)
    sku_snapshot TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_per_unit DECIMAL(10,2) NOT NULL           -- ราคาต่อชิ้นตอนซื้อ
);

-- ==========================================
-- ⚙️ 4. AUTOMATION & SECURITY
-- ==========================================

-- Trigger: Update updated_at automatically
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_time BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_products_time BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_variants_time BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_inventory_time BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_orders_time BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- RLS Policies (เปิดกว้างสำหรับ Dev Phase 1)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Access" ON customers FOR ALL USING (true);
CREATE POLICY "Public Access" ON products FOR ALL USING (true);
CREATE POLICY "Public Access" ON product_variants FOR ALL USING (true);
CREATE POLICY "Public Access" ON inventory FOR ALL USING (true);
CREATE POLICY "Public Access" ON social_identities FOR ALL USING (true);
CREATE POLICY "Public Access" ON product_mappings FOR ALL USING (true);
CREATE POLICY "Public Access" ON orders FOR ALL USING (true);
CREATE POLICY "Public Access" ON order_items FOR ALL USING (true);