"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";

interface Order {
    id: string;
    order_number: string;
    total_amount: number;
    created_at: string;
    fulfillment_status: string;
    items: Array<{
        product_name_snapshot: string;
    }>;
}

const claimTypes = [
    { value: "return", label: "ขอคืนสินค้า" },
    { value: "exchange", label: "ขอเปลี่ยนสินค้า" },
    { value: "warranty", label: "เคลมประกัน" },
    { value: "complaint", label: "ร้องเรียน" },
];

const reasons = [
    { value: "defective", label: "สินค้าชำรุด/ใช้งานไม่ได้" },
    { value: "wrong_item", label: "ได้รับสินค้าผิดรายการ" },
    { value: "not_as_described", label: "สินค้าไม่ตรงตามรายละเอียด" },
    { value: "damaged_shipping", label: "เสียหายจากการขนส่ง" },
    { value: "change_mind", label: "เปลี่ยนใจ" },
    { value: "other", label: "อื่นๆ" },
];

const WARRANTY_DAYS = 365; // 1 year warranty
const RETURN_DAYS = 7; // 7 days return policy

export default function ClaimsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { isLoggedIn, isLoading: authLoading, customer } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const [formData, setFormData] = useState({
        orderId: "",
        phone: "",
        claimType: "return",
        reason: "",
        description: "",
    });

    // Pre-fill phone from customer
    useEffect(() => {
        if (customer?.phone) {
            setFormData((prev) => ({ ...prev, phone: customer.phone ?? "" }));
        }
    }, [customer]);

    // Fetch orders for logged-in customer
    useEffect(() => {
        if (customer?.id) {
            fetchOrders();
        }
    }, [customer]);

    const fetchOrders = async () => {
        if (!customer?.id) return;
        setOrdersLoading(true);
        try {
            const { data, error } = await supabase
                .from("orders")
                .select(`
                    id,
                    order_number,
                    total_amount,
                    created_at,
                    fulfillment_status,
                    items:order_items(product_name_snapshot)
                `)
                .eq("customer_id", customer.id)
                .order("created_at", { ascending: false });
            
            console.log("Fetched orders:", data, error);

            setOrders(data || []);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setOrdersLoading(false);
        }
    };

    const getDaysSincePurchase = (dateStr: string) => {
        const purchaseDate = new Date(dateStr);
        const now = new Date();
        return Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
    };

    const canReturn = (dateStr: string) => getDaysSincePurchase(dateStr) <= RETURN_DAYS;
    const canWarranty = (dateStr: string) => getDaysSincePurchase(dateStr) <= WARRANTY_DAYS;

    const handleOrderSelect = (orderId: string) => {
        const order = orders.find((o) => o.id === orderId);
        setSelectedOrder(order || null);
        setFormData((prev) => ({ ...prev, orderId }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/claims", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: formData.orderId,
                    orderNumber: selectedOrder?.order_number,
                    phone: formData.phone,
                    claimType: formData.claimType,
                    reason: formData.reason,
                    description: formData.description,
                    customerId: customer?.id,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to submit claim");
            }

            toast({
                title: "ส่งเรื่องสำเร็จ! ✅",
                description: "ทีมงานจะติดต่อกลับภายใน 1-2 วันทำการ",
            });

            router.push("/claims/success");
        } catch (error) {
            console.error("Claim error:", error);
            toast({
                title: "เกิดข้อผิดพลาด",
                description: error instanceof Error ? error.message : "กรุณาลองใหม่อีกครั้ง",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                    แจ้งเคลม / คืนสินค้า
                </h1>
                <p className="text-muted-foreground">
                    {isLoggedIn
                        ? "เลือกคำสั่งซื้อที่ต้องการเคลม"
                        : "กรอกข้อมูลเพื่อแจ้งเรื่องร้องเรียน"}
                </p>
            </div>

            <div className="bg-card rounded-2xl p-6 lg:p-8 border border-border">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Order Selection (for logged-in users) */}
                    {isLoggedIn && orders.length > 0 && (
                        <div className="space-y-2">
                            <Label>เลือกคำสั่งซื้อ *</Label>
                            <Select
                                value={formData.orderId}
                                onValueChange={handleOrderSelect}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="เลือกคำสั่งซื้อที่ต้องการเคลม" />
                                </SelectTrigger>
                                <SelectContent>
                                    {orders.map((order) => {
                                        const days = getDaysSincePurchase(order.created_at);
                                        const inWarranty = canWarranty(order.created_at);
                                        const inReturn = canReturn(order.created_at);
                                        const productNames = order.items
                                            .map((i) => i.product_name_snapshot)
                                            .slice(0, 2)
                                            .join(", ");

                                        return (
                                            <SelectItem key={order.id} value={order.id}>
                                                <div className="flex flex-col py-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono">{order.order_number}</span>
                                                        {inReturn && (
                                                            <Badge className="bg-green-100 text-green-700 text-xs">
                                                                คืนได้
                                                            </Badge>
                                                        )}
                                                        {inWarranty && !inReturn && (
                                                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                                                                ในประกัน
                                                            </Badge>
                                                        )}
                                                        {!inWarranty && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                หมดประกัน
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <span className="text-sm text-muted-foreground truncate max-w-xs">
                                                        {productNames} • {days} วันที่แล้ว
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>

                            {/* Order Info */}
                            {selectedOrder && (
                                <div className="p-4 bg-muted/50 rounded-lg mt-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-mono font-medium">{selectedOrder.order_number}</span>
                                        <span className="font-bold">
                                            ฿{selectedOrder.total_amount.toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        สั่งเมื่อ: {new Date(selectedOrder.created_at).toLocaleDateString("th-TH", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        {canReturn(selectedOrder.created_at) ? (
                                            <div className="flex items-center gap-1 text-sm text-green-600">
                                                <CheckCircle className="h-4 w-4" />
                                                คืนสินค้าได้ (ภายใน 7 วัน)
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <AlertCircle className="h-4 w-4" />
                                                เลยกำหนดคืนสินค้า
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                        {canWarranty(selectedOrder.created_at) ? (
                                            <div className="flex items-center gap-1 text-sm text-blue-600">
                                                <CheckCircle className="h-4 w-4" />
                                                อยู่ในระยะประกัน 1 ปี
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <AlertCircle className="h-4 w-4" />
                                                หมดประกัน
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Order Number (for guests) */}
                    {(!isLoggedIn || orders.length === 0) && (
                        <div className="space-y-2">
                            <Label htmlFor="orderNumber">หมายเลขคำสั่งซื้อ *</Label>
                            <Input
                                id="orderNumber"
                                value={formData.orderId}
                                onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                                placeholder="INV-20241213-001"
                                required
                            />
                        </div>
                    )}

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
                        <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="081-234-5678"
                            required
                        />
                        {customer?.phone && (
                            <p className="text-xs text-muted-foreground">
                                เบอร์โทรจากบัญชีของคุณ (แก้ไขได้)
                            </p>
                        )}
                    </div>

                    {/* Claim Type */}
                    <div className="space-y-2">
                        <Label>ประเภทการแจ้ง *</Label>
                        <Select
                            value={formData.claimType}
                            onValueChange={(value) => setFormData({ ...formData, claimType: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {claimTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label>สาเหตุ *</Label>
                        <Select
                            value={formData.reason}
                            onValueChange={(value) => setFormData({ ...formData, reason: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="เลือกสาเหตุ" />
                            </SelectTrigger>
                            <SelectContent>
                                {reasons.map((reason) => (
                                    <SelectItem key={reason.value} value={reason.value}>
                                        {reason.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">รายละเอียดเพิ่มเติม</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="กรุณาอธิบายปัญหาหรือเหตุผลเพิ่มเติม..."
                            rows={4}
                        />
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting || !formData.phone || !formData.reason || (!formData.orderId && isLoggedIn && orders.length > 0)}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                กำลังส่ง...
                            </>
                        ) : (
                            "ส่งเรื่องร้องเรียน"
                        )}
                    </Button>
                </form>
            </div>

            {/* Info Box */}
            <div className="mt-6 p-4 bg-muted/50 rounded-xl text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">นโยบาย:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>คืนสินค้า: ภายใน 7 วันหลังจากได้รับสินค้า</li>
                    <li>ประกันสินค้า: 1 ปี (ยกเว้นความเสียหายจากการใช้งาน)</li>
                    <li>ทีมงานจะติดต่อกลับภายใน 1-2 วันทำการ</li>
                </ul>
            </div>
        </div>
    );
}
