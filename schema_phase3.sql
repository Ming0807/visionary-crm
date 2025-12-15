-- ==========================================
-- 🌉 PHASE 3: LINE BRIDGE SCHEMA
-- ==========================================
-- รันหลังจาก schema_phase2.sql

-- ==========================================
-- 💬 1. CHAT LOGS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS chat_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    
    -- Platform & Direction
    platform VARCHAR(20) NOT NULL DEFAULT 'line',  -- 'line', 'facebook', 'instagram', 'web'
    direction VARCHAR(10) NOT NULL,  -- 'inbound' (ลูกค้าส่งมา), 'outbound' (เราส่งไป)
    
    -- Message Content
    message_type VARCHAR(20) NOT NULL DEFAULT 'text',  -- 'text', 'image', 'sticker', 'location', 'template'
    content TEXT,  -- เนื้อหาข้อความ หรือ URL รูป
    
    -- Platform-specific IDs
    platform_message_id VARCHAR(100),  -- ID ข้อความจาก platform
    reply_token VARCHAR(100),  -- LINE reply token (valid 30 sec)
    
    -- Metadata
    metadata JSONB DEFAULT '{}',  -- เก็บข้อมูลเพิ่มเติม เช่น sticker_id, location_data
    
    -- Admin Info (for outbound)
    replied_by UUID,  -- admin user id ที่ตอบ
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_logs_customer ON chat_logs(customer_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_platform ON chat_logs(platform);
CREATE INDEX IF NOT EXISTS idx_chat_logs_created ON chat_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_logs_unread ON chat_logs(customer_id, is_read) WHERE is_read = FALSE;

-- ==========================================
-- 🔗 2. UPDATE SOCIAL IDENTITIES
-- ==========================================

-- เพิ่ม columns ที่จำเป็นสำหรับ LINE
ALTER TABLE social_identities 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS picture_url TEXT,
ADD COLUMN IF NOT EXISTS status_message TEXT,
ADD COLUMN IF NOT EXISTS language VARCHAR(10),
ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ DEFAULT NOW();

-- Index สำหรับ lookup by platform user ID
CREATE INDEX IF NOT EXISTS idx_social_identities_lookup 
ON social_identities(platform, social_user_id);

-- ==========================================
-- 🔧 3. HELPER FUNCTIONS
-- ==========================================

-- Function: Upsert customer จาก LINE (ถ้ามีแล้ว return, ถ้าไม่มีสร้างใหม่)
CREATE OR REPLACE FUNCTION upsert_line_customer(
    p_line_user_id VARCHAR,
    p_display_name VARCHAR,
    p_picture_url TEXT DEFAULT NULL,
    p_status_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_customer_id UUID;
    v_social_id UUID;
BEGIN
    -- ลองหาจาก social_identities ก่อน
    SELECT customer_id INTO v_customer_id
    FROM social_identities
    WHERE platform = 'line' AND social_user_id = p_line_user_id;
    
    IF v_customer_id IS NOT NULL THEN
        -- มีอยู่แล้ว -> อัพเดท last_active และ profile
        UPDATE social_identities SET
            display_name = COALESCE(p_display_name, display_name),
            picture_url = COALESCE(p_picture_url, picture_url),
            status_message = COALESCE(p_status_message, status_message),
            last_active = NOW()
        WHERE platform = 'line' AND social_user_id = p_line_user_id;
        
        -- อัพเดทชื่อใน customers ด้วย (ถ้ายังไม่มี)
        UPDATE customers SET
            name = COALESCE(name, p_display_name),
            updated_at = NOW()
        WHERE id = v_customer_id AND name IS NULL;
        
        RETURN v_customer_id;
    END IF;
    
    -- ไม่มี -> สร้างใหม่
    INSERT INTO customers (name, tier, points, total_spent)
    VALUES (p_display_name, 'bronze', 0, 0)
    RETURNING id INTO v_customer_id;
    
    INSERT INTO social_identities (customer_id, platform, social_user_id, display_name, picture_url, status_message, last_active)
    VALUES (v_customer_id, 'line', p_line_user_id, p_display_name, p_picture_url, p_status_message, NOW());
    
    RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql;

-- Function: บันทึก chat log
CREATE OR REPLACE FUNCTION insert_chat_log(
    p_customer_id UUID,
    p_platform VARCHAR,
    p_direction VARCHAR,
    p_message_type VARCHAR,
    p_content TEXT,
    p_platform_message_id VARCHAR DEFAULT NULL,
    p_reply_token VARCHAR DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO chat_logs (
        customer_id, platform, direction, message_type, content,
        platform_message_id, reply_token, metadata
    )
    VALUES (
        p_customer_id, p_platform, p_direction, p_message_type, p_content,
        p_platform_message_id, p_reply_token, p_metadata
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 🔒 4. RLS POLICIES
-- ==========================================

ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Access" ON chat_logs FOR ALL USING (true);

-- ==========================================
-- 📊 5. VIEWS FOR ADMIN
-- ==========================================

-- View: รายการ conversations ล่าสุด
CREATE OR REPLACE VIEW v_conversations AS
SELECT 
    c.id AS customer_id,
    c.name AS customer_name,
    si.display_name AS line_name,
    si.picture_url,
    si.platform,
    si.social_user_id AS line_user_id,
    (
        SELECT content 
        FROM chat_logs cl 
        WHERE cl.customer_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
    ) AS last_message,
    (
        SELECT created_at 
        FROM chat_logs cl 
        WHERE cl.customer_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
    ) AS last_message_at,
    (
        SELECT COUNT(*) 
        FROM chat_logs cl 
        WHERE cl.customer_id = c.id AND cl.is_read = FALSE AND cl.direction = 'inbound'
    )::INT AS unread_count
FROM customers c
INNER JOIN social_identities si ON si.customer_id = c.id AND si.platform = 'line'
ORDER BY last_message_at DESC NULLS LAST;
