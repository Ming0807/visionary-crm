import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST: Add or redeem points
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { customerId, points, type, referenceId, description } = body;

        // Validate
        if (!customerId || !points || !type) {
            return NextResponse.json(
                { error: "Missing required fields: customerId, points, type" },
                { status: 400 }
            );
        }

        // Call database function
        const { error } = await supabase.rpc("add_customer_points", {
            p_customer_id: customerId,
            p_points: points,
            p_type: type,
            p_reference_id: referenceId || null,
            p_description: description || null,
        });

        if (error) {
            console.error("Points error:", error);
            return NextResponse.json(
                { error: "Failed to add points" },
                { status: 500 }
            );
        }

        // Get updated balance
        const { data: customer } = await supabase
            .from("customers")
            .select("points")
            .eq("id", customerId)
            .single();

        return NextResponse.json({
            success: true,
            newBalance: customer?.points || 0,
        });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET: Get point transactions for a customer
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get("customerId");

        if (!customerId) {
            return NextResponse.json(
                { error: "customerId is required" },
                { status: 400 }
            );
        }

        const { data: transactions, error } = await supabase
            .from("point_transactions")
            .select("*")
            .eq("customer_id", customerId)
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) {
            return NextResponse.json(
                { error: "Failed to fetch transactions" },
                { status: 500 }
            );
        }

        // Calculate totals
        const earned = transactions
            ?.filter((t) => t.points > 0)
            .reduce((sum, t) => sum + t.points, 0) || 0;

        const redeemed = transactions
            ?.filter((t) => t.points < 0)
            .reduce((sum, t) => sum + Math.abs(t.points), 0) || 0;

        return NextResponse.json({
            transactions,
            summary: {
                totalEarned: earned,
                totalRedeemed: redeemed,
                balance: earned - redeemed,
            },
        });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
