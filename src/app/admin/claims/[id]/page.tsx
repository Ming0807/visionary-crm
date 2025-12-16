"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, User, Package, Clock, CheckCircle, XCircle, MessageSquare, Loader2, Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface Claim {
    id: string;
    claim_type: string;
    status: string;
    reason: string;
    resolution_notes: string | null;
    created_at: string;
    updated_at: string;
    images: string[] | null;
    customer: {
        id: string;
        name: string | null;
        phone: string | null;
        email: string | null;
        line_user_id: string | null;
    } | null;
    order: {
        id: string;
        order_number: string;
        total_amount: number;
    } | null;
}

const STATUS_OPTIONS = [
    { value: "pending", label: "รอดำเนินการ", color: "bg-yellow-100 text-yellow-700" },
    { value: "investigating", label: "กำลังตรวจสอบ", color: "bg-blue-100 text-blue-700" },
    { value: "resolved", label: "แก้ไขแล้ว", color: "bg-green-100 text-green-700" },
    { value: "rejected", label: "ปฏิเสธ", color: "bg-red-100 text-red-700" },
];

const CLAIM_TYPE_LABELS: Record<string, string> = {
    return: "ขอคืนสินค้า",
    exchange: "ขอเปลี่ยนสินค้า",
    refund: "ขอเงินคืน",
    warranty: "เคลมประกัน",
    complaint: "ร้องเรียน",
};

