import nodemailer from "nodemailer";

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

// Default sender
const DEFAULT_FROM = `The Visionary <${process.env.GMAIL_USER}>`;

// Email template types
type EmailType =
    | "order_confirmation"
    | "order_status_update"
    | "claim_status_update"
    | "welcome"
    | "birthday"
    | "promotion";

interface SendEmailOptions {
    to: string;
    type: EmailType;
    data: Record<string, any>;
}

// Email templates
const templates: Record<EmailType, (data: any) => { subject: string; html: string }> = {
    welcome: (data) => ({
        subject: "🎉 ยินดีต้อนรับสู่ The Visionary!",
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; padding: 20px 0;">
                    <h1 style="color: #f97316; margin: 0;">The Visionary</h1>
                    <p style="color: #666;">Premium Eyewear</p>
                </div>
                <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 12px; text-align: center;">
                    <h2 style="margin: 0 0 10px 0;">ยินดีต้อนรับ ${data.name}! 🎉</h2>
                    <p style="margin: 0; opacity: 0.9;">ขอบคุณที่สมัครสมาชิกกับเรา</p>
                </div>
                <div style="padding: 30px 0; text-align: center;">
                    <p style="color: #333; font-size: 16px;">คุณพร้อมรับสิทธิพิเศษมากมาย:</p>
                    <ul style="list-style: none; padding: 0; color: #666;">
                        <li style="padding: 8px 0;">✨ สะสมแต้มทุกการสั่งซื้อ</li>
                        <li style="padding: 8px 0;">🎁 รับส่วนลดวันเกิด</li>
                        <li style="padding: 8px 0;">📦 ติดตามสถานะสินค้าได้ตลอด</li>
                    </ul>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products" 
                       style="display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">
                        เริ่มช้อปเลย
                    </a>
                </div>
                <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 12px;">
                    <p>© The Visionary - Premium Eyewear</p>
                </div>
            </div>
        `,
    }),

    order_confirmation: (data) => ({
        subject: `✅ ยืนยันคำสั่งซื้อ #${data.orderNumber}`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; padding: 20px 0;">
                    <h1 style="color: #f97316; margin: 0;">The Visionary</h1>
                </div>
                <div style="background: #10b981; color: white; padding: 25px; border-radius: 12px; text-align: center;">
                    <h2 style="margin: 0;">✅ คำสั่งซื้อได้รับแล้ว!</h2>
                </div>
                <div style="padding: 25px 0;">
                    <p style="color: #333; font-size: 16px;">สวัสดีคุณ ${data.customerName},</p>
                    <p style="color: #666;">ขอบคุณสำหรับคำสั่งซื้อ! เราได้รับคำสั่งซื้อของคุณเรียบร้อยแล้ว</p>
                    
                    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0;"><strong>เลขที่คำสั่งซื้อ:</strong> #${data.orderNumber}</p>
                        <p style="margin: 0 0 10px 0;"><strong>ยอดรวม:</strong> ฿${data.totalAmount?.toLocaleString()}</p>
                        <p style="margin: 0;"><strong>สถานะ:</strong> รอการชำระเงิน</p>
                    </div>
                    
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account/orders/${data.orderId}" 
                       style="display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        ดูรายละเอียดคำสั่งซื้อ
                    </a>
                </div>
            </div>
        `,
    }),

    order_status_update: (data) => ({
        subject: `📦 อัพเดทสถานะ: คำสั่งซื้อ #${data.orderNumber}`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; padding: 20px 0;">
                    <h1 style="color: #f97316; margin: 0;">The Visionary</h1>
                </div>
                <div style="background: #3b82f6; color: white; padding: 25px; border-radius: 12px; text-align: center;">
                    <h2 style="margin: 0;">📦 อัพเดทสถานะคำสั่งซื้อ</h2>
                </div>
                <div style="padding: 25px 0;">
                    <p style="color: #333; font-size: 16px;">สวัสดีคุณ ${data.customerName},</p>
                    
                    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0;"><strong>เลขที่คำสั่งซื้อ:</strong> #${data.orderNumber}</p>
                        <p style="margin: 0 0 10px 0;"><strong>สถานะใหม่:</strong> 
                            <span style="background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px;">
                                ${data.status}
                            </span>
                        </p>
                        ${data.trackingNumber ? `<p style="margin: 0;"><strong>เลข Tracking:</strong> ${data.trackingNumber}</p>` : ''}
                    </div>
                    
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account/orders/${data.orderId}" 
                       style="display: inline-block; background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        ดูรายละเอียด
                    </a>
                </div>
            </div>
        `,
    }),

    claim_status_update: (data) => ({
        subject: `📋 อัพเดทสถานะการเคลม #${data.claimId?.slice(0, 8) || ''}`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; padding: 20px 0;">
                    <h1 style="color: #f97316; margin: 0;">The Visionary</h1>
                </div>
                <div style="background: #8b5cf6; color: white; padding: 25px; border-radius: 12px; text-align: center;">
                    <h2 style="margin: 0;">📋 อัพเดทสถานะการเคลม</h2>
                </div>
                <div style="padding: 25px 0;">
                    <p style="color: #333; font-size: 16px;">สวัสดีคุณ ${data.customerName},</p>
                    <p style="color: #666;">เราได้อัพเดทสถานะการเคลมของคุณแล้ว</p>
                    
                    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0;"><strong>หมายเลขเคลม:</strong> #${data.claimId?.slice(0, 8) || ''}</p>
                        <p style="margin: 0 0 10px 0;"><strong>สถานะใหม่:</strong> 
                            <span style="background: #ede9fe; color: #6d28d9; padding: 4px 12px; border-radius: 20px;">
                                ${data.status}
                            </span>
                        </p>
                        ${data.notes ? `<p style="margin: 0;"><strong>หมายเหตุ:</strong> ${data.notes}</p>` : ''}
                    </div>
                </div>
            </div>
        `,
    }),

    birthday: (data) => ({
        subject: `🎂 สุขสันต์วันเกิด ${data.name}! รับส่วนลดพิเศษ`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; padding: 20px 0;">
                    <h1 style="color: #f97316; margin: 0;">The Visionary</h1>
                </div>
                <div style="background: linear-gradient(135deg, #ec4899 0%, #f97316 100%); color: white; padding: 40px; border-radius: 12px; text-align: center;">
                    <h1 style="margin: 0; font-size: 48px;">🎂</h1>
                    <h2 style="margin: 10px 0;">สุขสันต์วันเกิด!</h2>
                    <p style="margin: 0; font-size: 18px;">${data.name}</p>
                </div>
                <div style="padding: 30px 0; text-align: center;">
                    <p style="color: #333; font-size: 16px;">เราขอมอบของขวัญพิเศษให้คุณ:</p>
                    <div style="background: #fef3c7; border: 2px dashed #f59e0b; padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 24px; font-weight: bold; color: #d97706;">
                            ${data.discountCode || 'BIRTHDAY10'}
                        </p>
                        <p style="margin: 5px 0 0 0; color: #92400e;">ส่วนลด ${data.discountPercent || 10}%</p>
                    </div>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products" 
                       style="display: inline-block; background: #f97316; color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        ใช้ส่วนลดเลย!
                    </a>
                </div>
            </div>
        `,
    }),

    promotion: (data) => ({
        subject: `🔥 ${data.title || 'โปรโมชั่นพิเศษ!'}`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #faf9f7;">
                <div style="text-align: center; padding: 20px 0;">
                    <h1 style="color: #c2410c; margin: 0; font-size: 28px;">The Visionary</h1>
                    <p style="color: #92400e; margin: 5px 0 0 0; font-size: 14px;">Premium Eyewear</p>
                </div>
                <div style="background: linear-gradient(135deg, #c2410c 0%, #ea580c 100%); color: white; padding: 40px; border-radius: 16px; text-align: center; box-shadow: 0 4px 20px rgba(194, 65, 12, 0.2);">
                    <h2 style="margin: 0; font-size: 24px;">${data.title || 'โปรโมชั่นพิเศษ!'}</h2>
                </div>
                <div style="background: white; padding: 30px; border-radius: 16px; margin-top: -20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    <p style="color: #333; font-size: 16px; line-height: 1.6; white-space: pre-line;">${data.message || ''}</p>
                    
                    ${data.couponCode ? `
                        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px dashed #f59e0b; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center;">
                            <p style="margin: 0 0 5px 0; font-size: 12px; color: #92400e; text-transform: uppercase; letter-spacing: 1px;">รหัสส่วนลด</p>
                            <p style="margin: 0; font-size: 28px; font-weight: bold; color: #c2410c; letter-spacing: 2px;">
                                ${data.couponCode}
                            </p>
                        </div>
                    ` : ''}
                    
                    <div style="text-align: center; margin-top: 25px;">
                        <a href="${data.linkUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/products" 
                           style="display: inline-block; background: linear-gradient(135deg, #c2410c 0%, #ea580c 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(194, 65, 12, 0.3);">
                            ${data.linkText || 'ดูสินค้า'} →
                        </a>
                    </div>
                </div>
                <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                    <p style="margin: 0;">© The Visionary - Premium Eyewear</p>
                    <p style="margin: 5px 0 0 0;">คุณได้รับอีเมลนี้เพราะเป็นสมาชิกของเรา</p>
                </div>
            </div>
        `,
    }),
};

// Send email function using Gmail SMTP
export async function sendEmail({ to, type, data }: SendEmailOptions): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            console.warn("Gmail credentials not configured, skipping email");
            return { success: false, error: "Email not configured" };
        }

        const template = templates[type](data);

        const result = await transporter.sendMail({
            from: DEFAULT_FROM,
            to,
            subject: template.subject,
            html: template.html,
        });

        console.log(`Email sent to ${to}:`, result.messageId);
        return { success: true, data: { messageId: result.messageId } };
    } catch (error) {
        console.error("Send email error:", error);
        return { success: false, error: String(error) };
    }
}

// Helper to send notification (LINE or Email)
export async function sendNotification(
    customer: { id: string; email?: string | null; name?: string | null },
    type: EmailType,
    data: Record<string, any>,
    lineUserId?: string
) {
    const results = {
        line: false,
        email: false,
    };

    // Try LINE first if available
    if (lineUserId) {
        // TODO: Integrate with LINE push message
        console.log(`Would send LINE to ${lineUserId}`);
        results.line = true;
    }

    // Send email if available
    if (customer.email) {
        const emailResult = await sendEmail({
            to: customer.email,
            type,
            data: { ...data, name: customer.name || "ลูกค้า" },
        });
        results.email = emailResult.success;
    }

    return results;
}
