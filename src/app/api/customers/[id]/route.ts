import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Get single customer with full details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { data: customer, error } = await supabase
            .from("customers")
            .select(`
                *,
                social_identities(*),
                orders(
                    id, order_number, total_amount, payment_status, 
                    fulfillment_status, created_at
                ),
                point_transactions(
                    id, points, type, description, created_at
                )
            `)
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return NextResponse.json(
                    { error: "Customer not found" },
                    { status: 404 }
                );
            }
            console.error("Error fetching customer:", error);
            return NextResponse.json(
                { error: "Failed to fetch customer" },
                { status: 500 }
            );
        }

        return NextResponse.json(customer);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT - Update customer
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, phone, email, address, birthday, notes, tier, points } = body;

        // Build update object with only provided fields
        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (email !== undefined) updateData.email = email;
        if (address !== undefined) updateData.address = address;
        if (birthday !== undefined) updateData.birthday = birthday;
        if (notes !== undefined) updateData.notes = notes;
        if (tier !== undefined) updateData.tier = tier;
        if (points !== undefined) updateData.points = points;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "No fields to update" },
                { status: 400 }
            );
        }

        updateData.updated_at = new Date().toISOString();

        const { data: customer, error } = await supabase
            .from("customers")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return NextResponse.json(
                    { error: "Customer not found" },
                    { status: 404 }
                );
            }
            console.error("Error updating customer:", error);
            return NextResponse.json(
                { error: "Failed to update customer" },
                { status: 500 }
            );
        }

        return NextResponse.json(customer);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE - Delete customer
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { error } = await supabase
            .from("customers")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting customer:", error);
            return NextResponse.json(
                { error: "Failed to delete customer" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
