import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, customerId, cartTotal = 0 } = body;

        if (!code) {
            return NextResponse.json({ error: "Coupon code required" }, { status: 400 });
        }

        // Find coupon
        const { data: coupon, error: couponError } = await supabase
            .from("coupons")
            .select("*")
            .ilike("code", code)
            .eq("is_active", true)
            .single();

        if (couponError || !coupon) {
            return NextResponse.json({
                valid: false,
                error: "Coupon not found or inactive"
            });
        }

        // Check dates
        const now = new Date();
        if (coupon.starts_at && new Date(coupon.starts_at) > now) {
            return NextResponse.json({
                valid: false,
                error: "Coupon not yet active"
            });
        }
        if (coupon.expires_at && new Date(coupon.expires_at) < now) {
            return NextResponse.json({
                valid: false,
                error: "Coupon expired"
            });
        }

        // Check usage limit
        if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
            return NextResponse.json({
                valid: false,
                error: "Coupon usage limit reached"
            });
        }

        // Check minimum purchase
        if (cartTotal < coupon.min_purchase) {
            return NextResponse.json({
                valid: false,
                error: `Minimum purchase of ฿${coupon.min_purchase} required`
            });
        }

        // Check per-customer limit
        if (customerId && coupon.per_customer_limit) {
            const { count } = await supabase
                .from("coupon_usages")
                .select("*", { count: "exact", head: true })
                .eq("coupon_id", coupon.id)
                .eq("customer_id", customerId);

            if (count && count >= coupon.per_customer_limit) {
                return NextResponse.json({
                    valid: false,
                    error: "You have already used this coupon"
                });
            }
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discount_type === "percentage") {
            discount = cartTotal * (coupon.discount_value / 100);
            if (coupon.max_discount && discount > coupon.max_discount) {
                discount = coupon.max_discount;
            }
        } else {
            discount = coupon.discount_value;
        }

        // Don't let discount exceed cart total
        discount = Math.min(discount, cartTotal);

        return NextResponse.json({
            valid: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discount_type,
                discountValue: coupon.discount_value,
                minPurchase: coupon.min_purchase,
                maxDiscount: coupon.max_discount,
            },
            calculatedDiscount: Math.round(discount * 100) / 100,
            finalTotal: Math.round((cartTotal - discount) * 100) / 100,
        });
    } catch (error) {
        console.error("Validate coupon error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
