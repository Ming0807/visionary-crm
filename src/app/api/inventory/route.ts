import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const threshold = parseInt(searchParams.get("threshold") || "5");
        const showAll = searchParams.get("all") === "true";

        // Get all variants with stock info
        let query = supabase
            .from("product_variants")
            .select(`
                id,
                color_name,
                stock_quantity,
                sku,
                products (
                    id,
                    name,
                    brand,
                    is_active
                )
            `)
            .eq("products.is_active", true)
            .order("stock_quantity", { ascending: true });

        if (!showAll) {
            query = query.lte("stock_quantity", threshold);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Inventory fetch error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Calculate stats
        const allVariants = data || [];
        const lowStock = allVariants.filter((v) => v.stock_quantity <= threshold && v.stock_quantity > 0);
        const outOfStock = allVariants.filter((v) => v.stock_quantity === 0);
        const totalStock = allVariants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);

        return NextResponse.json({
            items: showAll ? allVariants : [...outOfStock, ...lowStock],
            stats: {
                totalVariants: allVariants.length,
                lowStockCount: lowStock.length,
                outOfStockCount: outOfStock.length,
                totalStock,
                threshold,
            },
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

// PATCH - Update stock
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { variantId, quantity, type = "set" } = body;

        if (!variantId || quantity === undefined) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        let updateQuery;
        if (type === "add") {
            // Add to current stock
            const { data: current } = await supabase
                .from("product_variants")
                .select("stock_quantity")
                .eq("id", variantId)
                .single();

            const newQuantity = (current?.stock_quantity || 0) + quantity;
            updateQuery = supabase
                .from("product_variants")
                .update({ stock_quantity: Math.max(0, newQuantity) })
                .eq("id", variantId);
        } else {
            // Set absolute value
            updateQuery = supabase
                .from("product_variants")
                .update({ stock_quantity: Math.max(0, quantity) })
                .eq("id", variantId);
        }

        const { data, error } = await updateQuery.select().single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
