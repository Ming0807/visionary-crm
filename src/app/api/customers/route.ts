import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { customerCreateSchema } from "@/lib/validations";
import { validationError, conflictError, errorResponse } from "@/lib/api-utils";

// GET - List customers with pagination, search, and filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search") || "";
        const tier = searchParams.get("tier") || "";
        const sortBy = searchParams.get("sortBy") || "created_at";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        const offset = (page - 1) * limit;

        // Build query
        let query = supabase
            .from("customers")
            .select(`
                id,
                name,
                phone,
                email,
                tier,
                points,
                total_spent,
                purchase_count,
                rfm_segment,
                rfm_score,
                birthday,
                created_at,
                social_identities(id, provider, provider_user_id)
            `, { count: "exact" });

        // Apply search filter
        if (search) {
            query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
        }

        // Apply tier filter
        if (tier) {
            query = query.eq("tier", tier);
        }

        // Apply sorting
        const ascending = sortOrder === "asc";
        query = query.order(sortBy, { ascending });

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data: customers, error, count } = await query;

        if (error) {
            console.error("Error fetching customers:", error);
            return NextResponse.json(
                { error: "Failed to fetch customers" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            customers,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            }
        }, {
            headers: {
                'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
            }
        });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// POST - Create new customer
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate with Zod
        const validation = customerCreateSchema.safeParse(body);
        if (!validation.success) {
            return validationError(validation.error.issues);
        }

        const { name, phone, email, address, birthday, notes } = validation.data;

        // Check if phone already exists
        const { data: existing } = await supabase
            .from("customers")
            .select("id")
            .eq("phone", phone)
            .single();

        if (existing) {
            return conflictError("Customer with this phone already exists");
        }

        const { data: customer, error } = await supabase
            .from("customers")
            .insert({
                name,
                phone,
                email: email || null,
                address: address || {},
                birthday: birthday || null,
                notes: notes || null,
                tier: "member",
                points: 0,
                total_spent: 0,
                purchase_count: 0,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating customer:", error);
            return errorResponse("Failed to create customer");
        }

        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        console.error("Error:", error);
        return errorResponse("Internal server error");
    }
}
