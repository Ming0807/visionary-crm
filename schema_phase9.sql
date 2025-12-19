-- =============================================
-- Schema Phase 9: Email/Password Authentication
-- ระบบสมัครสมาชิก/Login ด้วย Email
-- =============================================

-- 1. เพิ่ม password_hash column
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. ก่อนสร้าง unique index ต้องลบ email ซ้ำ
-- หา duplicate emails และเก็บแค่ record ที่เก่าที่สุด (created_at แรก)
-- ลูกค้าตัวอื่นที่ซ้ำจะถูกตั้ง email เป็น NULL

-- ดู duplicate ก่อน (ไม่ลบ)
-- SELECT email, COUNT(*) FROM customers WHERE email IS NOT NULL GROUP BY email HAVING COUNT(*) > 1;

-- UPDATE ให้ email ซ้ำเป็น NULL (เก็บแค่ record แรก)
WITH duplicates AS (
    SELECT id, email,
           ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at ASC, id ASC) as rn
    FROM customers
    WHERE email IS NOT NULL
)
UPDATE customers
SET email = NULL
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- 3. สร้าง unique index สำหรับ email (เฉพาะที่ไม่ NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email_unique 
ON customers(email) WHERE email IS NOT NULL;

-- 4. เพิ่ม Comment อธิบาย column
COMMENT ON COLUMN customers.password_hash IS 'bcrypt hashed password สำหรับ email/password login';
