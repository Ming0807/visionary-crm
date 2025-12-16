import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Export data as CSV
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type") || "orders";
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        let csvContent = "";
        let filename = "";

        if (type === "orders") {
            let query = supabase
                .from("orders")
                .select(`
                    id, order_number, platform_source, subtotal, discount_amount, 
                    shipping_cost, total_amount, payment_status, fulfillment_status,
                    tracking_number, shipping_carrier, created_at,
                    customer:customers(name, phone, email)
                `)
                .order("created_at", { ascending: false });

            if (from) query = query.gte("created_at", from);
            if (to) query = query.lte("created_at", to);

            const { data: orders, error } = await query;
            if (error) throw error;

            // CSV Headers
            csvContent = "Order Number,Customer Name,Phone,Email,Subtotal,Discount,Shipping,Total,Payment Status,Fulfillment Status,Tracking,Carrier,Created At\n";

            // CSV Rows
            orders?.forEach((o) => {
                // Handle customer being returned as array or single object
                const customer = Array.isArray(o.customer) ? o.customer[0] : o.customer;
                csvContent += `"${o.order_number}","${customer?.name || ""}","${customer?.phone || ""}","${customer?.email || ""}",${o.subtotal},${o.discount_amount},${o.shipping_cost},${o.total_amount},"${o.payment_status}","${o.fulfillment_status}","${o.tracking_number || ""}","${o.shipping_carrier || ""}","${o.created_at}"\n`;
            });

            filename = `orders_${new Date().toISOString().slice(0, 10)}.csv`;

        } else if (type === "customers") {
            const { data: customers, error } = await supabase
                .from("customers")
                .select("id, name, phone, email, tier, points, total_spent, order_count, created_at")
                .order("created_at", { ascending: false });

            if (error) throw error;

            // CSV Headers
            csvContent = "Name,Phone,Email,Tier,Points,Total Spent,Order Count,Joined At\n";

            // CSV Rows
            customers?.forEach((c) => {
                csvContent += `"${c.name || ""}","${c.phone || ""}","${c.email || ""}","${c.tier}",${c.points},${c.total_spent},${c.order_count},"${c.created_at}"\n`;
            });

            filename = `customers_${new Date().toISOString().slice(0, 10)}.csv`;
        }

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json({ error: "Export failed" }, { status: 500 });
    }
}
