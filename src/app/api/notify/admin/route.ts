import { NextRequest, NextResponse } from "next/server";

// POST - Send notification to admin LINE when new order
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            orderNumber,
            customerName,
            totalAmount,
            itemCount,
            orderId
        } = body;

        const lineChannelToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
        const adminLineId = process.env.ADMIN_LINE_USER_ID; // Admin's LINE User ID

        if (!lineChannelToken) {
            return NextResponse.json({ error: "LINE not configured" }, { status: 500 });
        }

        if (!adminLineId) {
            console.log("ADMIN_LINE_USER_ID not set, skipping notification");
            return NextResponse.json({
                success: true,
                message: "No admin LINE ID configured"
            });
        }

        // Format price
        const formattedTotal = new Intl.NumberFormat("th-TH", {
            style: "currency",
            currency: "THB",
            minimumFractionDigits: 0,
        }).format(totalAmount);

        // Create notification message
        const message = `🛒 New Order!\n\n` +
            `📦 Order: #${orderNumber}\n` +
            `👤 Customer: ${customerName || "Guest"}\n` +
            `💰 Total: ${formattedTotal}\n` +
            `📝 Items: ${itemCount}\n\n` +
            `View at: /admin/orders/${orderId}`;

        // Send to admin
        const response = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${lineChannelToken}`,
            },
            body: JSON.stringify({
                to: adminLineId,
                messages: [{ type: "text", text: message }],
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("LINE notification error:", error);
            return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Notification sent" });
    } catch (error) {
        console.error("Notify admin error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
