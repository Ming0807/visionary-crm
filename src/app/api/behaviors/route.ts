import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST - Track customer behavior (view, wishlist_add, cart_abandon)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { customerId, behaviorType, variantId, productId, metadata } = body;

        if (!behaviorType) {
            return NextResponse.json(
                { error: "behaviorType is required" },
                { status: 400 }
            );
        }

        // Validate behavior type
        const validTypes = ["view", "wishlist_add", "wishlist_remove", "cart_abandon", "search"];
        if (!validTypes.includes(behaviorType)) {
            return NextResponse.json(
                { error: `Invalid behaviorType. Must be one of: ${validTypes.join(", ")}` },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("customer_behaviors")
            .insert({
                customer_id: customerId || null,
                behavior_type: behaviorType,
                variant_id: variantId || null,
                product_id: productId || null,
                metadata: metadata || {},
            })
            .select()
            .single();

        if (error) {
            console.error("Error tracking behavior:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, behavior: data }, { status: 201 });
    } catch (error) {
        console.error("Behavior tracking error:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

// GET - Get behaviors for a customer (or all)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get("customerId");
        const behaviorType = searchParams.get("type");
        const limit = parseInt(searchParams.get("limit") || "50");

        let query = supabase
            .from("customer_behaviors")
            .select(`
        *,
        variant:product_variants(
          id,
          color_name,
          images,
          product:products(id, name, brand)
        )
      `)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (customerId) {
            query = query.eq("customer_id", customerId);
        }
        if (behaviorType) {
            query = query.eq("behavior_type", behaviorType);
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
