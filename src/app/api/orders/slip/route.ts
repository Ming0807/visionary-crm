import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST - Save slip to order and notify admin
export async function POST(request: NextRequest) {
    try {
        const { orderNumber, slipUrl } = await request.json();

        if (!orderNumber || !slipUrl) {
            return NextResponse.json(
                { error: "Missing orderNumber or slipUrl" },
                { status: 400 }
            );
        }

        // Update order with slip
        const { data: order, error } = await supabase
            .from("orders")
            .update({
                slip_image_url: slipUrl,
                payment_status: "verifying",
            })
            .eq("order_number", orderNumber)
            .select("id, order_number, total_amount, customer_id")
            .single();

        if (error) throw error;

        // Notify admin via LINE
        const adminUserId = process.env.ADMIN_LINE_USER_ID;
        if (adminUserId) {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

            await fetch("https://api.line.me/v2/bot/message/push", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
                },
                body: JSON.stringify({
                    to: adminUserId,
                    messages: [
                        {
                            type: "flex",
                            altText: `💰 มีสลิปใหม่! ${orderNumber}`,
                            contents: {
                                type: "bubble",
                                hero: {
                                    type: "image",
                                    url: slipUrl,
                                    size: "full",
                                    aspectRatio: "3:4",
                                    aspectMode: "cover",
                                },
                                body: {
                                    type: "box",
                                    layout: "vertical",
                                    contents: [
                                        {
                                            type: "text",
                                            text: "💰 สลิปใหม่!",
                                            weight: "bold",
                                            size: "xl",
                                        },
                                        {
                                            type: "text",
                                            text: `Order: ${orderNumber}`,
                                            size: "sm",
                                            color: "#999999",
                                        },
                                        {
                                            type: "text",
                                            text: `฿${order.total_amount.toLocaleString()}`,
                                            size: "lg",
                                            weight: "bold",
                                            color: "#00B900",
                                            margin: "md",
                                        },
                                    ],
                                },
                                footer: {
                                    type: "box",
                                    layout: "horizontal",
                                    spacing: "sm",
                                    contents: [
                                        {
                                            type: "button",
                                            style: "primary",
                                            color: "#00B900",
                                            action: {
                                                type: "uri",
                                                label: "✅ Approve",
                                                uri: `${baseUrl}/api/orders/verify?order=${orderNumber}&action=approve`,
                                            },
                                        },
                                        {
                                            type: "button",
                                            style: "secondary",
                                            action: {
                                                type: "uri",
                                                label: "❌ Reject",
                                                uri: `${baseUrl}/api/orders/verify?order=${orderNumber}&action=reject`,
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                }),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Slip upload error:", error);
        return NextResponse.json({ error: "Failed to save slip" }, { status: 500 });
    }
}
