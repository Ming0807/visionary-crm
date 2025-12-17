import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST - Sync customer from LINE Login
export async function POST(request: NextRequest) {
    try {
        const { lineUserId, displayName, pictureUrl } = await request.json();

        if (!lineUserId) {
            return NextResponse.json({ error: "Missing lineUserId" }, { status: 400 });
        }

        // Check if customer exists via social_identities
        const { data: existingIdentity } = await supabase
            .from("social_identities")
            .select("customer_id, customers(*)")
            .eq("social_user_id", lineUserId)
            .eq("platform", "line")
            .single();

        let customer;

        if (existingIdentity?.customers) {
            // Customer exists - update profile image if changed
            customer = Array.isArray(existingIdentity.customers)
                ? existingIdentity.customers[0]
                : existingIdentity.customers;

            if (pictureUrl && customer.profile_image_url !== pictureUrl) {
                await supabase
                    .from("customers")
                    .update({
                        profile_image_url: pictureUrl,
                        name: displayName || customer.name
                    })
                    .eq("id", customer.id);
            }
        } else {
            // Create new customer
            const { data: newCustomer, error: customerError } = await supabase
                .from("customers")
                .insert({
                    name: displayName,
                    profile_image_url: pictureUrl,
                    profile_status: "incomplete",
                    tier: "bronze",
                    points: 0,
                    total_spent: 0,
                    order_count: 0,
                })
                .select()
                .single();

            if (customerError) throw customerError;
            customer = newCustomer;

            // Create social identity link
            await supabase.from("social_identities").insert({
                customer_id: customer.id,
                platform: "line",
                social_user_id: lineUserId,
                profile_data: { displayName, pictureUrl },
            });
        }

        // Determine profile status
        const profileStatus = customer.phone && customer.address_json
            ? "complete"
            : "incomplete";

        return NextResponse.json({
            success: true,
            customer: {
                id: customer.id,
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                profileImageUrl: customer.profile_image_url,
                tier: customer.tier,
                points: customer.points,
                profileStatus,
                birthday: customer.birthday,
                address_json: customer.address_json,
            },
        });
    } catch (error) {
        console.error("Customer sync error:", error);
        return NextResponse.json({ error: "Sync failed" }, { status: 500 });
    }
}
