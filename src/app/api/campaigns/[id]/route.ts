import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Get single campaign
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { data, error } = await supabase
            .from("campaigns")
            .select("*, coupons(code, discount_type, discount_value)")
            .eq("id", id)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }

        // Get campaign logs stats
        const { data: logs } = await supabase
            .from("campaign_logs")
            .select("status")
            .eq("campaign_id", id);

        const stats = {
            total_sent: logs?.filter(l => l.status === 'sent' || l.status === 'delivered').length || 0,
            total_opened: logs?.filter(l => l.status === 'opened' || l.status === 'clicked').length || 0,
            total_clicked: logs?.filter(l => l.status === 'clicked').length || 0,
        };

        return NextResponse.json({ ...data, live_stats: stats });
    } catch {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

// PUT - Update campaign
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const {
            name,
            description,
            campaignType,
            messageTemplate,
            couponId,
            scheduleType,
            status,
        } = body;

        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (campaignType !== undefined) updateData.campaign_type = campaignType;
        if (messageTemplate !== undefined) updateData.message_template = messageTemplate;
        if (couponId !== undefined) updateData.coupon_id = couponId || null;
        if (scheduleType !== undefined) updateData.schedule_type = scheduleType;
        if (status !== undefined) updateData.status = status;

        const { data, error } = await supabase
            .from("campaigns")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

// DELETE - Delete campaign
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { error } = await supabase
            .from("campaigns")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
