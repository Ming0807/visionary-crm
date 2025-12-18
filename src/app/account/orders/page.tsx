"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Package, ChevronRight, Loader2, ArrowLeft, Star, Truck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface OrderItem {
    id: string;
    product_name_snapshot: string;
    quantity: number;
    unit_price: number;
    variant: {
        images: string[];
    } | null;
}

interface Order {
    id: string;
    order_number: string;
    total_amount: number;
    payment_status: string;
    fulfillment_status: string;
    tracking_number: string | null;
    created_at: string;
    items: OrderItem[];
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
                .select(`
                    id, 
                    order_number, 
                    total_amount, 
                    payment_status, 
                    fulfillment_status, 
                    tracking_number,
                    created_at
                `)
                .eq("customer_id", customer.id)
                .order("created_at", { ascending: false });
            
            if (data) {
                // Fetch items separately to avoid query issues
                const ordersWithItems = await Promise.all(
                    data.map(async (order) => {
                        const { data: items } = await supabase
                            .from("order_items")
                            .select("id, product_name_snapshot, quantity, price_per_unit")
                            .eq("order_id", order.id);
                        return { ...order, items: items || [] };
                    })
                );
                setOrders(ordersWithItems as unknown as Order[]);
            }
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

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            delivered: "จัดส่งแล้ว",
            shipped: "กำลังจัดส่ง",
            packing: "กำลังแพ็ค",
            unfulfilled: "รอดำเนินการ",
            paid: "ชำระแล้ว",
            pending: "รอชำระ",
            verifying: "รอตรวจสอบ",
            failed: "ล้มเหลว",
        };
        return labels[status] || status;
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
                        <Link key={order.id} href={`/account/orders/${order.id}`}>
                            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="font-mono font-medium text-lg">{order.order_number}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(order.created_at).toLocaleDateString("th-TH", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>

                                {/* Product Images Preview */}
                                {order.items && order.items.length > 0 && (
                                    <div className="flex gap-2 mb-3 overflow-x-auto">
                                        {order.items.slice(0, 4).map((item, idx) => (
                                            <div key={item.id || idx} className="w-14 h-14 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                                                {item.variant?.images?.[0] ? (
                                                    <Image
                                                        src={item.variant.images[0]}
                                                        alt=""
                                                        width={56}
                                                        height={56}
                                                        className="object-cover w-full h-full"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {order.items.length > 4 && (
                                            <div className="w-14 h-14 rounded-lg bg-muted flex-shrink-0 flex items-center justify-center">
                                                <span className="text-sm text-muted-foreground">+{order.items.length - 4}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Status Row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <div className="flex items-center gap-1">
                                            <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                                            <Badge className={`${getStatusColor(order.payment_status)} text-xs`}>
                                                {getStatusLabel(order.payment_status)}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                                            <Badge className={`${getStatusColor(order.fulfillment_status)} text-xs`}>
                                                {getStatusLabel(order.fulfillment_status)}
                                            </Badge>
                                        </div>
                                    </div>
                                    <p className="font-semibold text-primary text-lg">
                                        {formatPrice(order.total_amount)}
                                    </p>
                                </div>

                                {/* Tracking Info */}
                                {order.tracking_number && (
                                    <div className="mt-2 pt-2 border-t">
                                        <p className="text-xs text-muted-foreground">
                                            Tracking: <span className="font-mono">{order.tracking_number}</span>
                                        </p>
                                    </div>
                                )}

                                {/* Review Button */}
                                {(order.fulfillment_status === "delivered" || order.payment_status === "paid") && (
                                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            {order.items?.length || 0} รายการ
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="rounded-full"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                router.push(`/review?order=${order.order_number}`);
                                            }}
                                        >
                                            <Star className="h-4 w-4 mr-1" />
                                            เขียนรีวิว
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        </Link>
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
                        เลือกซื้อสินค้า
                    </Button>
                </Card>
            )}
        </div>
    );
}
