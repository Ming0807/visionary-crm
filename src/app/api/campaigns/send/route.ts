import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

// POST - Send message to specific customers (LINE or Email)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { customerIds, message, campaignId, emailSubject } = body;

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

        // Get customers with LINE IDs and emails
        const { data: customers, error } = await supabase
            .from("customers")
            .select(`
                id, name, email, points,
                social_identities(social_user_id, platform)
            `)
            .in("id", customerIds);

        if (error) {
            console.error("Customer query error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        let sentCount = 0;
        let emailCount = 0;
        let lineCount = 0;
        const results: Array<{ customerId: string; name: string; status: string; channel: string; error?: string }> = [];

        for (const customer of customers || []) {
            const lineUserId = customer.social_identities?.find(
                (s: { platform: string }) => s.platform === "line"
            )?.social_user_id;

            // Replace template variables
            const personalizedMessage = message
                .replace(/\{\{name\}\}/g, customer.name || "ลูกค้า")
                .replace(/\{\{points\}\}/g, customer.points?.toString() || "0");

            // Try LINE first
            if (lineUserId && lineChannelToken) {
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
                        lineCount++;
                        results.push({
                            customerId: customer.id,
                            name: customer.name || "Unknown",
                            status: "sent",
                            channel: "line"
                        });

                        // Log the message
                        await supabase.from("campaign_logs").insert({
                            campaign_id: campaignId || null,
                            customer_id: customer.id,
                            status: "sent",
                            message_content: personalizedMessage,
                        });
                        continue;
                    }
                } catch (err) {
                    console.error("LINE send error:", err);
                }
            }

            // Fallback to Email
            if (customer.email) {
                try {
                    const emailResult = await sendEmail({
                        to: customer.email,
                        type: "promotion",
                        data: {
                            name: customer.name || "ลูกค้า",
                            title: emailSubject || "🎉 ข้อเสนอพิเศษจาก The Visionary",
                            message: personalizedMessage,
                        },
                    });

                    if (emailResult.success) {
                        sentCount++;
                        emailCount++;
                        results.push({
                            customerId: customer.id,
                            name: customer.name || "Unknown",
                            status: "sent",
                            channel: "email"
                        });

                        // Log the message
                        await supabase.from("campaign_logs").insert({
                            campaign_id: campaignId || null,
                            customer_id: customer.id,
                            status: "sent",
                            message_content: `[EMAIL] ${personalizedMessage}`,
                        });
                        continue;
                    }
                } catch (err) {
                    console.error("Email send error:", err);
                }
            }

            // No channel available
            results.push({
                customerId: customer.id,
                name: customer.name || "Unknown",
                status: "skipped",
                channel: "none",
                error: "No LINE or Email available"
            });
        }

        return NextResponse.json({
            success: true,
            sent: sentCount,
            total: customerIds.length,
            channels: {
                line: lineCount,
                email: emailCount,
            },
            results,
        });
    } catch (error) {
        console.error("Send message error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
