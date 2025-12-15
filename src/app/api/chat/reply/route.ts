import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const LINE_API_URL = "https://api.line.me/v2/bot";

export async function POST(request: NextRequest) {
    try {
        const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

        if (!accessToken) {
            return NextResponse.json({ error: "LINE not configured" }, { status: 500 });
        }

        const body = await request.json();
        const { customerId, message } = body;

        if (!customerId || !message) {
            return NextResponse.json({ error: "Missing customerId or message" }, { status: 400 });
        }

        // Get LINE user ID from social_identities
        const { data: socialIdentity, error: socialError } = await supabase
            .from("social_identities")
            .select("social_user_id")
            .eq("customer_id", customerId)
            .eq("platform", "line")
            .single();

        if (socialError || !socialIdentity) {
            console.error("Social identity not found:", socialError);
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        const lineUserId = socialIdentity.social_user_id;

        // Send message via LINE Push API
        const lineResponse = await fetch(`${LINE_API_URL}/message/push`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                to: lineUserId,
                messages: [{ type: "text", text: message }],
            }),
        });

        if (!lineResponse.ok) {
            const errorText = await lineResponse.text();
            console.error("LINE Push API error:", errorText);
            return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
        }

        // Save outbound message to chat_logs
        await supabase.from("chat_logs").insert({
            customer_id: customerId,
            platform: "line",
            direction: "outbound",
            message_type: "text",
            content: message,
            is_read: true,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Reply error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
