"use client";

import { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AnalyticsData {
    summary: {
        todayRevenue: number;
        todayOrders: number;
        monthRevenue: number;
        monthOrders: number;
        totalCustomers: number;
        pendingOrders: number;
    };
    revenueTrend: Array<{ date: string; revenue: number; orders: number }>;
    ordersByStatus: Array<{ status: string; count: number }>;
    customersByTier: Array<{ tier: string; count: number }>;
    topProducts: Array<{ name: string; sold: number; revenue: number }>;
}

const STATUS_COLORS: Record<string, string> = {
    paid: "#22c55e",
    pending_payment: "#eab308",
    cancelled: "#ef4444",
    refunded: "#6b7280",
};

const TIER_COLORS: Record<string, string> = {
    member: "#9ca3af",
    vip: "#f59e0b",
    platinum: "#1f2937",
};

export default function AnalyticsCharts() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch("/api/analytics/overview?range=7");
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("th-TH", {
            style: "currency",
            currency: "THB",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
    };

    if (loading) {
        return (
            <div className="grid gap-6">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="p-6 animate-pulse">
                            <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                            <div className="h-8 bg-muted rounded w-3/4"></div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-100 text-green-600">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">วันนี้</p>
                            <p className="text-2xl font-bold">{formatPrice(data.summary.todayRevenue)}</p>
                            <p className="text-xs text-muted-foreground">{data.summary.todayOrders} orders</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">เดือนนี้</p>
                            <p className="text-2xl font-bold">{formatPrice(data.summary.monthRevenue)}</p>
                            <p className="text-xs text-muted-foreground">{data.summary.monthOrders} orders</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">ลูกค้าทั้งหมด</p>
                            <p className="text-2xl font-bold">{data.summary.totalCustomers}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">รอชำระ</p>
                            <p className="text-2xl font-bold">{data.summary.pendingOrders}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <Card className="p-6">
                    <h3 className="font-semibold mb-4">รายได้ 7 วันย้อนหลัง</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                            <LineChart data={data.revenueTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={formatDate}
                                    stroke="#9ca3af"
                                    fontSize={12}
                                />
                                <YAxis 
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    tickFormatter={(v) => `฿${(v/1000).toFixed(0)}k`}
                                />
                                <Tooltip 
                                    formatter={(value) => [formatPrice(Number(value) || 0), "รายได้"]}
                                    labelFormatter={formatDate}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#c2410c" 
                                    strokeWidth={3}
                                    dot={{ fill: "#c2410c", strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Order Status Pie */}
                <Card className="p-6">
                    <h3 className="font-semibold mb-4">สถานะออเดอร์</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                            <PieChart>
                                <Pie
                                    data={data.ordersByStatus}
                                    dataKey="count"
                                    nameKey="status"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label={(props) => {
                                        const { payload } = props as { payload?: { status?: string; count?: number } };
                                        return payload ? `${(payload.status || "").replace("_", " ")} (${payload.count || 0})` : "";
                                    }}
                                    labelLine={false}
                                >
                                    {data.ordersByStatus.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={STATUS_COLORS[entry.status] || "#9ca3af"} 
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Customer Tiers */}
                <Card className="p-6">
                    <h3 className="font-semibold mb-4">ระดับลูกค้า</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                            <BarChart data={data.customersByTier} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                                <YAxis 
                                    type="category" 
                                    dataKey="tier" 
                                    stroke="#9ca3af" 
                                    fontSize={12}
                                    width={80}
                                />
                                <Tooltip />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                    {data.customersByTier.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={TIER_COLORS[entry.tier] || "#9ca3af"} 
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Top Products */}
                <Card className="p-6">
                    <h3 className="font-semibold mb-4">สินค้าขายดี</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
                            <BarChart data={data.topProducts} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                                <YAxis 
                                    type="category" 
                                    dataKey="name" 
                                    stroke="#9ca3af" 
                                    fontSize={11}
                                    width={120}
                                    tickFormatter={(name) => name.length > 15 ? name.slice(0, 15) + "..." : name}
                                />
                                <Tooltip formatter={(v) => [`${v ?? 0} ชิ้น`, "จำนวนขาย"]} />
                                <Bar dataKey="sold" fill="#c2410c" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
}
