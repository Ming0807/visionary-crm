import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/team/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const { data, error } = await supabase
            .from("team_members")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("Team member GET error:", error);
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
}

// PATCH /api/team/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const { data, error } = await supabase
            .from("team_members")
            .update(body)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("Team member PATCH error:", error);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}

// DELETE /api/team/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const { error } = await supabase
            .from("team_members")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Team member DELETE error:", error);
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
