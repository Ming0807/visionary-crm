import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search");

        const offset = (page - 1) * limit;

        // Build query
        let query = supabase
            .from("contact_messages")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        // Filter by status
        if (status && status !== "all") {
            query = query.eq("status", status);
        }

        // Search by name, phone, or email
        if (search) {
            query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error("Error fetching contact messages:", error);
            return NextResponse.json(
                { error: "Failed to fetch messages" },
                { status: 500 }
            );
        }

        // Get unread count
        const { count: unreadCount } = await supabase
            .from("contact_messages")
            .select("*", { count: "exact", head: true })
            .eq("status", "new");

        return NextResponse.json({
            messages: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
            unreadCount: unreadCount || 0,
        });
    } catch (error) {
        console.error("Contact messages API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
