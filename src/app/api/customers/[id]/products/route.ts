import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/customers/[id]/products - Get products purchased by this customer
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Get distinct products purchased by this customer
        const { data: orderItems, error } = await supabase
            .from("order_items")
            .select(`
                product_name_snapshot,
                variant:product_variants(
                    id,
                    product:products(id, name, brand)
                ),
                order:orders!inner(customer_id, payment_status)
            `)
            .eq("order.customer_id", id)
            .eq("order.payment_status", "paid");

        if (error) throw error;

        // Get unique products
        const productsMap = new Map();
        orderItems?.forEach((item) => {
            const productName = item.product_name_snapshot ||
                (item.variant as unknown as { product: { name: string } })?.product?.name ||
                "Unknown Product";

            if (!productsMap.has(productName)) {
                productsMap.set(productName, {
                    name: productName,
                    brand: (item.variant as unknown as { product: { brand: string } })?.product?.brand,
                });
            }
        });

        return NextResponse.json(Array.from(productsMap.values()));
    } catch (error) {
        console.error("Customer products error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}
