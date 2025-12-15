# 🚀 Quick Start Guide - The Visionary CRM

คู่มือการเริ่มรันโปรเจกใหม่ทุกครั้ง (สำหรับ Presentation)

---

## 📋 ก่อนเริ่ม - เช็คว่ามีครบ

- [ ] Docker Desktop เปิดอยู่
- [ ] LINE Developers Console access
- [ ] Terminal 3 หน้าต่าง

---

## 🖥️ Terminal 1: Next.js (หน้าเว็บ)

```bash
cd d:\project-next\crm\my-visionary-shop\my-visionary-shop
npm run dev
```

**URL**: http://localhost:3000

| หน้า            | URL                                   |
| --------------- | ------------------------------------- |
| Homepage        | http://localhost:3000                 |
| Admin Dashboard | http://localhost:3000/admin           |
| Admin Inbox     | http://localhost:3000/admin/inbox     |
| Admin Customers | http://localhost:3000/admin/customers |
| Admin Orders    | http://localhost:3000/admin/orders    |

---

## 🖥️ Terminal 2: n8n (Automation)

```bash
docker run -it --rm --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```

**URL**: http://localhost:5678

> ⚠️ Workflow ควรถูก save ไว้แล้ว แค่เปิด Activate ให้เป็น ON

---

## 🖥️ Terminal 3: ngrok (Tunnel)

```bash
ngrok http 5678 ,ngrok http 3000
```

**จดค่า URL ที่ได้** เช่น: `https://xxx.ngrok-free.app`

---

## 🔄 หลัง ngrok รัน - Update LINE Webhook

> ⚠️ **ต้องทำทุกครั้ง** เพราะ ngrok URL เปลี่ยน

1. ไป **LINE Developers Console** → Channel ของคุณ
2. Tab **Messaging API** → **Webhook settings**
3. เปลี่ยน **Webhook URL** เป็น:
   ```
   https://NEW-NGROK-URL.ngrok-free.app/webhook/line
   ```
4. กด **Update** → **Verify** → ต้องขึ้น ✅ Success
5. เช็คว่า **Use webhook** = ON

---

## ✅ ทดสอบ

| ทดสอบ    | วิธี                             | ผลที่ควรได้                              |
| -------- | -------------------------------- | ---------------------------------------- |
| เว็บโหลด | เปิด http://localhost:3000       | เห็นหน้าแรก                              |
| Admin    | เปิด http://localhost:3000/admin | เห็น Dashboard                           |
| LINE Bot | ส่งข้อความหา LINE OA             | ได้รับตอบกลับ "ได้รับข้อความแล้วครับ 🙏" |

---

## 🎤 Demo Flow สำหรับ Presentation

### 1. แสดงหน้าเว็บ (2 นาที)

- Homepage → Products → Add to Cart → Checkout

### 2. แสดง Admin Panel (3 นาที)

- Dashboard → Orders → Customers → Customer Detail (360° view)

### 3. แสดง LINE Integration (2 นาที)

- เปิด n8n → แสดง Workflow
- ส่งข้อความ LINE → Bot ตอบกลับ
- (Optional) แสดง Admin Inbox

---

## 🛠️ Troubleshooting

| ปัญหา            | วิธีแก้                                                 |
| ---------------- | ------------------------------------------------------- |
| Port 3000 ถูกใช้ | `npx kill-port 3000`                                    |
| n8n crash        | Restart Docker container                                |
| ngrok error      | เช็ค authtoken: `ngrok config add-authtoken YOUR_TOKEN` |
| LINE verify fail | เช็คว่า n8n + ngrok รันอยู่, workflow Active            |

---

## 📁 Files สำคัญ

| File                 | Purpose                |
| -------------------- | ---------------------- |
| `schema_phase2.sql`  | CRM database schema    |
| `schema_phase3.sql`  | Chat database schema   |
| `docs/LINE_SETUP.md` | LINE integration guide |
| `.env.local`         | Environment variables  |

---

## 🔑 Credentials ที่ต้องใช้

| Service          | Where to find           |
| ---------------- | ----------------------- |
| Supabase URL/Key | `.env.local`            |
| LINE Token       | LINE Developers Console |
| ngrok Token      | ngrok Dashboard         |
