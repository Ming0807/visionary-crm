import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - List all coupons
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get("active") === "true";

        let query = supabase
            .from("coupons")
            .select("*")
            .order("created_at", { ascending: false });

        if (activeOnly) {
            query = query.eq("is_active", true);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

// POST - Create new coupon
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            code,
            description,
            discountType,
            discountValue,
            minPurchase = 0,
            maxDiscount,
            usageLimit,
            perCustomerLimit = 1,
            startsAt,
            expiresAt,
        } = body;

        if (!code || !discountType || !discountValue) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("coupons")
            .insert({
                code: code.toUpperCase(),
                description,
                discount_type: discountType,
                discount_value: discountValue,
                min_purchase: minPurchase,
                max_discount: maxDiscount || null,
                usage_limit: usageLimit || null,
                per_customer_limit: perCustomerLimit,
                starts_at: startsAt || new Date().toISOString(),
                expires_at: expiresAt || null,
            })
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

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
