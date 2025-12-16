import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Daily sales summary for n8n workflow
export async function GET(request: NextRequest) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        // Get today's orders
        const { data: orders, error: ordersError } = await supabase
            .from("orders")
            .select("id, total_amount, payment_status, created_at")
            .gte("created_at", todayISO);

        if (ordersError) throw ordersError;

        // Calculate summary
        const totalOrders = orders?.length || 0;
        const paidOrders = orders?.filter((o) => o.payment_status === "paid") || [];
        const pendingOrders = orders?.filter((o) => o.payment_status === "pending_payment") || [];
        const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        const pendingRevenue = pendingOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

        // Get new customers today
        const { count: newCustomers } = await supabase
            .from("customers")
            .select("*", { count: "exact", head: true })
            .gte("created_at", todayISO);

        // Format for LINE message
        const dateStr = today.toLocaleDateString("th-TH", {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
        });

        const lineMessage = `📊 สรุปยอดขายวันนี้
📅 ${dateStr}

💰 รายได้: ฿${totalRevenue.toLocaleString()}
📦 ออเดอร์: ${totalOrders} รายการ
  ✅ ชำระแล้ว: ${paidOrders.length}
  ⏳ รอชำระ: ${pendingOrders.length} (฿${pendingRevenue.toLocaleString()})

👥 ลูกค้าใหม่: ${newCustomers || 0} คน`;

        return NextResponse.json({
            success: true,
            date: dateStr,
            summary: {
                totalOrders,
                paidOrders: paidOrders.length,
                pendingOrders: pendingOrders.length,
                totalRevenue,
                pendingRevenue,
                newCustomers: newCustomers || 0,
            },
            lineMessage,
        });
    } catch (error) {
        console.error("Daily summary error:", error);
        return NextResponse.json({ error: "Failed to get daily summary" }, { status: 500 });
    }
}
