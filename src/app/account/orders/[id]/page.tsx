"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Loader2, Truck, CreditCard, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

interface OrderItem {
    id: string;
    quantity: number;
    price_per_unit: number;
    product_name_snapshot: string;
    sku_snapshot: string;
    variant_id: string | null;
    image_url?: string;
}

interface Order {
    id: string;
    order_number: string;
    total_amount: number;
    subtotal: number;
    shipping_cost: number;
    discount_amount: number;
    payment_status: string;
    fulfillment_status: string;
    tracking_number: string | null;
    shipping_carrier: string | null;
    shipping_address: {
        name?: string;
        line1?: string;
        city?: string;
        zip?: string;
    } | null;
    created_at: string;
    items: OrderItem[];
}

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { isLoggedIn, isLoading: authLoading, customer } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            router.push("/");
        }
    }, [authLoading, isLoggedIn, router]);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!customer?.id || !id) return;

            const { data: orderData, error: orderError } = await supabase
                .from("orders")
                .select(`
                    id,
                    order_number,
                    total_amount,
                    subtotal,
                    shipping_cost,
                    discount_amount,
                    payment_status,
                    fulfillment_status,
                    tracking_number,
                    shipping_carrier,
                    shipping_address,
                    created_at
                `)
                .eq("id", id)
                .eq("customer_id", customer.id)
                .single();

            if (orderError || !orderData) {
                console.error("Order fetch error:", orderError);
                router.push("/account/orders");
                return;
            }

            // Fetch items with variant_id
            const { data: items } = await supabase
                .from("order_items")
                .select("id, quantity, price_per_unit, product_name_snapshot, sku_snapshot, variant_id")
                .eq("order_id", id);

            // Fetch variant images for each item
            let itemsWithImages = items || [];
            if (items && items.length > 0) {
                const variantIds = items.filter(i => i.variant_id).map(i => i.variant_id);
                if (variantIds.length > 0) {
                    const { data: variants } = await supabase
                        .from("product_variants")
                        .select("id, images")
                        .in("id", variantIds);
                    
                    const variantMap = new Map(variants?.map(v => [v.id, v.images]) || []);
                    itemsWithImages = items.map(item => ({
                        ...item,
                        image_url: item.variant_id ? (variantMap.get(item.variant_id)?.[0] || null) : null
                    }));
                }
            }

            setOrder({
                ...orderData,
                items: itemsWithImages,
            } as Order);
            setLoading(false);
        };

        if (customer?.id) fetchOrder();
    }, [customer?.id, id, router]);

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

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold mb-2">ไม่พบคำสั่งซื้อ</h1>
                <Button onClick={() => router.push("/account/orders")}>
                    กลับหน้ารายการ
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.push("/account/orders")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-xl font-bold">{order.order_number}</h1>
                    <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                </div>
            </div>

            {/* Status */}
            <Card className="p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">สถานะชำระเงิน</p>
                            <Badge className={getStatusColor(order.payment_status)}>
                                {getStatusLabel(order.payment_status)}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Truck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">สถานะจัดส่ง</p>
                            <Badge className={getStatusColor(order.fulfillment_status)}>
                                {getStatusLabel(order.fulfillment_status)}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Tracking */}
                {order.tracking_number && (
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">Tracking Number</p>
                        <p className="font-mono font-medium">
                            {order.shipping_carrier && <span className="text-muted-foreground">{order.shipping_carrier}: </span>}
                            {order.tracking_number}
                        </p>
                    </div>
                )}
            </Card>

            {/* Items */}
            <Card className="p-4 mb-6">
                <h2 className="font-semibold mb-4">รายการสินค้า</h2>
                <div className="space-y-4">
                    {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                            <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                                {item.image_url ? (
                                    <Image
                                        src={item.image_url}
                                        alt={item.product_name_snapshot}
                                        width={64}
                                        height={64}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-medium line-clamp-1">
                                    {item.product_name_snapshot}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    จำนวน: {item.quantity}
                                </p>
                            </div>
                            <p className="font-medium text-primary">
                                {formatPrice(item.price_per_unit * item.quantity)}
                            </p>
                        </div>
                    ))}
                </div>

                <Separator className="my-4" />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">ราคาสินค้า</span>
                        <span>{formatPrice(order.subtotal || order.total_amount)}</span>
                    </div>
                    {order.shipping_cost > 0 && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">ค่าจัดส่ง</span>
                            <span>{formatPrice(order.shipping_cost)}</span>
                        </div>
                    )}
                    {order.discount_amount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>ส่วนลด</span>
                            <span>-{formatPrice(order.discount_amount)}</span>
                        </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                        <span>รวมทั้งหมด</span>
                        <span className="text-primary">{formatPrice(order.total_amount)}</span>
                    </div>
                </div>
            </Card>

            {/* Shipping Address */}
            {order.shipping_address && (
                <Card className="p-4 mb-6">
                    <h2 className="font-semibold mb-2">ที่อยู่จัดส่ง</h2>
                    <p className="text-sm text-muted-foreground">
                        {order.shipping_address.name && <span className="font-medium text-foreground">{order.shipping_address.name}<br /></span>}
                        {order.shipping_address.line1}<br />
                        {order.shipping_address.city} {order.shipping_address.zip}
                    </p>
                </Card>
            )}

            {/* Review Button */}
            {order.payment_status === "paid" && (
                <Button asChild className="w-full rounded-full">
                    <Link href={`/review?order=${order.order_number}`}>
                        <Star className="mr-2 h-4 w-4" />
                        เขียนรีวิวสินค้า
                    </Link>
                </Button>
            )}
        </div>
    );
}
