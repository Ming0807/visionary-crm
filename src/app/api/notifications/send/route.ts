import { NextRequest, NextResponse } from "next/server";
import { sendEmail, sendNotification } from "@/lib/email";
import { supabase } from "@/lib/supabase";

// POST - Send notification to customer
export async function POST(request: NextRequest) {
    try {
        const { customerId, type, data } = await request.json();

        if (!customerId || !type) {
            return NextResponse.json(
                { error: "Missing customerId or type" },
                { status: 400 }
            );
        }

        // Fetch customer with social identities
        const { data: customer, error } = await supabase
            .from("customers")
            .select(`
                id,
                name,
                email,
                social_identities(
                    platform,
                    social_user_id
                )
            `)
            .eq("id", customerId)
            .single();

        if (error || !customer) {
            return NextResponse.json(
                { error: "Customer not found" },
                { status: 404 }
            );
        }

        // Get LINE user ID if exists
        const lineIdentity = customer.social_identities?.find(
            (si: any) => si.platform === "line"
        );
        const lineUserId = lineIdentity?.social_user_id;

        // Send notification
        const results = await sendNotification(
            { id: customer.id, email: customer.email, name: customer.name },
            type,
            data,
            lineUserId
        );

        // Log notification (table might not exist yet)
        try {
            await supabase.from("notification_logs").insert({
                customer_id: customerId,
                type,
                channel: results.line ? "line" : results.email ? "email" : "none",
                success: results.line || results.email,
                data,
            });
        } catch {
            // Table might not exist yet, ignore
        }

        return NextResponse.json({
            success: true,
            sent: {
                line: results.line,
                email: results.email,
            },
        });
    } catch (error) {
        console.error("Notification error:", error);
        return NextResponse.json(
            { error: "Failed to send notification" },
            { status: 500 }
        );
    }
}

// GET - Test email (for development)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const testEmail = searchParams.get("email");
    const type = searchParams.get("type") || "welcome";

    if (!testEmail) {
        return NextResponse.json(
            { error: "Provide ?email=your@email.com&type=welcome" },
            { status: 400 }
        );
    }

    const testData = {
        name: "ทดสอบ",
        orderNumber: "TEST-001",
        orderId: "123",
        totalAmount: 2500,
        customerName: "คุณทดสอบ",
        status: "กำลังจัดส่ง",
        claimId: "abc12345-test",
        discountCode: "BIRTHDAY20",
        discountPercent: 20,
        title: "โปรโมชั่นทดสอบ",
        message: "รับส่วนลดพิเศษ!",
        couponCode: "TESTCODE",
    };

    const result = await sendEmail({
        to: testEmail,
        type: type as any,
        data: testData,
    });

    return NextResponse.json(result);
}
