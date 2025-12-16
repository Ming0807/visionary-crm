import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Verify payment (called from LINE message buttons)
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const orderNumber = searchParams.get("order");
    const action = searchParams.get("action"); // approve | reject

    if (!orderNumber || !action) {
        return new NextResponse(
            `<html><body><h1>Missing parameters</h1></body></html>`,
            { headers: { "Content-Type": "text/html" } }
        );
    }

    try {
        const paymentStatus = action === "approve" ? "paid" : "failed";

        // Update order
        const { data: order, error } = await supabase
            .from("orders")
            .update({ payment_status: paymentStatus })
            .eq("order_number", orderNumber)
            .select(`
                id, 
                order_number, 
                payment_status,
                customer_id,
                customers!inner(
                    name,
                    social_identities(social_user_id, platform)
                )
            `)
            .single();

        if (error) throw error;

        // Notify customer via LINE
        const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
        const lineIdentity = customer?.social_identities?.find(
            (s: { platform: string }) => s.platform === "line"
        );

        if (lineIdentity?.social_user_id) {
            const message = action === "approve"
                ? `✅ ยืนยันการชำระเงินแล้ว!\n\nคำสั่งซื้อ: ${orderNumber}\n\nขอบคุณที่ใช้บริการครับ 🙏`
                : `❌ การชำระเงินไม่สำเร็จ\n\nคำสั่งซื้อ: ${orderNumber}\n\nกรุณาติดต่อเราหากมีข้อสงสัยครับ`;

            await fetch("https://api.line.me/v2/bot/message/push", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
                },
                body: JSON.stringify({
                    to: lineIdentity.social_user_id,
                    messages: [{ type: "text", text: message }],
                }),
            });
        }

        // Return success page
        const statusEmoji = action === "approve" ? "✅" : "❌";
        const statusText = action === "approve" ? "อนุมัติแล้ว" : "ปฏิเสธแล้ว";
        const statusColor = action === "approve" ? "#00B900" : "#FF0000";

        return new NextResponse(
            `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Payment Verified</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        background: #f8f9fa;
                    }
                    .card {
                        background: white;
                        padding: 40px;
                        border-radius: 16px;
                        text-align: center;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    }
                    .emoji { font-size: 64px; margin-bottom: 16px; }
                    .status { color: ${statusColor}; font-size: 24px; font-weight: bold; }
                    .order { color: #666; margin-top: 8px; }
                </style>
            </head>
            <body>
                <div class="card">
                    <div class="emoji">${statusEmoji}</div>
                    <div class="status">${statusText}</div>
                    <div class="order">Order: ${orderNumber}</div>
                    <p style="color:#999;margin-top:20px;">คุณสามารถปิดหน้านี้ได้</p>
                </div>
            </body>
            </html>`,
            { headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
    } catch (error) {
        console.error("Verify error:", error);
        return new NextResponse(
            `<html><body><h1>Error: ${error}</h1></body></html>`,
            { headers: { "Content-Type": "text/html" }, status: 500 }
        );
    }
}