export default function ClaimDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { toast } = useToast();
    const [claim, setClaim] = useState<Claim | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [status, setStatus] = useState("");
    const [resolutionNotes, setResolutionNotes] = useState("");

    useEffect(() => {
        const fetchClaim = async () => {
            // First get the claim
            const { data: claimData, error: claimError } = await supabase
                .from("claims_returns")
                .select("*")
                .eq("id", resolvedParams.id)
                .single();

            if (claimError || !claimData) {
                console.error("Claim fetch error:", claimError);
                toast({ title: "ไม่พบข้อมูล Claim", variant: "destructive" });
                router.push("/admin/claims");
                return;
            }

            // Get customer if exists
            let customer = null;
            let lineUserId = null;
            if (claimData.customer_id) {
                const { data } = await supabase
                    .from("customers")
                    .select("id, name, phone, email")
                    .eq("id", claimData.customer_id)
                    .single();
                customer = data;

                // Get LINE user ID from social_identities
                if (data) {
                    const { data: socialData } = await supabase
                        .from("social_identities")
                        .select("social_user_id")
                        .eq("customer_id", claimData.customer_id)
                        .eq("platform", "line")
                        .single();
                    lineUserId = socialData?.social_user_id || null;
                }
            }

            // Get order if exists
            let order = null;
            if (claimData.order_id) {
                const { data } = await supabase
                    .from("orders")
                    .select("id, order_number, total_amount")
                    .eq("id", claimData.order_id)
                    .single();
                order = data;
            }

            setClaim({ 
                ...claimData, 
                customer: customer ? { ...customer, line_user_id: lineUserId } : null, 
                order 
            });
            setStatus(claimData.status);
            setResolutionNotes(claimData.resolution_notes || "");
            setIsLoading(false);
        };

        fetchClaim();
    }, [resolvedParams.id, router, toast]);

    const handleUpdate = async (notifyCustomer = false) => {
        if (!claim) return;
        setIsUpdating(true);

        try {
            // Update claim - only use existing columns
            const { error } = await supabase
                .from("claims_returns")
                .update({
                    status,
                    // Note: resolution_notes column doesn't exist in DB
                    // Add it to claims_returns table if needed
                    updated_at: new Date().toISOString(),
                })
                .eq("id", claim.id);

            if (error) throw error;

            // Notify customer via LINE if requested
            if (notifyCustomer && claim.customer?.line_user_id) {
                const statusLabel = STATUS_OPTIONS.find((s) => s.value === status)?.label || status;
                const message = [
                    "📋 อัพเดทสถานะเคลม",
                    "",
                    `หมายเลข: ${claim.id.slice(0, 8)}...`,
                    `สถานะ: ${statusLabel}`,
                    resolutionNotes ? `หมายเหตุ: ${resolutionNotes}` : "",
                    "",
                    "ขอบคุณที่ใช้บริการครับ 🙏"
                ].filter(Boolean).join("\n");

                console.log("Sending LINE notify to:", claim.customer.line_user_id);
                console.log("Message:", message);

                const notifyRes = await fetch("/api/notify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId: claim.customer.line_user_id,
                        message,
                    }),
                });

                const notifyResult = await notifyRes.json().catch(() => ({}));
                console.log("Notify result:", notifyResult);
                
                if (notifyRes.ok) {
                    toast({ title: "อัพเดทและแจ้งลูกค้าแล้ว! ✅" });
                } else {
                    toast({ title: "อัพเดทแล้ว แต่ส่ง LINE ไม่สำเร็จ", variant: "destructive" });
                }
            } else {
                toast({ title: "อัพเดทสำเร็จ!" });
            }

            // Refresh data
            router.refresh();
        } catch (error) {
            console.error("Update error:", error);
            toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!claim) return null;

    const statusConfig = STATUS_OPTIONS.find((s) => s.value === claim.status);

    return (
        <div className="p-6 lg:p-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="h-6 w-6" />
                        Claim Detail
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {formatDate(claim.created_at)}
                    </p>
                </div>
                <Badge className={statusConfig?.color}>
                    {statusConfig?.label || claim.status}
                </Badge>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Claim Info */}
                    <Card className="p-6">
                        <h2 className="font-semibold mb-4">รายละเอียดเคลม</h2>
                        <div className="space-y-4">
                            <div>
                                <span className="text-sm text-muted-foreground">ประเภท</span>
                                <p className="font-medium">{CLAIM_TYPE_LABELS[claim.claim_type] || claim.claim_type}</p>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">เหตุผล</span>
                                <p className="bg-muted p-4 rounded-lg mt-1">{claim.reason}</p>
                            </div>
                            {claim.images && claim.images.length > 0 && (
                                <div>
                                    <span className="text-sm text-muted-foreground">รูปภาพแนบ</span>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {claim.images.map((img, i) => (
                                            <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                                                <img src={img} alt={`Claim image ${i + 1}`} className="rounded-lg aspect-square object-cover border" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Update Status */}
                    <Card className="p-6">
                        <h2 className="font-semibold mb-4">จัดการเคลม</h2>
                        <div className="space-y-4">
                            <div>
                                <Label>สถานะ</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map((s) => (
                                            <SelectItem key={s.value} value={s.value}>
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>หมายเหตุการดำเนินการ</Label>
                                <Textarea
                                    value={resolutionNotes}
                                    onChange={(e) => setResolutionNotes(e.target.value)}
                                    placeholder="บันทึกการดำเนินการ..."
                                    rows={4}
                                />
                            </div>
                            <div className="flex gap-3">
                                <Button onClick={() => handleUpdate(false)} disabled={isUpdating}>
                                    {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                    บันทึก
                                </Button>
                                {claim.customer?.line_user_id && (
                                    <Button 
                                        variant="outline" 
                                        onClick={() => handleUpdate(true)} 
                                        disabled={isUpdating}
                                        className="text-green-600 border-green-600 hover:bg-green-50"
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        บันทึกและแจ้ง LINE
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right - Customer & Order */}
                <div className="space-y-6">
                    {/* Customer */}
                    <Card className="p-6">
                        <h2 className="font-semibold mb-4 flex items-center gap-2">
                            <User className="h-5 w-5" />
                            ลูกค้า
                        </h2>
                        {claim.customer ? (
                            <div className="space-y-2">
                                <Link
                                    href={`/admin/customers/${claim.customer.id}`}
                                    className="font-medium text-primary hover:underline"
                                >
                                    {claim.customer.name || "ไม่ระบุชื่อ"}
                                </Link>
                                <p className="text-sm text-muted-foreground">{claim.customer.phone}</p>
                                <p className="text-sm text-muted-foreground">{claim.customer.email}</p>
                                {claim.customer.line_user_id && (
                                    <Badge variant="outline" className="text-green-600">
                                        <MessageSquare className="h-3 w-3 mr-1" />
                                        LINE Connected
                                    </Badge>
                                )}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">ไม่พบข้อมูลลูกค้า</p>
                        )}
                    </Card>

                    {/* Order */}
                    {claim.order && (
                        <Card className="p-6">
                            <h2 className="font-semibold mb-4 flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                คำสั่งซื้อ
                            </h2>
                            <div className="space-y-2">
                                <Link
                                    href={`/admin/orders/${claim.order.id}`}
                                    className="font-mono text-primary hover:underline"
                                >
                                    {claim.order.order_number}
                                </Link>
                                <p className="text-lg font-bold">
                                    ฿{claim.order.total_amount.toLocaleString()}
                                </p>
                            </div>
                        </Card>
                    )}

                    {/* Timeline */}
                    <Card className="p-6">
                        <h2 className="font-semibold mb-4 flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Timeline
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                                <div>
                                    <p className="font-medium">สร้างเคลม</p>
                                    <p className="text-muted-foreground">{formatDate(claim.created_at)}</p>
                                </div>
                            </div>
                            {claim.updated_at !== claim.created_at && (
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                                    <div>
                                        <p className="font-medium">อัพเดทล่าสุด</p>
                                        <p className="text-muted-foreground">{formatDate(claim.updated_at)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
