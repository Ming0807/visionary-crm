"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Gift, RefreshCw, Clock, Megaphone, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface PageProps {
    params: Promise<{ id: string }>;
}

interface Coupon {
    id: string;
    code: string;
    discount_type: string;
    discount_value: number;
}

interface Campaign {
    id: string;
    name: string;
    description: string | null;
    campaign_type: string;
    message_template: string;
    coupon_id: string | null;
    schedule_type: string;
    status: string;
    total_sent: number;
    total_opened: number;
    total_clicked: number;
    created_at: string;
    last_run_at: string | null;
}

const CAMPAIGN_TYPES = [
    { value: "birthday", label: "Birthday", icon: Gift, description: "วันเกิดลูกค้า" },
    { value: "re_engagement", label: "Re-engagement", icon: RefreshCw, description: "ดึงลูกค้าเก่ากลับ" },
    { value: "point_expiration", label: "Point Expiration", icon: Clock, description: "แต้มใกล้หมดอายุ" },
    { value: "promotion", label: "Promotion", icon: Megaphone, description: "โปรโมชั่น" },
    { value: "custom", label: "Custom", icon: Send, description: "กำหนดเอง" },
];

const SCHEDULE_TYPES = [
    { value: "manual", label: "ส่งเอง" },
    { value: "daily", label: "รายวัน" },
    { value: "weekly", label: "รายสัปดาห์" },
    { value: "monthly", label: "รายเดือน" },
];

export default function EditCampaignPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [error, setError] = useState("");
    const [campaign, setCampaign] = useState<Campaign | null>(null);

    const [form, setForm] = useState({
        name: "",
        description: "",
        campaignType: "birthday",
        messageTemplate: "",
        couponId: "",
        scheduleType: "manual",
        status: "draft",
    });

    useEffect(() => {
        fetchCampaign();
        fetchCoupons();
    }, [id]);

    const fetchCampaign = async () => {
        try {
            const res = await fetch(`/api/campaigns/${id}`);
            if (!res.ok) throw new Error("Campaign not found");
            const data = await res.json();
            setCampaign(data);
            setForm({
                name: data.name || "",
                description: data.description || "",
                campaignType: data.campaign_type || "birthday",
                messageTemplate: data.message_template || "",
                couponId: data.coupon_id || "",
                scheduleType: data.schedule_type || "manual",
                status: data.status || "draft",
            });
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCoupons = async () => {
        const res = await fetch("/api/coupons?active=true");
        const data = await res.json();
        setCoupons(data || []);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const res = await fetch(`/api/campaigns/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update campaign");
            }

            router.push("/admin/campaigns");
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("คุณแน่ใจว่าต้องการลบแคมเปญนี้?")) return;
        
        setDeleting(true);
        try {
            const res = await fetch(`/api/campaigns/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");
            router.push("/admin/campaigns");
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
                <p>กำลังโหลด...</p>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="p-6 lg:p-8">
                <p className="text-red-600">ไม่พบแคมเปญ</p>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/campaigns">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">แก้ไขแคมเปญ</h1>
                        <p className="text-muted-foreground">{campaign.name}</p>
                    </div>
                </div>
                <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleting ? "กำลังลบ..." : "ลบแคมเปญ"}
                </Button>
            </div>

            {/* Stats Summary */}
            <Card className="p-4 mb-6">
                <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold">{campaign.total_sent}</p>
                        <p className="text-xs text-muted-foreground">ส่งแล้ว</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-blue-600">{campaign.total_opened}</p>
                        <p className="text-xs text-muted-foreground">เปิดอ่าน</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-green-600">{campaign.total_clicked}</p>
                        <p className="text-xs text-muted-foreground">คลิก</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-purple-600">
                            {campaign.total_sent > 0 ? Math.round((campaign.total_opened / campaign.total_sent) * 100) : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">อัตราเปิดอ่าน</p>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Status */}
                    <div className="flex items-center justify-between pb-4 border-b">
                        <label className="text-sm font-medium">สถานะ</label>
                        <div className="flex gap-2">
                            {["draft", "active", "paused"].map((status) => (
                                <Button
                                    key={status}
                                    type="button"
                                    variant={form.status === status ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setForm({ ...form, status })}
                                >
                                    {status === "draft" && "แบบร่าง"}
                                    {status === "active" && "เปิดใช้งาน"}
                                    {status === "paused" && "หยุดชั่วคราว"}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Campaign Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">ชื่อแคมเปญ *</label>
                        <Input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">คำอธิบาย</label>
                        <Input
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    {/* Campaign Type */}
                    <div>
                        <label className="block text-sm font-medium mb-2">ประเภทแคมเปญ</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            {CAMPAIGN_TYPES.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setForm({ ...form, campaignType: type.value })}
                                        className={`p-3 rounded-xl border-2 text-center transition-colors ${
                                            form.campaignType === type.value
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-muted-foreground"
                                        }`}
                                    >
                                        <Icon className="h-5 w-5 mx-auto mb-1" />
                                        <p className="text-xs font-medium">{type.label}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Message Template */}
                    <div>
                        <label className="block text-sm font-medium mb-2">ข้อความ *</label>
                        <Textarea
                            value={form.messageTemplate}
                            onChange={(e) => setForm({ ...form, messageTemplate: e.target.value })}
                            rows={4}
                            required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            ใช้ {"{{name}}"} แทนชื่อลูกค้า, {"{{points}}"} แทนแต้มสะสม
                        </p>
                    </div>

                    {/* Coupon */}
                    <div>
                        <label className="block text-sm font-medium mb-2">คูปอง</label>
                        <select
                            value={form.couponId}
                            onChange={(e) => setForm({ ...form, couponId: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                        >
                            <option value="">ไม่แนบคูปอง</option>
                            {coupons.map((coupon) => (
                                <option key={coupon.id} value={coupon.id}>
                                    {coupon.code} - {coupon.discount_type === "percentage" 
                                        ? `${coupon.discount_value}%` 
                                        : `฿${coupon.discount_value}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Schedule */}
                    <div>
                        <label className="block text-sm font-medium mb-2">ตั้งเวลา</label>
                        <div className="flex gap-2">
                            {SCHEDULE_TYPES.map((schedule) => (
                                <Button
                                    key={schedule.value}
                                    type="button"
                                    variant={form.scheduleType === schedule.value ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setForm({ ...form, scheduleType: schedule.value })}
                                >
                                    {schedule.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex gap-3 pt-4 border-t">
                        <Button type="submit" disabled={saving} className="flex-1">
                            {saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/admin/campaigns">ยกเลิก</Link>
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
