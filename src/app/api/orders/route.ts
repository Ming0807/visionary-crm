import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Generate order number: INV-YYYYMMDD-XXX
function generateOrderNumber() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `INV-${dateStr}-${random}`;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { customerId: providedCustomerId, customer, shippingAddress, items, subtotal, shippingCost, totalAmount } = body;

        // Validate required fields
        if (!customer?.name || !customer?.phone || !items?.length) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Use provided customerId (from logged-in user) or find/create by phone
        let customerId: string | null = providedCustomerId || null;

        if (!customerId) {
            // Try to find existing customer by phone
            const { data: existingCustomer } = await supabase
                .from("customers")
                .select("id")
                .eq("phone", customer.phone)
                .single();

            if (existingCustomer) {
                customerId = existingCustomer.id;
            } else {
                // Create new customer
                const { data: newCustomer, error: customerError } = await supabase
                    .from("customers")
                    .insert({
                        name: customer.name,
                        phone: customer.phone,
                        email: customer.email || null,
                        address: shippingAddress,
                    })
                    .select("id")
                    .single();

                if (customerError) {
                    console.error("Customer creation error:", customerError);
                    return NextResponse.json(
                        { error: "Failed to create customer" },
                        { status: 500 }
                    );
                }
                customerId = newCustomer.id;
            }
        }

        // Create order
        const orderNumber = generateOrderNumber();
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                order_number: orderNumber,
                customer_id: customerId,
                platform_source: "web",
                subtotal: subtotal,
                shipping_cost: shippingCost,
                total_amount: totalAmount,
                payment_status: "pending_payment",
                fulfillment_status: "unfulfilled",
                shipping_address: shippingAddress,
            })
            .select("id")
            .single();

        if (orderError) {
            console.error("Order creation error:", orderError);
            return NextResponse.json(
                { error: "Failed to create order" },
                { status: 500 }
            );
        }

        // Create order items
        const orderItems = items.map((item: {
            variantId: string;
            quantity: number;
            price: number;
            productName: string;
            sku: string;
        }) => ({
            order_id: order.id,
            variant_id: item.variantId,
            product_name_snapshot: item.productName,
            sku_snapshot: item.sku,
            quantity: item.quantity,
            price_per_unit: item.price,
        }));

        const { error: itemsError } = await supabase
            .from("order_items")
            .insert(orderItems);

        if (itemsError) {
            console.error("Order items error:", itemsError);
            return NextResponse.json(
                { error: "Failed to create order items" },
                { status: 500 }
            );
        }

        // Update inventory (decrement quantity)
        for (const item of items) {
            await supabase.rpc("decrement_inventory", {
                p_variant_id: item.variantId,
                p_quantity: item.quantity,
            });
        }

        // Update customer's total_spent (simple update for now, will use proper increment trigger later)
        // Note: This sets rather than increments - proper implementation needs DB trigger
        await supabase
            .from("customers")
            .update({
                total_spent: totalAmount,
            })
            .eq("id", customerId);

        // Notify admin via LINE (fire and forget)
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/notify/admin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                orderNumber,
                customerName: customer.name,
                totalAmount,
                itemCount: items.length,
                orderId: order.id,
            }),
        }).catch(console.error);

        return NextResponse.json({
            success: true,
            orderId: order.id,
            orderNumber: orderNumber,
        });
    } catch (error) {
        console.error("Checkout error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const { data: orders, error } = await supabase
            .from("orders")
            .select(`
        *,
        customer:customers(*),
        items:order_items(
          *,
          variant:product_variants(
            *,
            product:products(*)
          )
        )
      `)
            .order("created_at", { ascending: false })
            .limit(50);

        if (error) {
            console.error("Error fetching orders:", error);
            return NextResponse.json(
                { error: "Failed to fetch orders" },
                { status: 500 }
            );
        }

        return NextResponse.json(orders);
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
