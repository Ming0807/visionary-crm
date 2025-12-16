import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// PATCH - Update order status and notify customer
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            orderId,
            paymentStatus,
            fulfillmentStatus,
            trackingNumber,
            carrier,
            notifyCustomer = true
        } = body;

        if (!orderId) {
            return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
        }

        // Update order
        const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (paymentStatus) updateData.payment_status = paymentStatus;
        if (fulfillmentStatus) updateData.fulfillment_status = fulfillmentStatus;
        if (trackingNumber !== undefined) updateData.tracking_number = trackingNumber;
        if (carrier !== undefined) updateData.shipping_carrier = carrier;

        const { data: order, error } = await supabase
            .from("orders")
            .update(updateData)
            .eq("id", orderId)
            .select(`
                id, order_number, total_amount, fulfillment_status, tracking_number, shipping_carrier,
                customer:customers(id, name, social_identities(social_user_id, platform))
            `)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Notify customer via LINE if requested
        if (notifyCustomer && order?.customer) {
            const customerData = Array.isArray(order.customer) ? order.customer[0] : order.customer;
            const lineUserId = customerData?.social_identities?.find(
                (s: { platform: string }) => s.platform === "line"
            )?.social_user_id;

            if (lineUserId) {
                const lineChannelToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
                if (lineChannelToken) {
                    let message = "";

                    if (fulfillmentStatus === "shipped" && trackingNumber) {
                        message = `📦 คำสั่งซื้อ #${order.order_number} ของคุณถูกจัดส่งแล้ว!\n\n` +
                            `🚚 ขนส่ง: ${carrier || "Express"}\n` +
                            `📋 หมายเลขพัสดุ: ${trackingNumber}\n\n` +
                            `ติดตามพัสดุได้ที่เว็บไซต์ขนส่งครับ`;
                    } else if (fulfillmentStatus === "delivered") {
                        message = `✅ คำสั่งซื้อ #${order.order_number} จัดส่งสำเร็จแล้ว!\n\n` +
                            `ขอบคุณที่ใช้บริการครับ 🙏`;
                    } else if (paymentStatus === "paid") {
                        message = `💚 ได้รับการชำระเงินคำสั่งซื้อ #${order.order_number} เรียบร้อยแล้ว!\n\n` +
                            `กำลังเตรียมจัดส่งครับ`;
                    }

                    if (message) {
                        await fetch("https://api.line.me/v2/bot/message/push", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${lineChannelToken}`,
                            },
                            body: JSON.stringify({
                                to: lineUserId,
                                messages: [{ type: "text", text: message }],
                            }),
                        });
                    }
                }
            }
        }

        return NextResponse.json({ success: true, order });
    } catch (error) {
        console.error("Update order error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
