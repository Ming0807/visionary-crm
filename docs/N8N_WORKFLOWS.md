# 🔄 n8n Workflow Templates

คู่มือสร้าง Workflow ใน n8n ที่มีอยู่ (ไม่ต้องติดตั้งใหม่)

---

## 📋 Pre-requisites

- n8n รันอยู่ที่ http://localhost:5678 ✅
- ngrok รันอยู่ (สำหรับ LINE webhook) ✅
- LINE Notify Token (ฟรี)

---

## 🔔 Workflow 1: Daily Sales Alert

**ส่งสรุปยอดขายทุกเช้า 9:00 ผ่าน LINE**

### Node Setup:

```
[Schedule Trigger] → [HTTP Request] → [LINE Notify]
     9:00 AM            GET /api/...       POST notify
```

### Step 1: Add Schedule Trigger

1. Click **+** → Search **Schedule Trigger**
2. Settings:
   - **Trigger**: Cron
   - **Expression**: `0 9 * * *` (ทุกวัน 9:00)

### Step 2: Add HTTP Request

1. Click **+** → Search **HTTP Request**
2. Settings:
   - **Method**: GET
   - **URL**: `https://YOUR-NGROK-URL.ngrok-free.app/api/analytics/daily`
   - **Options** → **Headers**:
     - Add `ngrok-skip-browser-warning: true`

### Step 3: Add LINE Notify

1. Click **+** → Search **HTTP Request** (หรือ LINE Node ถ้ามี)
2. Settings:
   - **Method**: POST
   - **URL**: `https://notify-api.line.me/api/notify`
   - **Authentication**: None
   - **Headers**:
     - `Authorization`: `Bearer YOUR_LINE_NOTIFY_TOKEN`
     - `Content-Type`: `application/x-www-form-urlencoded`
   - **Body Content Type**: Form URL Encoded
   - **Body Parameters**:
     - `message`: `{{ $json.lineMessage }}`

### Step 4: Save & Activate

1. ตั้งชื่อ: `Daily Sales Alert`
2. กด **Save**
3. กด **Activate** (ON)

---

## 🎂 Workflow 2: Birthday Alert

**แจ้งเตือนวันเกิดลูกค้าใน 3 วันข้างหน้า**

### Node Setup:

```
[Schedule Trigger] → [HTTP Request] → [IF Birthday] → [LINE Notify]
     8:00 AM            GET /api/...       count > 0      POST notify
```

### Step 1: Add Schedule Trigger

- **Expression**: `0 8 * * *` (ทุกวัน 8:00)

### Step 2: Add HTTP Request

- **URL**: `https://YOUR-NGROK-URL.ngrok-free.app/api/customers/birthdays?days=3`
- **Headers**: `ngrok-skip-browser-warning: true`

### Step 3: Add IF Node

1. Click **+** → Search **IF**
2. Settings:
   - **Condition**: `{{ $json.count }}` **is greater than** `0`

### Step 4: Add LINE Notify (True branch)

- **URL**: `https://notify-api.line.me/api/notify`
- **Body**: `message={{ $json.lineMessage }}`

---

## 📱 วิธีขอ LINE Notify Token (ฟรี)

1. ไปที่ https://notify-bot.line.me/
2. Login ด้วย LINE Account
3. คลิก **Generate Token**
4. เลือก chat:
   - **1-on-1 chat**: ส่งหาตัวเอง (สำหรับ test)
   - **Group**: ส่งเข้ากลุ่ม (สำหรับ admin team)
5. Copy token มาใช้!

> ⚠️ **หมายเหตุ**: LINE Notify Token ใช้ได้ตลอด ไม่หมดอายุ

---

## 🧪 Test Workflow

### Test Daily Sales:

```bash
curl "http://localhost:3000/api/analytics/daily"
```

Expected response:

```json
{
  "summary": {
    "totalOrders": 5,
    "paidOrders": 3,
    "totalRevenue": 12500,
    "newCustomers": 2
  },
  "lineMessage": "📊 สรุปยอดขายวันนี้..."
}
```

### Test Birthday:

```bash
curl "http://localhost:3000/api/customers/birthdays?days=7"
```

---

## 🚀 Advanced: At-Risk Customer Alert

**แจ้งเตือนลูกค้าที่เสี่ยงหายไป**

### API Call:

```
GET /api/customers?segment=at_risk
```

### Workflow:

```
[Schedule Trigger] → [Supabase Query] → [Filter] → [LINE Notify]
    Weekly              at_risk segment    count>0    Send alert
```

---

## 📝 Quick Reference

| Workflow    | Schedule | API Endpoint                      |
| ----------- | -------- | --------------------------------- |
| Daily Sales | 9:00 AM  | `/api/analytics/daily`            |
| Birthday    | 8:00 AM  | `/api/customers/birthdays?days=3` |
| At-Risk     | Weekly   | `/api/customers?segment=at_risk`  |
