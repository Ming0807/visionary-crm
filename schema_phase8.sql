-- ==========================================
-- 📣 PHASE 8: DYNAMIC CONTENT MANAGEMENT
-- ==========================================
-- สำหรับจัดการ content ที่เดิมเป็น mock data
-- ไม่มี FK dependencies กับ table เดิม
-- รันใน Supabase SQL Editor

-- 1. Site Settings (Key-Value Store)
CREATE TABLE IF NOT EXISTS site_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Testimonials (Customer Reviews)
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    product_name VARCHAR(200),
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Team Members (About Page)
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (Allow Public Access)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Access" ON site_settings;
DROP POLICY IF EXISTS "Public Access" ON testimonials;
DROP POLICY IF EXISTS "Public Access" ON team_members;

CREATE POLICY "Public Access" ON site_settings FOR ALL USING (true);
CREATE POLICY "Public Access" ON testimonials FOR ALL USING (true);
CREATE POLICY "Public Access" ON team_members FOR ALL USING (true);

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES 
    ('promo_banner', '{"enabled": true, "title": "Flash Sale!", "subtitle": "ลดสูงสุด 50%", "endDate": null}'),
    ('brand_logos', '["Ray-Ban", "Oakley", "Gucci", "Prada", "Oliver Peoples", "Tom Ford"]'),
    ('contact_info', '{"phone": "02-XXX-XXXX", "email": "hello@thevisionary.co.th", "line": "@thevisionary", "address": "123 สุขุมวิท กรุงเทพฯ 10110"}')
ON CONFLICT (key) DO NOTHING;

-- Insert sample testimonials
INSERT INTO testimonials (customer_name, avatar_url, rating, comment, product_name, is_featured, display_order) VALUES
    ('คุณสมศักดิ์', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', 5, 'แว่นสวยมาก คุณภาพดีเกินราคา ส่งไวมาก!', 'Ray-Ban Aviator', true, 1),
    ('คุณนภา', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', 5, 'ประทับใจบริการมาก พนักงานให้คำปรึกษาดี', 'Gucci GG0061S', true, 2),
    ('คุณวิชัย', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', 5, 'ซื้อมาหลายตัวแล้ว ของแท้ทุกชิ้น!', 'Oakley Holbrook', true, 3),
    ('คุณมาลี', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', 5, 'ร้านนี้ดีมากค่ะ แนะนำเลย!', 'Tom Ford FT5401', true, 4)
ON CONFLICT DO NOTHING;

-- Insert sample team
INSERT INTO team_members (name, role, image_url, display_order) VALUES
    ('ดร.สมชาย วิสัยทัศน์', 'ผู้ก่อตั้งและ CEO', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', 1),
    ('คุณวิภา แว่นตา', 'หัวหน้าทีมจักษุแพทย์', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', 2),
    ('คุณธนกร สไตลิสต์', 'หัวหน้าฝ่ายออกแบบ', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 3)
ON CONFLICT DO NOTHING;
