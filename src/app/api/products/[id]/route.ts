import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET single product with variants
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const { data: product, error } = await supabase
            .from("products")
            .select(`
        *,
        variants:product_variants(
          *,
          inventory(*)
        )
      `)
            .eq("id", id)
            .single();

        if (error || !product) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT update product
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await request.json();
        const { name, description, brand, category, gender, base_price, is_active } = body;

        const { data: product, error } = await supabase
            .from("products")
            .update({
                name,
                description,
                brand,
                category,
                gender,
                base_price,
                is_active,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: "Failed to update product" },
                { status: 500 }
            );
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("Error updating product:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE product (cascades to variants via DB constraint)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Delete error:", error);
            return NextResponse.json(
                { error: "Failed to delete product" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, message: "Product deleted" });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
