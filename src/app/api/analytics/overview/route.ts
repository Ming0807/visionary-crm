import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const range = searchParams.get("range") || "7"; // days

        // Get summary stats
        const today = new Date().toISOString().split("T")[0];
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            .toISOString().split("T")[0];

        // Today's stats
        const { data: todayData } = await supabase
            .from("orders")
            .select("total_amount")
            .eq("payment_status", "paid")
            .gte("created_at", `${today}T00:00:00`)
            .lte("created_at", `${today}T23:59:59`);

        const todayRevenue = todayData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
        const todayOrders = todayData?.length || 0;

        // This month stats
        const { data: monthData } = await supabase
            .from("orders")
            .select("total_amount")
            .eq("payment_status", "paid")
            .gte("created_at", monthStart);

        const monthRevenue = monthData?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
        const monthOrders = monthData?.length || 0;

        // Customer count
        const { count: customerCount } = await supabase
            .from("customers")
            .select("*", { count: "exact", head: true });

        // Pending orders
        const { count: pendingOrders } = await supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("payment_status", "pending_payment");

        // Revenue trend (last N days)
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(range));

        const { data: trendData } = await supabase
            .from("orders")
            .select("created_at, total_amount")
            .eq("payment_status", "paid")
            .gte("created_at", daysAgo.toISOString())
            .order("created_at", { ascending: true });

        // Aggregate by date
        const revenueTrend: Record<string, { date: string; revenue: number; orders: number }> = {};
        trendData?.forEach(order => {
            const date = order.created_at.split("T")[0];
            if (!revenueTrend[date]) {
                revenueTrend[date] = { date, revenue: 0, orders: 0 };
            }
            revenueTrend[date].revenue += order.total_amount || 0;
            revenueTrend[date].orders += 1;
        });

        // Order status distribution
        const { data: statusData } = await supabase
            .from("orders")
            .select("payment_status");

        const ordersByStatus: Record<string, number> = {};
        statusData?.forEach(order => {
            const status = order.payment_status || "unknown";
            ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
        });

        // Customer tiers
        const { data: tierData } = await supabase
            .from("customers")
            .select("tier");

        const customersByTier: Record<string, number> = {};
        tierData?.forEach(customer => {
            const tier = customer.tier || "member";
            customersByTier[tier] = (customersByTier[tier] || 0) + 1;
        });

        // Top products
        const { data: topProducts } = await supabase
            .from("order_items")
            .select(`
                quantity,
                price_per_unit,
                product_name_snapshot
            `)
            .limit(100);

        const productSales: Record<string, { name: string; sold: number; revenue: number }> = {};
        topProducts?.forEach(item => {
            const name = item.product_name_snapshot || "Unknown";
            if (!productSales[name]) {
                productSales[name] = { name, sold: 0, revenue: 0 };
            }
            productSales[name].sold += item.quantity || 0;
            productSales[name].revenue += (item.quantity || 0) * (item.price_per_unit || 0);
        });

        const topProductsList = Object.values(productSales)
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 5);

        return NextResponse.json({
            summary: {
                todayRevenue,
                todayOrders,
                monthRevenue,
                monthOrders,
                totalCustomers: customerCount || 0,
                pendingOrders: pendingOrders || 0,
            },
            revenueTrend: Object.values(revenueTrend),
            ordersByStatus: Object.entries(ordersByStatus).map(([status, count]) => ({
                status,
                count,
            })),
            customersByTier: Object.entries(customersByTier).map(([tier, count]) => ({
                tier,
                count,
            })),
            topProducts: topProductsList,
        });
    } catch (error) {
        console.error("Analytics error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}
