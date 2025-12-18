import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface RouteParams {
    params: Promise<{ key: string }>;
}

// GET /api/settings/[key] - Get a setting by key
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { key } = await params;

        const { data, error } = await supabase
            .from("site_settings")
            .select("*")
            .eq("key", key)
            .single();

        if (error) {
            // Return default values if not found
            return NextResponse.json({ key, value: null });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Settings GET error:", error);
        return NextResponse.json({ error: "Failed to fetch setting" }, { status: 500 });
    }
}

// PUT /api/settings/[key] - Update a setting
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { key } = await params;
        const { value } = await request.json();

        const { data, error } = await supabase
            .from("site_settings")
            .upsert(
                { key, value, updated_at: new Date().toISOString() },
                { onConflict: "key" }
            )
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error("Settings PUT error:", error);
        return NextResponse.json({ error: "Failed to update setting" }, { status: 500 });
    }
}
