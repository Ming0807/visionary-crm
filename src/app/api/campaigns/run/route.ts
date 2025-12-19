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
            // Normal mode: use direct queries instead of RPC (fix for type mismatch)
            if (type === "birthday") {
                // Get today's birthday customers (by day and month)
                const today = new Date();
                const month = today.getMonth() + 1; // JS months are 0-indexed
                const day = today.getDate();

                const { data: birthdayCustomers, error } = await supabase
                    .from("customers")
                    .select(`
                        id, name, phone, birthday, points,
                        social_identities(social_user_id, platform)
                    `)
                    .not("birthday", "is", null);

                if (error) console.error("Birthday query error:", error);

                // Filter by birthday matching today
                const filtered = (birthdayCustomers || []).filter(c => {
                    if (!c.birthday) return false;
                    const bday = new Date(c.birthday);
                    return bday.getMonth() + 1 === month && bday.getDate() === day;
                });

                targetCustomers = filtered.map(c => ({
                    id: c.id,
                    name: c.name,
                    points: c.points,
                    line_user_id: c.social_identities?.find((s: { platform: string }) => s.platform === "line")?.social_user_id
                }));

                console.log(`Birthday check: Found ${targetCustomers.length} customers born on ${day}/${month}`);
            } else if (type === "re_engagement") {
                // Get inactive customers (no order in last 30 days)
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const { data: inactiveCustomers, error } = await supabase
                    .from("customers")
                    .select(`
                        id, name, phone, points, last_order_at,
                        social_identities(social_user_id, platform)
                    `)
                    .or(`last_order_at.is.null,last_order_at.lt.${thirtyDaysAgo.toISOString()}`);

                if (error) console.error("Re-engagement query error:", error);

                targetCustomers = (inactiveCustomers || []).map(c => ({
                    id: c.id,
                    name: c.name,
                    points: c.points,
                    line_user_id: c.social_identities?.find((s: { platform: string }) => s.platform === "line")?.social_user_id
                }));

                console.log(`Re-engagement: Found ${targetCustomers.length} inactive customers`);
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
                ? "🎂 สุขสันต์วันเกิด คุณ{{name}}!\n\nThe Visionary ขอส่งความสุขและความปรารถนาดีมายังคุณในวันพิเศษนี้ 🎉\n\nเพื่อเป็นของขวัญ รับส่วนลดพิเศษ 10% สำหรับการสั่งซื้อครั้งถัดไป ภายใน 7 วัน\n\n🎁 ใช้โค้ด: BDAY10\n\nขอบคุณที่ไว้วางใจเลือกใช้บริการกับเราครับ"
                : "สวัสดีครับ คุณ{{name}} 👋\n\nThe Visionary คิดถึงคุณครับ!\n\nเราได้เตรียมแว่นตาคอลเลกชันใหม่ๆ ไว้รอต้อนรับคุณแล้ว พร้อมโปรโมชั่นพิเศษสำหรับลูกค้าคนสำคัญเช่นคุณ\n\n💎 แต้มสะสมปัจจุบัน: {{points}} คะแนน\n\nแวะมาเยี่ยมชมได้ทุกเมื่อนะครับ");

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
            // Get current campaign stats first
            const { data: currentCampaign } = await supabase
                .from("campaigns")
                .select("total_sent")
                .eq("id", campaignId)
                .single();

            const currentSent = currentCampaign?.total_sent || 0;

            await supabase
                .from("campaigns")
                .update({
                    last_run_at: new Date().toISOString(),
                    total_sent: currentSent + sentCount,
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
