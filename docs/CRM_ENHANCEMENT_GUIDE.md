# 🛠️ CRM Enhancement Setup Guide

## 📋 Table of Contents

1. [Run SQL Migration](#1-run-sql-migration)
2. [Test Customer Behaviors](#2-test-customer-behaviors)
3. [n8n Setup (Free)](#3-n8n-setup-free)

---

## 1. Run SQL Migration

### Step 1: Open Supabase Dashboard

1. Go to [supabase.com](https://supabase.com) and login
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run Migration

1. Copy the contents of `migrations/crm_enhancement.sql`
2. Paste into the SQL Editor
3. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify

```sql
-- Check new columns exist
SELECT id, name, birthday, segment, join_date, last_order_at
FROM customers
LIMIT 5;
```

Expected output should show:

- `birthday` - วันเกิดลูกค้า
- `segment` - หมวดหมู่ลูกค้า (champion, loyal, at_risk, etc.)
- `join_date` - วันที่เริ่มเป็นสมาชิก

---

## 2. Test Customer Behaviors

### วิธีดูข้อมูล Customer Behavior (ใน Admin Dashboard)

1. **เข้า Admin Dashboard**: http://localhost:3000/admin
2. **ไป Customers**: คลิก "Customers" ในเมนู
3. **คลิกที่ชื่อลูกค้า**: เข้าไปหน้า Customer 360 View
4. **ดู Tab "Behavior"**: จะแสดงกิจกรรมทั้งหมด

### สิ่งที่จะเห็น:

| Field      | ความหมาย                   |
| ---------- | -------------------------- |
| `🎂 Soon!` | วันเกิดใกล้จะถึงใน 7 วัน   |
| `Champion` | ลูกค้า VIP ซื้อบ่อย ยอดสูง |
| `At Risk`  | ลูกค้าไม่มีกิจกรรม 60+ วัน |
| `Lost`     | ลูกค้าหายไป 180+ วัน       |
| `New`      | ลูกค้าใหม่ใน 30 วัน        |

### Mock Data ที่สร้างไว้:

```
- วิชัย พรีเมียม (Champion) - ยอดซื้อ 85,000 ซื้อบ่อย
- มานี หายไป (At Risk) - ไม่ซื้อ 65 วัน
- นิว คัสโตเมอร์ (New) - เพิ่งสมัคร 3 วัน
- เบิร์ดเดย์ มาแล้ว (Birthday Soon!) - วันเกิดใน 3 วัน
- หายนาน มาก (Lost) - หายไป 200 วัน
```

### วิธีสร้าง Behavior Data เพิ่ม:

```sql
-- ใน Supabase SQL Editor
INSERT INTO customer_behaviors (customer_id, behavior_type, variant_id)
SELECT
  c.id,
  'view',
  (SELECT id FROM product_variants LIMIT 1)
FROM customers c
WHERE c.name LIKE '%สมชาย%'
LIMIT 1;
```

---

## 3. n8n Setup (Free)

### Option A: n8n Cloud (Free Tier)

> ⚠️ Free tier จำกัด 5 workflows, 500 executions/month

1. Go to [n8n.io](https://n8n.io)
2. Sign up for free
3. Create workspace
4. Ready to use!

### Option B: Self-Hosted (Recommended - ฟรีไม่จำกัด)

#### ติดตั้งด้วย Docker:

```bash
# 1. สร้าง folder สำหรับ n8n
mkdir n8n-local
cd n8n-local

# 2. Run n8n ด้วย Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  n8nio/n8n

# 3. เปิด browser ไป http://localhost:5678
```

#### ถ้าไม่มี Docker:

```bash
# ติดตั้งผ่าน npm (ต้องมี Node.js)
npm install n8n -g
n8n start
```

### First Workflow: Daily Sales Alert

1. **เปิด n8n**: http://localhost:5678
2. **Create New Workflow**
3. **Add Nodes**:

```
[Schedule Trigger] → [HTTP Request] → [LINE Notify]
     ↓ 9:00 AM           ↓ GET /api/analytics     ↓ Send to Admin
```

#### Node Settings:

**Schedule Trigger:**

- Trigger: Cron
- Expression: `0 9 * * *` (ทุกวัน 9:00)

**HTTP Request:**

- Method: GET
- URL: `http://localhost:3000/api/analytics/overview`

**LINE Notify:**

- Method: POST
- URL: `https://notify-api.line.me/api/notify`
- Headers: `Authorization: Bearer YOUR_LINE_NOTIFY_TOKEN`
- Body: `message={{ $json.summary }}`

### วิธีขอ LINE Notify Token (ฟรี):

1. ไปที่ https://notify-bot.line.me/
2. Login ด้วย LINE Account
3. คลิก "Generate Token"
4. เลือก Group หรือ "1-on-1 chat"
5. Copy token มาใช้

---

## 🧪 Quick Test Checklist

- [ ] Run SQL migration in Supabase
- [ ] Check customers have birthday/segment fields
- [ ] Open Customer 360 View and see:
  - [ ] Birthday with "🎂 Soon!" badge
  - [ ] Segment badge (Champion/At Risk/Lost)
  - [ ] Warning messages for at-risk customers
- [ ] Install n8n locally or use cloud
- [ ] Create first test workflow

---

## 🎯 Next Steps After Setup

1. **Birthday Automation**: ส่ง LINE อวยพรวันเกิด
2. **Win-back Campaign**: ติดต่อลูกค้า At Risk
3. **Daily Reports**: สรุปยอดขายทุกเช้า
4. **Review Request**: ขอ review หลังส่งของ 3 วัน
