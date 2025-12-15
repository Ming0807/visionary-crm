import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { customerId, amount, reason } = body;

        if (!customerId || amount === undefined) {
            return NextResponse.json(
                { error: "Missing customerId or amount" },
                { status: 400 }
            );
        }

        // Call the SQL function
        const { data, error } = await supabase.rpc("adjust_customer_points", {
            p_customer_id: customerId,
            p_amount: amount,
            p_reason: reason || "manual_adjustment",
            p_admin: "admin",
        });

        if (error) {
            console.error("Point adjustment error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Get updated customer
        const { data: customer } = await supabase
            .from("customers")
            .select("id, name, tier, points, total_spent")
            .eq("id", customerId)
            .single();

        return NextResponse.json({
            success: true,
            newPoints: data,
            customer,
        });
    } catch (error) {
        console.error("Point adjustment error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get("customerId");

        if (!customerId) {
            return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("point_transactions")
            .select("*")
            .eq("customer_id", customerId)
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
