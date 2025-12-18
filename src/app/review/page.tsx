"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Star, CheckCircle, Package, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface OrderItem {
    id: string;
    product_name_snapshot: string;
    sku_snapshot: string;
    variant_id?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variant?: any;
}

interface Order {
    id: string;
    order_number: string;
    total_amount: number;
    created_at: string;
    items: OrderItem[];
}

export default function ReviewPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderNumber = searchParams.get("order");
    const { isLoggedIn, isLoading: authLoading, customer } = useAuth();
    const { toast } = useToast();
    
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<OrderItem | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (orderNumber && customer?.id) {
            fetchOrder();
        } else if (!authLoading && !isLoggedIn) {
            router.push("/");
        }
    }, [orderNumber, customer?.id, authLoading, isLoggedIn]);

    const fetchOrder = async () => {
        if (!orderNumber || !customer?.id) return;
        
        try {
            // Fetch order first
            const { data: orderData, error } = await supabase
                .from("orders")
                .select("id, order_number, total_amount, created_at")
                .eq("order_number", orderNumber)
                .eq("customer_id", customer.id)
                .eq("payment_status", "paid")
                .single();

            if (error || !orderData) {
                toast({
                    title: "ไม่พบคำสั่งซื้อ",
                    description: "กรุณาตรวจสอบหมายเลขคำสั่งซื้อ",
                    variant: "destructive",
                });
                router.push("/account/orders");
                return;
            }

            // Fetch items separately
            const { data: items } = await supabase
                .from("order_items")
                .select("id, product_name_snapshot, sku_snapshot, variant_id")
                .eq("order_id", orderData.id);

            // Fetch variant images
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
                        variant: item.variant_id ? { images: variantMap.get(item.variant_id) || [] } : null
                    }));
                }
            }

            setOrder({ ...orderData, items: itemsWithImages });
            if (itemsWithImages.length > 0) {
                setSelectedProduct(itemsWithImages[0]);
            }
        } catch (error) {
            console.error("Error fetching order:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!customer || !selectedProduct) return;
        
        setSubmitting(true);
        try {
            const productName = selectedProduct.product_name_snapshot || 
                               selectedProduct.variant?.product?.name || "";
            
            const res = await fetch("/api/testimonials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer_id: customer.id,
                    customer_name: customer.name || "ลูกค้า",
                    avatar_url: customer.profileImageUrl || "",
                    rating,
                    comment,
                    product_name: productName,
                    is_featured: false,
                    is_active: false, // Needs admin approval
                }),
            });

            if (!res.ok) throw new Error("Failed to submit");

            setSubmitted(true);
            toast({
                title: "ขอบคุณสำหรับรีวิว! 🎉",
                description: "รีวิวของคุณจะแสดงหลังจากได้รับการอนุมัติ",
            });
        } catch (error) {
            toast({
                title: "เกิดข้อผิดพลาด",
                description: "ไม่สามารถส่งรีวิวได้ กรุณาลองใหม่",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-muted-foreground">กำลังโหลด...</p>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="container mx-auto px-4 py-16 text-center max-w-md">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-3">
                    ขอบคุณสำหรับรีวิว! 🎉
                </h1>
                <p className="text-muted-foreground mb-6">
                    รีวิวของคุณจะแสดงบนเว็บไซต์หลังจากได้รับการอนุมัติจากทีมงาน
                </p>
                <div className="flex flex-col gap-3">
                    <Button onClick={() => router.push("/products")} className="rounded-full">
                        ช้อปปิ้งต่อ
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/account")} className="rounded-full">
                        กลับหน้าบัญชี
                    </Button>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">ไม่พบคำสั่งซื้อ</h1>
                <p className="text-muted-foreground mb-6">กรุณาล็อกอินและตรวจสอบหมายเลขคำสั่งซื้อ</p>
                <Button onClick={() => router.push("/account/orders")}>
                    ดูคำสั่งซื้อทั้งหมด
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                    เขียนรีวิวสินค้า
                </h1>
                <p className="text-muted-foreground">
                    ขอบคุณที่เลือกซื้อสินค้ากับเรา! แบ่งปันประสบการณ์ของคุณให้คนอื่นได้รู้
                </p>
            </div>

            {/* Order Info */}
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
                <p className="text-sm text-muted-foreground">
                    คำสั่งซื้อ: <span className="font-medium text-foreground">{order.order_number}</span>
                </p>
            </div>

            {/* Product Selection */}
            {order.items.length > 1 && (
                <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">
                        เลือกสินค้าที่ต้องการรีวิว
                    </label>
                    <div className="grid gap-2">
                        {order.items.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setSelectedProduct(item)}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                    selectedProduct?.id === item.id
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary/50"
                                }`}
                            >
                                <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                                    {item.variant?.images?.[0] ? (
                                        <Image
                                            src={item.variant.images[0]}
                                            alt=""
                                            width={48}
                                            height={48}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                <span className="text-sm font-medium text-left">
                                    {item.product_name_snapshot || item.variant?.product?.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Selected Product Preview */}
            {selectedProduct && order.items.length === 1 && (
                <div className="flex items-center gap-4 p-4 bg-card rounded-xl border mb-6">
                    <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {selectedProduct.variant?.images?.[0] ? (
                            <Image
                                src={selectedProduct.variant.images[0]}
                                alt=""
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
                    <div>
                        <p className="font-medium">
                            {selectedProduct.product_name_snapshot || selectedProduct.variant?.product?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {selectedProduct.variant?.product?.brand}
                        </p>
                    </div>
                </div>
            )}

            {/* Rating */}
            <div className="mb-6">
                <label className="text-sm font-medium mb-3 block">ให้คะแนนสินค้า</label>
                <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 transition-transform hover:scale-110"
                        >
                            <Star
                                className={`h-10 w-10 ${
                                    star <= rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                }`}
                            />
                        </button>
                    ))}
                </div>
                <p className="text-center text-sm text-muted-foreground mt-2">
                    {rating === 5 && "ยอดเยี่ยมมาก! ⭐"}
                    {rating === 4 && "ดีมาก 👍"}
                    {rating === 3 && "พอใช้"}
                    {rating === 2 && "ควรปรับปรุง"}
                    {rating === 1 && "ไม่พอใจ"}
                </p>
            </div>

            {/* Comment */}
            <div className="mb-8">
                <label className="text-sm font-medium mb-2 block">
                    เขียนรีวิว (ไม่บังคับ)
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="แบ่งปันประสบการณ์การใช้งานสินค้า..."
                    rows={4}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
            </div>

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                disabled={submitting || !selectedProduct}
                className="w-full h-14 rounded-full text-lg"
            >
                {submitting ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        กำลังส่ง...
                    </>
                ) : (
                    "ส่งรีวิว"
                )}
            </Button>

            {/* Skip */}
            <div className="text-center mt-4">
                <button
                    onClick={() => router.push("/account")}
                    className="text-sm text-muted-foreground hover:text-foreground"
                >
                    ข้ามไปก่อน
                </button>
            </div>
        </div>
    );
}
