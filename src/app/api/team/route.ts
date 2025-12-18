import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/team - Get all team members
export async function GET() {
    try {
        const { data, error } = await supabase
            .from("team_members")
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true });

        if (error) throw error;

        return NextResponse.json(data || []);
    } catch (error) {
        console.error("Team GET error:", error);
        return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 });
    }
}

// POST /api/team - Create a new team member
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { data, error } = await supabase
            .from("team_members")
            .insert({
                name: body.name,
                role: body.role,
                image_url: body.image_url,
                display_order: body.display_order || 0,
                is_active: body.is_active ?? true,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Team POST error:", error);
        return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
    }
}
