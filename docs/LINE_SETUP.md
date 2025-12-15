# 🌉 LINE Bridge Setup Guide

คู่มือการตั้งค่า LINE Messaging API + n8n + ngrok สำหรับ The Visionary CRM

---

## 📋 ภาพรวม Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   ลูกค้า    │────▶│  LINE OA    │────▶│   ngrok     │────▶│    n8n      │
│  (LINE App) │     │  Platform   │     │  (Tunnel)   │     │  (Webhook)  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   ▼
                                                            ┌─────────────┐
                                                            │  Supabase   │
                                                            │  (Database) │
                                                            └─────────────┘
```

---

## 🔧 Step 1: ติดตั้ง Tools

### 1.1 ติดตั้ง n8n (ถ้ายังไม่มี)

```bash
# ติดตั้ง n8n แบบ global
npm install -g n8n

# หรือใช้ npx (ไม่ต้องติดตั้ง)
npx n8n
```

### 1.2 ติดตั้ง ngrok

1. ไปที่ https://ngrok.com/download
2. สมัครบัญชี (ฟรี)
3. Download และแตกไฟล์ไว้ที่ไหนก็ได้ (เช่น `C:\ngrok\`)
4. เปิด Terminal และรัน:

```bash
# ตั้งค่า authtoken (ได้จากหน้า Dashboard ของ ngrok)
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

---

## 🚀 Step 2: รัน n8n + ngrok

### 2.1 เปิด Terminal แรก - รัน n8n

```bash
# รัน n8n (default port 5678)
n8n start

# หรือถ้าใช้ npx
npx n8n
```

เมื่อรันสำเร็จ จะเห็น:

```
n8n is ready!
Editor is now accessible via: http://localhost:5678
```

**เปิด Browser ไปที่: http://localhost:5678**

### 2.2 เปิด Terminal ที่สอง - รัน ngrok

```bash
# เจาะ tunnel ให้ port 5678 (n8n)
ngrok http 5678
```

เมื่อรันสำเร็จ จะเห็น:

```
Forwarding    https://abc123.ngrok-free.app -> http://localhost:5678
```

**📝 จดค่า URL นี้ไว้!** เช่น `https://abc123.ngrok-free.app`

> ⚠️ **สำคัญ:** URL นี้จะเปลี่ยนทุกครั้งที่ restart ngrok (ยกเว้นใช้ plan แบบเสียเงิน)

---

## 📱 Step 3: ตั้งค่า LINE Developers Console

### 3.1 สร้าง Provider & Channel

1. ไปที่ https://developers.line.biz/console/
2. Login ด้วย LINE Account
3. กด **Create** เพื่อสร้าง Provider ใหม่ (ตั้งชื่อบริษัท/แบรนด์)
4. ใน Provider กด **Create a new channel**
5. เลือก **Messaging API**
6. กรอกข้อมูล:
   - Channel name: `The Visionary Shop`
   - Channel description: `Premium Eyewear CRM Bot`
   - Category: `Shopping`
   - Subcategory: `Fashion, accessories`
7. กด **Create**

### 3.2 เก็บ Credentials

ในหน้า Channel ที่สร้างไว้:

**Tab: Basic settings**

- จด **Channel secret** (ปุ่ม copy อยู่ข้างๆ)

**Tab: Messaging API**

- Scroll ลงไปหา **Channel access token**
- กด **Issue** เพื่อสร้าง token (เลือก 0 hours = ไม่หมดอายุ)
- จด **Channel access token** ไว้

### 3.3 ตั้งค่า Webhook

ในหน้า Messaging API tab:

1. **Webhook URL**: ใส่ URL จาก ngrok ต่อท้ายด้วย path

   ```
   https://abc123.ngrok-free.app/webhook/YOUR_WORKFLOW_PATH
   ```

   (จะได้ path จริงหลังสร้าง Workflow ใน n8n)

2. **Use webhook**: เปิด (ON)

3. **Webhook redelivery**: ปิด (OFF) - ป้องกันข้อความซ้ำ

4. Scroll ลงไปหา **Auto-reply messages** → กด **Edit** → **Disabled**

5. Scroll หา **Greeting messages** → กด **Edit** → **Disabled**

---

## 🔄 Step 4: สร้าง n8n Workflow

### 4.1 สร้าง Workflow ใหม่

1. เปิด n8n ที่ http://localhost:5678
2. กด **+ New Workflow**
3. ตั้งชื่อ: `LINE Webhook Handler`

### 4.2 เพิ่ม Node: Webhook

1. กด **+** เพิ่ม node
2. ค้นหา **Webhook**
3. ตั้งค่า:
   - **HTTP Method**: POST
   - **Path**: `line` (หรืออะไรก็ได้)
4. กด **Listen for Test Event** (หรือ **Test URL** ใน version ใหม่)
5. จะได้ URL เช่น:
   ```
   http://localhost:5678/webhook/abc123/line
   ```
