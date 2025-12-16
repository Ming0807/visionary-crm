import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const threshold = parseInt(searchParams.get("threshold") || "5");
        const showAll = searchParams.get("all") === "true";

        // Get all variants with stock info from inventory table
        const { data, error } = await supabase
            .from("product_variants")
            .select(`
                id,
                color_name,
                sku,
                products (
                    id,
                    name,
                    brand,
                    is_active
                ),
                inventory (
                    quantity
                )
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Inventory fetch error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Transform data to include stock_quantity
        const allVariants = (data || []).map((v) => {
            const product = Array.isArray(v.products) ? v.products[0] : v.products;
            return {
                id: v.id,
                color_name: v.color_name,
                sku: v.sku,
                stock_quantity: v.inventory?.[0]?.quantity || 0,
                products: product,
            };
        }).filter((v) => v.products?.is_active !== false);

        // Filter by threshold if not showing all
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
        console.error("Inventory error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

// PATCH - Update stock in inventory table
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { variantId, quantity, type = "set" } = body;

        if (!variantId || quantity === undefined) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Check if inventory record exists
        const { data: existing } = await supabase
            .from("inventory")
            .select("id, quantity")
            .eq("variant_id", variantId)
            .single();

        let newQuantity = quantity;
        if (type === "add" && existing) {
            newQuantity = (existing.quantity || 0) + quantity;
        }
        newQuantity = Math.max(0, newQuantity);

        let result;
        if (existing) {
            // Update existing
            result = await supabase
                .from("inventory")
                .update({ quantity: newQuantity })
                .eq("variant_id", variantId)
                .select()
                .single();
        } else {
            // Create new
            result = await supabase
                .from("inventory")
                .insert({ variant_id: variantId, quantity: newQuantity })
                .select()
                .single();
        }

        if (result.error) {
            return NextResponse.json({ error: result.error.message }, { status: 500 });
        }

        return NextResponse.json(result.data);
    } catch (error) {
        console.error("Inventory update error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

