import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET single coupon
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const { data, error } = await supabase
            .from("coupons")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) {
            return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

// PUT - Update coupon
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await request.json();
        const {
            code,
            description,
            discountType,
            discountValue,
            minPurchase,
            maxDiscount,
            usageLimit,
            perCustomerLimit,
            startsAt,
            expiresAt,
            isActive,
        } = body;

        const { data, error } = await supabase
            .from("coupons")
            .update({
                code: code?.toUpperCase(),
                description,
                discount_type: discountType,
                discount_value: discountValue,
                min_purchase: minPurchase,
                max_discount: maxDiscount || null,
                usage_limit: usageLimit || null,
                per_customer_limit: perCustomerLimit,
                starts_at: startsAt,
                expires_at: expiresAt || null,
                is_active: isActive,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            if (error.code === "23505") {
                return NextResponse.json(
                    { error: "Coupon code already exists" },
                    { status: 400 }
                );
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

// DELETE - Delete coupon
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const { error } = await supabase.from("coupons").delete().eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Coupon deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