6. **Production URL** จะเป็น:
   ```
   https://YOUR-NGROK-URL.ngrok-free.app/webhook/abc123/line
   ```

**📝 เอา URL นี้ไปใส่ใน LINE Webhook URL!**

### 4.3 เพิ่ม Node: Code (Extract Event)

```javascript
// Extract LINE event data
const body = $input.first().json.body || $input.first().json;
const events = body.events || [];

if (events.length === 0) {
  return [{ json: { skip: true } }];
}

const event = events[0];
const userId = event.source?.userId;
const messageType = event.message?.type || event.type;
const text = event.message?.text || "";
const replyToken = event.replyToken;

return [
  {
    json: {
      userId,
      messageType,
      text,
      replyToken,
      eventType: event.type,
      timestamp: event.timestamp,
    },
  },
];
```

### 4.4 เพิ่ม Node: HTTP Request (Get LINE Profile)

- **Method**: GET
- **URL**: `https://api.line.me/v2/bot/profile/{{ $json.userId }}`
- **Authentication**: None
- **Headers**:
  - `Authorization`: `Bearer YOUR_CHANNEL_ACCESS_TOKEN`

### 4.5 เพิ่ม Node: Supabase (Upsert Customer)

- **Resource**: Execute Query
- **Query**:

```sql
SELECT upsert_line_customer(
  '{{ $('Extract Event').item.json.userId }}',
  '{{ $json.displayName }}',
  '{{ $json.pictureUrl }}',
  '{{ $json.statusMessage }}'
);
```

### 4.6 เพิ่ม Node: Supabase (Insert Chat Log)

- **Resource**: Execute Query
- **Query**:

```sql
SELECT insert_chat_log(
  (SELECT customer_id FROM social_identities WHERE platform = 'line' AND social_user_id = '{{ $('Extract Event').item.json.userId }}'),
  'line',
  'inbound',
  '{{ $('Extract Event').item.json.messageType }}',
  '{{ $('Extract Event').item.json.text }}',
  NULL,
  '{{ $('Extract Event').item.json.replyToken }}'
);
```

### 4.7 เพิ่ม Node: HTTP Request (Reply Message)

- **Method**: POST
- **URL**: `https://api.line.me/v2/bot/message/reply`
- **Headers**:
  - `Authorization`: `Bearer YOUR_CHANNEL_ACCESS_TOKEN`
  - `Content-Type`: `application/json`
- **Body (JSON)**:

```json
{
  "replyToken": "{{ $('Extract Event').item.json.replyToken }}",
  "messages": [
    {
      "type": "text",
      "text": "ได้รับข้อความแล้วครับ 🙏"
    }
  ]
}
```

### 4.8 เชื่อมต่อ Nodes

```
Webhook → Extract Event → Get Profile → Upsert Customer → Insert Chat → Reply
```

### 4.9 Save & Activate

1. กด **Save**
2. กด **Activate** (มุมขวาบน) ให้เป็น ON

---

## ✅ Step 5: ทดสอบ

### 5.1 Verify Webhook

1. กลับไปที่ LINE Developers Console
2. ใส่ Webhook URL (Production URL จาก ngrok)
3. กด **Verify**
4. ถ้าขึ้น ✅ Success = สำเร็จ!

### 5.2 ทดสอบส่งข้อความ

1. เปิด LINE App บนมือถือ
2. ค้นหา LINE OA ของคุณ (หรือ scan QR Code จากหน้า Messaging API)
3. Add friend
4. พิมพ์ข้อความทดสอบ: `สวัสดีครับ`

### 5.3 ตรวจสอบผลลัพธ์

- [ ] n8n Executions: เห็น execution สำเร็จ
- [ ] Bot ตอบกลับ: `ได้รับข้อความแล้วครับ 🙏`
- [ ] Supabase `customers`: มี row ใหม่พร้อมชื่อจาก LINE
- [ ] Supabase `social_identities`: มี row ใหม่พร้อม line_user_id
- [ ] Supabase `chat_logs`: มีข้อความที่ส่งไป

---

## 🔐 Step 6: เก็บ Credentials ใน .env.local

```env
# LINE Messaging API
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
LINE_CHANNEL_SECRET=your_channel_secret_here
```

---

## 🐛 Troubleshooting

### Webhook Verify ไม่ผ่าน

- ตรวจสอบว่า n8n ยังรันอยู่
- ตรวจสอบว่า ngrok ยังรันอยู่
- ตรวจสอบ URL ว่าถูกต้อง (Production URL)

### ไม่ได้รับข้อความ

- เช็คว่า Workflow ถูก Activate แล้ว
- เปิด n8n Executions ดู error

### Bot ไม่ตอบ

- ตรวจสอบ Channel Access Token ถูกต้อง
- ตรวจสอบ replyToken ยังไม่หมดอายุ (30 วินาที)

### ngrok URL เปลี่ยน

- ทุกครั้งที่ restart ngrok ต้องอัพเดท Webhook URL ใน LINE Console
