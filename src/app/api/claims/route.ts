import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { orderNumber, phone, claimType, reason, description } = body;

        // Validate
        if (!orderNumber || !phone || !reason) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Find order
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("id, customer_id")
            .eq("order_number", orderNumber)
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                { error: "ไม่พบคำสั่งซื้อนี้ในระบบ กรุณาตรวจสอบหมายเลขอีกครั้ง" },
                { status: 404 }
            );
        }

        // Verify customer phone
        if (order.customer_id) {
            const { data: customer } = await supabase
                .from("customers")
                .select("phone")
                .eq("id", order.customer_id)
                .single();

            if (customer && customer.phone !== phone.replace(/-/g, "")) {
                return NextResponse.json(
                    { error: "เบอร์โทรศัพท์ไม่ตรงกับข้อมูลคำสั่งซื้อ" },
                    { status: 400 }
                );
            }
        }

        // Create claim
        const { data: claim, error: claimError } = await supabase
            .from("claims_returns")
            .insert({
                order_id: order.id,
                customer_id: order.customer_id,
                claim_type: claimType,
                reason,
                description: description || null,
                status: "pending",
            })
            .select("id")
            .single();

        if (claimError) {
            console.error("Claim creation error:", claimError);
            return NextResponse.json(
                { error: "Failed to create claim" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            claimId: claim.id,
        });
    } catch (error) {
        console.error("Claim error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const { data: claims, error } = await supabase
            .from("claims_returns")
            .select(`
        *,
        order:orders(order_number, total_amount),
        customer:customers(name, phone)
      `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching claims:", error);
            return NextResponse.json(
                { error: "Failed to fetch claims" },
                { status: 500 }
            );
        }

        return NextResponse.json(claims);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
