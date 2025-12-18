import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search") || "";
        const category = searchParams.get("category") || "";
        const sale = searchParams.get("sale") === "true";
        const includeVariants = searchParams.get("variants") !== "false";

        const offset = (page - 1) * limit;

        // Build query - optimize by selecting only needed fields
        let query = supabase
            .from("products")
            .select(
                includeVariants
                    ? `*, variants:product_variants(*, inventory(*))`
                    : `id, name, brand, category, base_price, is_active, created_at`,
                { count: "exact" }
            )
            .eq("is_active", true);

        // Apply search filter
        if (search) {
            query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
        }

        // Apply category filter
        if (category) {
            query = query.eq("category", category);
        }

        // Apply sorting and pagination
        query = query
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        const { data: products, error, count } = await query;

        if (error) {
            console.error("Error fetching products:", error);
            return NextResponse.json(
                { error: "Failed to fetch products" },
                { status: 500 }
            );
        }

        // Filter for sale products (check variant-level sale status with dates)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let filteredProducts = products as any;

        if (sale && products) {
            const now = new Date().toISOString();
            filteredProducts = (products as any[])?.filter((product: any) => {
                if (!product.variants || product.variants.length === 0) return false;
                return product.variants.some((v: any) => {
                    if (!v.is_on_sale) return false;
                    const startOk = !v.sale_start_date || v.sale_start_date <= now;
                    const endOk = !v.sale_end_date || v.sale_end_date >= now;
                    return startOk && endOk;
                });
            }) || null;
        }



        return NextResponse.json({
            products: sale ? filteredProducts : products,
            pagination: {
                page,
                limit,
                total: sale ? (filteredProducts?.length || 0) : (count || 0),
                totalPages: Math.ceil((sale ? (filteredProducts?.length || 0) : (count || 0)) / limit),
            }
        }, {
            headers: {
                'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
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
