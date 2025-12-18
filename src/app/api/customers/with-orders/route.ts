import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/customers/with-orders - Get customers who have placed orders (for testimonials)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";

        // Get customers who have at least one paid order
        let query = supabase
            .from("customers")
            .select(`
                id,
                name,
                phone,
                email,
                profile_image_url,
                tier,
                orders!inner(id, payment_status)
            `)
            .eq("orders.payment_status", "paid");

        if (search) {
            query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
        }

        const { data, error } = await query.limit(50);

        if (error) throw error;

        // Count orders and get unique customers
        const customersMap = new Map();
        data?.forEach((customer) => {
            if (!customersMap.has(customer.id)) {
                const orderCount = Array.isArray(customer.orders) ? customer.orders.length : 0;
                customersMap.set(customer.id, {
                    id: customer.id,
                    name: customer.name || "ไม่ระบุชื่อ",
                    phone: customer.phone,
                    email: customer.email,
                    profile_image_url: customer.profile_image_url,
                    tier: customer.tier,
                    order_count: orderCount,
                });
            }
        });

        return NextResponse.json(Array.from(customersMap.values()));
    } catch (error) {
        console.error("Customers with orders error:", error);
        return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
    }
}
