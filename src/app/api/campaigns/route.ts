import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - List all campaigns
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");

        let query = supabase
            .from("campaigns")
            .select("*, coupons(code, discount_type, discount_value)")
            .order("created_at", { ascending: false });

        if (status && status !== "all") {
            query = query.eq("status", status);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Campaigns fetch error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

// POST - Create new campaign
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            name,
            description,
            campaignType,
            messageTemplate,
            couponId,
            sendChannel = "line",
            scheduleType = "manual",
            scheduledAt,
            targetAudience = {},
        } = body;

        if (!name || !campaignType || !messageTemplate) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("campaigns")
            .insert({
                name,
                description,
                campaign_type: campaignType,
                message_template: messageTemplate,
                coupon_id: couponId || null,
                send_channel: sendChannel,
                schedule_type: scheduleType,
                scheduled_at: scheduledAt || null,
                target_audience: targetAudience,
                status: "draft",
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

// PATCH - Update campaign status
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json(
                { error: "Missing id or status" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("campaigns")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
