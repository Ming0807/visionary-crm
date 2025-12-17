import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST - Send message to specific customers
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { customerIds, message, campaignId } = body;

        if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
            return NextResponse.json(
                { error: "Missing or invalid customerIds array" },
                { status: 400 }
            );
        }

        if (!message) {
            return NextResponse.json(
                { error: "Missing message" },
                { status: 400 }
            );
        }

        // Get LINE credentials
        const lineChannelToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
        if (!lineChannelToken) {
            return NextResponse.json(
                { error: "LINE credentials not configured" },
                { status: 500 }
            );
        }

        // Get customers with LINE IDs
        const { data: customers, error } = await supabase
            .from("customers")
            .select(`
                id, name, points,
                social_identities(social_user_id, platform)
            `)
            .in("id", customerIds);

        if (error) {
            console.error("Customer query error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        let sentCount = 0;
        const results: Array<{ customerId: string; name: string; status: string; error?: string }> = [];

        for (const customer of customers || []) {
            const lineUserId = customer.social_identities?.find(
                (s: { platform: string }) => s.platform === "line"
            )?.social_user_id;

            if (!lineUserId) {
                results.push({
                    customerId: customer.id,
                    name: customer.name || "Unknown",
                    status: "skipped",
                    error: "No LINE ID"
                });
                continue;
            }

            // Replace template variables
            const personalizedMessage = message
                .replace(/\{\{name\}\}/g, customer.name || "ลูกค้า")
                .replace(/\{\{points\}\}/g, customer.points?.toString() || "0");

            try {
                const lineResponse = await fetch("https://api.line.me/v2/bot/message/push", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${lineChannelToken}`,
                    },
                    body: JSON.stringify({
                        to: lineUserId,
                        messages: [{ type: "text", text: personalizedMessage }],
                    }),
                });

                if (lineResponse.ok) {
                    sentCount++;
                    results.push({
                        customerId: customer.id,
                        name: customer.name || "Unknown",
                        status: "sent"
                    });

                    // Log the message
                    await supabase.from("campaign_logs").insert({
                        campaign_id: campaignId || null,
                        customer_id: customer.id,
                        status: "sent",
                        message_content: personalizedMessage,
                    });
                } else {
                    const errorText = await lineResponse.text();
                    results.push({
                        customerId: customer.id,
                        name: customer.name || "Unknown",
                        status: "failed",
                        error: errorText
                    });
                }
            } catch (err) {
                results.push({
                    customerId: customer.id,
                    name: customer.name || "Unknown",
                    status: "failed",
                    error: String(err)
                });
            }
        }

        return NextResponse.json({
            success: true,
            sent: sentCount,
            total: customerIds.length,
            results,
        });
    } catch (error) {
        console.error("Send message error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
