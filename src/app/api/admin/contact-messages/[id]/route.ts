import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { z } from "zod";

const updateSchema = z.object({
    status: z.enum(["new", "read", "replied", "archived"]).optional(),
    admin_notes: z.string().max(2000).optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { data, error } = await supabase
            .from("contact_messages")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return NextResponse.json(
                    { error: "Message not found" },
                    { status: 404 }
                );
            }
            console.error("Error fetching message:", error);
            return NextResponse.json(
                { error: "Failed to fetch message" },
                { status: 500 }
            );
        }

        // Mark as read if it's new
        if (data.status === "new") {
            await supabase
                .from("contact_messages")
                .update({ status: "read", updated_at: new Date().toISOString() })
                .eq("id", id);
            data.status = "read";
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Message API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const validationResult = updateSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const updateData: Record<string, unknown> = {
            ...validationResult.data,
            updated_at: new Date().toISOString(),
        };

        // Set replied_at if status changed to replied
        if (validationResult.data.status === "replied") {
            updateData.replied_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from("contact_messages")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Error updating message:", error);
            return NextResponse.json(
                { error: "Failed to update message" },
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Message update API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { error } = await supabase
            .from("contact_messages")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting message:", error);
            return NextResponse.json(
                { error: "Failed to delete message" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Message delete API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
