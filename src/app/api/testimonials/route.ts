import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/testimonials - Get all testimonials (optional: featured only, all for admin)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const featured = searchParams.get("featured") === "true";
        const all = searchParams.get("all") === "true"; // For admin to see all including inactive

        let query = supabase
            .from("testimonials")
            .select("*")
            .order("created_at", { ascending: false });

        // Only filter by is_active if not requesting all
        if (!all) {
            query = query.eq("is_active", true);
        }

        if (featured) {
            query = query.eq("is_featured", true);
        }

        const { data, error } = await query;

        if (error) throw error;

        return NextResponse.json(data || []);
    } catch (error) {
        console.error("Testimonials GET error:", error);
        return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
    }
}

// POST /api/testimonials - Create a new testimonial
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Convert empty string to null for UUID fields
        const customerId = body.customer_id === "" ? null : body.customer_id;

        const { data, error } = await supabase
            .from("testimonials")
            .insert({
                customer_id: customerId,
                customer_name: body.customer_name,
                avatar_url: body.avatar_url,
                rating: body.rating || 5,
                comment: body.comment,
                product_name: body.product_name,
                is_featured: body.is_featured || false,
                is_active: body.is_active ?? true,
                display_order: body.display_order || 0,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Testimonials POST error:", error);
        return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
    }
}
