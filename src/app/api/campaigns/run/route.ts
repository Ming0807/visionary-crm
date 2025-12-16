import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST - Run a campaign manually or via cron
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { campaignId, campaignType, testMode = false } = body;

        let targetCustomers: any[] = [];

        // Get campaign details if campaignId provided
        let campaign: any = null;
        if (campaignId) {
            const { data } = await supabase
                .from("campaigns")
                .select("*")
                .eq("id", campaignId)
                .single();
            campaign = data;
        }

        const type = campaign?.campaign_type || campaignType;

        // Test mode: send to ALL customers with LINE ID
        if (testMode) {
            const { data: allCustomers } = await supabase
                .from("customers")
                .select(`
                    id, name, points,
                    social_identities!inner(social_user_id, platform)
                `)
                .eq("social_identities.platform", "line");

            targetCustomers = (allCustomers || []).map(c => ({
                id: c.id,
                name: c.name,
                points: c.points,
                line_user_id: c.social_identities?.[0]?.social_user_id
            }));
        } else {
            // Normal mode: use SQL functions
            if (type === "birthday") {
                const { data, error } = await supabase.rpc("get_birthday_customers_today");
                if (error) console.error("Birthday RPC error:", error);
                targetCustomers = data || [];
            } else if (type === "re_engagement") {
                const { data, error } = await supabase.rpc("get_inactive_customers", {
                    days_inactive: 30,
                });
                if (error) console.error("Re-engagement RPC error:", error);
                targetCustomers = data || [];
            } else {
                // Fallback: get all LINE customers for other types
                const { data: allCustomers } = await supabase
                    .from("customers")
                    .select(`
                        id, name, points,
                        social_identities!inner(social_user_id, platform)
                    `)
                    .eq("social_identities.platform", "line");

                targetCustomers = (allCustomers || []).map(c => ({
                    id: c.id,
                    name: c.name,
                    points: c.points,
                    line_user_id: c.social_identities?.[0]?.social_user_id
                }));
            }
        }

        console.log("Target customers:", targetCustomers.length);

        if (targetCustomers.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No customers to target (check if customers have LINE ID linked)",
                sent: 0,
            });
        }

        // Get LINE credentials
        const lineChannelToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
        if (!lineChannelToken) {
            return NextResponse.json(
                { error: "LINE credentials not configured" },
                { status: 500 }
            );
        }

        const messageTemplate = campaign?.message_template ||
            (type === "birthday"
                ? "สุขสันต์วันเกิดครับ/ค่ะ 🎂🎉"
                : "สวัสดีครับ/ค่ะ เราคิดถึงคุณ! 💙");

        let sentCount = 0;
        const logs: any[] = [];

        for (const customer of targetCustomers) {
            if (!customer.line_user_id) continue;

            // Replace template variables
            const personalizedMessage = messageTemplate
                .replace(/\{\{name\}\}/g, customer.name || "ลูกค้า")
                .replace(/\{\{points\}\}/g, customer.points?.toString() || "0");

            try {
                // DEBUG: Log the USER ID being sent
                console.log("=== CAMPAIGN SENDING TO ===");
                console.log("Customer:", customer.name);
                console.log("LINE User ID:", customer.line_user_id);
                console.log("Message preview:", personalizedMessage.slice(0, 50));

                // Send LINE message
                const lineResponse = await fetch("https://api.line.me/v2/bot/message/push", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${lineChannelToken}`,
                    },
                    body: JSON.stringify({
                        to: customer.line_user_id,
                        messages: [{ type: "text", text: personalizedMessage }],
                    }),
                });

                console.log("LINE response status:", lineResponse.status);

                const status = lineResponse.ok ? "sent" : "failed";

                logs.push({
                    campaign_id: campaignId || null,
                    customer_id: customer.id,
                    status,
                    message_content: personalizedMessage,
                    error_message: lineResponse.ok ? null : "LINE API error",
                });

                if (lineResponse.ok) sentCount++;
            } catch (error) {
                logs.push({
                    campaign_id: campaignId || null,
                    customer_id: customer.id,
                    status: "failed",
                    message_content: personalizedMessage,
                    error_message: String(error),
                });
            }
        }

        // Insert logs
        if (logs.length > 0) {
            await supabase.from("campaign_logs").insert(logs);
        }

        // Update campaign stats
        if (campaignId) {
            await supabase
                .from("campaigns")
                .update({
                    last_run_at: new Date().toISOString(),
                    total_sent: supabase.rpc("increment", { x: sentCount }),
                })
                .eq("id", campaignId);
        }

        return NextResponse.json({
            success: true,
            message: `Campaign sent to ${sentCount} customers`,
            sent: sentCount,
            total: targetCustomers.length,
        });
    } catch (error) {
        console.error("Campaign run error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
