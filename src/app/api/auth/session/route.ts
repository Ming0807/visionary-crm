import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";

// GET - Check current session
export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("customer_session");

        if (!sessionCookie?.value) {
            return NextResponse.json({ customer: null });
        }

        // Decode session token
        const decoded = Buffer.from(sessionCookie.value, "base64").toString();
        const [customerId] = decoded.split(":");

        if (!customerId) {
            return NextResponse.json({ customer: null });
        }

        // Fetch customer
        const { data: customer, error } = await supabase
            .from("customers")
            .select("*")
            .eq("id", customerId)
            .single();

        if (error || !customer) {
            // Invalid session - clear cookie
            cookieStore.delete("customer_session");
            return NextResponse.json({ customer: null });
        }

        // Determine profile status
        const profileStatus = customer.phone && customer.address_json
            ? "complete"
            : "incomplete";

        return NextResponse.json({
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                profileImageUrl: customer.profile_image_url,
                tier: customer.tier,
                points: customer.points,
                profileStatus,
                birthday: customer.birthday,
                address_json: customer.address_json,
            },
        });
    } catch (error) {
        console.error("Session check error:", error);
        return NextResponse.json({ customer: null });
    }
}

// DELETE - Logout (clear session)
export async function DELETE() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete("customer_session");

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({ error: "Logout failed" }, { status: 500 });
    }
}
