import { NextRequest, NextResponse } from "next/server";

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, message } = body;

        console.log("=== NOTIFY API ===");
        console.log("User ID:", userId);

        if (!userId || !message) {
            return NextResponse.json(
                { error: "Missing userId or message" },
                { status: 400 }
            );
        }

        if (!LINE_CHANNEL_ACCESS_TOKEN) {
            console.error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
            return NextResponse.json(
                { error: "LINE not configured" },
                { status: 500 }
            );
        }

        // Use exact same format as campaigns/run/route.ts
        const lineResponse = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
                to: userId,
                messages: [{ type: "text", text: message }],
            }),
        });

        console.log("LINE status:", lineResponse.status);

        if (!lineResponse.ok) {
            const errorText = await lineResponse.text();
            console.log("LINE error:", errorText);
            return NextResponse.json(
                { error: "LINE error", details: errorText, status: lineResponse.status },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Notify error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
