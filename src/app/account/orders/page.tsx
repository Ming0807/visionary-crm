"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface Order {
    id: string;
    order_number: string;
    total_amount: number;
    payment_status: string;
    fulfillment_status: string;
    created_at: string;
}

export default function OrdersPage() {
    const router = useRouter();
    const { isLoggedIn, isLoading, customer } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            router.push("/");
        }
    }, [isLoading, isLoggedIn, router]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!customer?.id) return;
            
            const { data } = await supabase
                .from("orders")
                .select("id, order_number, total_amount, payment_status, fulfillment_status, created_at")
                .eq("customer_id", customer.id)
                .order("created_at", { ascending: false });

            if (data) setOrders(data);
            setLoadingOrders(false);
        };

        if (customer?.id) fetchOrders();
    }, [customer?.id]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("th-TH", {
            style: "currency",
            currency: "THB",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            delivered: "bg-green-100 text-green-700",
            shipped: "bg-blue-100 text-blue-700",
            packing: "bg-purple-100 text-purple-700",
            unfulfilled: "bg-orange-100 text-orange-700",
            paid: "bg-green-100 text-green-700",
            pending: "bg-yellow-100 text-yellow-700",
            verifying: "bg-blue-100 text-blue-700",
            failed: "bg-red-100 text-red-700",
        };
        return colors[status] || "bg-gray-100 text-gray-700";
    };

    if (isLoading || loadingOrders) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.push("/account")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold">คำสั่งซื้อของฉัน</h1>
            </div>

            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Card key={order.id} className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-mono font-medium">{order.order_number}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(order.created_at).toLocaleDateString("th-TH", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-primary">
                                        {formatPrice(order.total_amount)}
                                    </p>
                                    <div className="flex gap-2 mt-1">
                                        <Badge className={getStatusColor(order.payment_status)}>
                                            {order.payment_status}
                                        </Badge>
                                        <Badge className={getStatusColor(order.fulfillment_status)}>
                                            {order.fulfillment_status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="p-12 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h2 className="font-semibold mb-2">ยังไม่มีคำสั่งซื้อ</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        เริ่มช้อปปิ้งกันเลย!
                    </p>
                    <Button onClick={() => router.push("/products")}>
                        Shop Now
                    </Button>
                </Card>
            )}
        </div>
    );
}
