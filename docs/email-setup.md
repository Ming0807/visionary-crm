# The Visionary CRM - Email Notification Setup

## Gmail SMTP Configuration (Free & Easy!)

### Step 1: Install Dependencies

```bash
npm install nodemailer @types/nodemailer
```

### Step 2: Enable 2-Step Verification

1. Go to https://myaccount.google.com/security
2. Find "2-Step Verification" and enable it

### Step 3: Create App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select App: **Mail**
3. Select Device: **Windows Computer** (or your device)
4. Click **Generate**
5. Copy the 16-character password

### Step 4: Add to `.env.local`

```env
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

### Step 5: Test

Open in browser:

```
http://localhost:3000/api/notifications/send?email=test@example.com&type=welcome
```

---

## Email Templates Available

| Type                  | Description                         |
| --------------------- | ----------------------------------- |
| `welcome`             | Welcome email for new registrations |
| `order_confirmation`  | Order placed confirmation           |
| `order_status_update` | Order status change notification    |
| `claim_status_update` | Claim status change notification    |
| `birthday`            | Birthday wishes with discount code  |
| `promotion`           | Promotional campaigns               |

---

## Usage in Code

```typescript
import { sendEmail } from "@/lib/email";

// Send welcome email
await sendEmail({
  to: "customer@example.com",
  type: "welcome",
  data: { name: "John" },
});

// Send order status
await sendEmail({
  to: "customer@example.com",
  type: "order_status_update",
  data: {
    customerName: "John",
    orderNumber: "ORD-001",
    orderId: "uuid-here",
    status: "กำลังจัดส่ง",
    trackingNumber: "TH123456789",
  },
});
```

---

## Troubleshooting

### "Email not configured"

- Check `GMAIL_USER` and `GMAIL_APP_PASSWORD` in `.env.local`
- Restart the dev server after changing `.env.local`

### "Invalid login"

- Make sure you're using App Password, not your Gmail password
- Ensure 2-Step Verification is enabled first

### Email in spam folder

- For testing, this is normal
- For production, consider using a professional email service
