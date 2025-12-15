import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST: Recalculate RFM for all customers
export async function POST() {
    try {
        // Call the database function to update all RFM scores
        const { error } = await supabase.rpc("update_all_rfm");

        if (error) {
            console.error("RFM calculation error:", error);
            return NextResponse.json(
                { error: "Failed to calculate RFM" },
                { status: 500 }
            );
        }

        // Get updated customer count by segment
        const { data: segments } = await supabase
            .from("customers")
            .select("rfm_segment")
            .not("rfm_segment", "is", null);

        const segmentCounts: Record<string, number> = {};
        segments?.forEach((c) => {
            const seg = c.rfm_segment || "Others";
            segmentCounts[seg] = (segmentCounts[seg] || 0) + 1;
        });

        return NextResponse.json({
            success: true,
            message: "RFM scores updated for all customers",
            segmentCounts,
        });
    } catch (error) {
        console.error("RFM error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// GET: Get RFM distribution stats
export async function GET() {
    try {
        const { data: customers, error } = await supabase
            .from("customers")
            .select("rfm_segment, rfm_score, total_spent, purchase_count");

        if (error) {
            return NextResponse.json(
                { error: "Failed to fetch RFM data" },
                { status: 500 }
            );
        }

        // Calculate segment distribution
        const segmentCounts: Record<string, number> = {};
        let totalCustomers = 0;

        customers?.forEach((c) => {
            totalCustomers++;
            const seg = c.rfm_segment || "Unscored";
            segmentCounts[seg] = (segmentCounts[seg] || 0) + 1;
        });

        // Calculate percentages
        const distribution = Object.entries(segmentCounts).map(([segment, count]) => ({
            segment,
            count,
            percentage: totalCustomers > 0 ? Math.round((count / totalCustomers) * 100) : 0,
        }));

        return NextResponse.json({
            totalCustomers,
            distribution,
        });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
