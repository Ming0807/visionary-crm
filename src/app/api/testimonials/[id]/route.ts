import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/testimonials/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const { data, error } = await supabase
            .from("testimonials")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("Testimonial GET error:", error);
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
}

// PATCH /api/testimonials/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Convert empty string to null for UUID fields
        if (body.customer_id === "") {
            body.customer_id = null;
        }

        const { data, error } = await supabase
            .from("testimonials")
            .update(body)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("Testimonial PATCH error:", error);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}

// DELETE /api/testimonials/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const { error } = await supabase
            .from("testimonials")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Testimonial DELETE error:", error);
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
