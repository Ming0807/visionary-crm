import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";

// Status labels in Thai
const STATUS_LABELS: Record<string, string> = {
    pending: "รอดำเนินการ",
    investigating: "กำลังตรวจสอบ",
    resolved: "แก้ไขแล้ว",
    rejected: "ปฏิเสธ",
};

// PATCH - Update claim status and notify customer
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { claimId, status, notes, notifyCustomer = false } = body;

        if (!claimId || !status) {
            return NextResponse.json(
                { error: "Missing claimId or status" },
                { status: 400 }
            );
        }

        // Update claim
        const { error: updateError } = await supabase
            .from("claims_returns")
            .update({
                status,
                resolution_notes: notes || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", claimId);

        if (updateError) {
            console.error("Update error:", updateError);
            return NextResponse.json(
                { error: "Failed to update claim" },
                { status: 500 }
            );
        }

        // Get claim with customer info for notification
        if (notifyCustomer) {
            const { data: claim } = await supabase
                .from("claims_returns")
                .select(`
                    id,
                    customer_id,
                    customers(id, name, email)
                `)
                .eq("id", claimId)
                .single();

            if (claim?.customers) {
                const customer = Array.isArray(claim.customers)
                    ? claim.customers[0]
                    : claim.customers;

                // Check for LINE user ID
                const { data: socialData } = await supabase
                    .from("social_identities")
                    .select("social_user_id")
                    .eq("customer_id", claim.customer_id)
                    .eq("platform", "line")
                    .single();

                const lineUserId = socialData?.social_user_id;
                const statusLabel = STATUS_LABELS[status] || status;

                // Send LINE notification
                if (lineUserId) {
                    const lineToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
                    if (lineToken) {
                        const message = [
                            "📋 อัพเดทสถานะเคลม",
                            "",
                            `หมายเลข: ${claimId.slice(0, 8)}...`,
                            `สถานะ: ${statusLabel}`,
                            notes ? `หมายเหตุ: ${notes}` : "",
                            "",
                            "ขอบคุณที่ใช้บริการครับ 🙏"
                        ].filter(Boolean).join("\n");

                        await fetch("https://api.line.me/v2/bot/message/push", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${lineToken}`,
                            },
                            body: JSON.stringify({
                                to: lineUserId,
                                messages: [{ type: "text", text: message }],
                            }),
                        });
                    }
                }
                // Send Email if no LINE
                else if (customer?.email) {
                    await sendEmail({
                        to: customer.email,
                        type: "claim_status_update",
                        data: {
                            customerName: customer.name || "ลูกค้า",
                            claimId: claimId,
                            status: statusLabel,
                            notes: notes,
                        },
                    });
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Claim update error:", error);
        return NextResponse.json(
            { error: "Internal error" },
            { status: 500 }
        );
    }
}
