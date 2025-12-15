"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Gift, RefreshCw, Clock, Megaphone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Coupon {
    id: string;
    code: string;
    discount_type: string;
    discount_value: number;
}

const CAMPAIGN_TYPES = [
    { value: "birthday", label: "Birthday", icon: Gift, description: "Auto-send on customer birthdays" },
    { value: "re_engagement", label: "Re-engagement", icon: RefreshCw, description: "Target inactive customers" },
    { value: "point_expiration", label: "Point Expiration", icon: Clock, description: "Alert expiring points" },
    { value: "promotion", label: "Promotion", icon: Megaphone, description: "Manual promo campaign" },
    { value: "custom", label: "Custom", icon: Send, description: "Custom message campaign" },
];

const SCHEDULE_TYPES = [
    { value: "manual", label: "Manual" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
];

export default function NewCampaignPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        name: "",
        description: "",
        campaignType: "birthday",
        messageTemplate: "",
        couponId: "",
        scheduleType: "manual",
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        const res = await fetch("/api/coupons?active=true");
        const data = await res.json();
        setCoupons(data || []);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/campaigns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create campaign");
            }

            router.push("/admin/campaigns");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 lg:p-8 max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/campaigns">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Create Campaign</h1>
                    <p className="text-muted-foreground">Set up an automated marketing campaign</p>
                </div>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campaign Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Campaign Name *</label>
                        <Input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g., Birthday Special Discount"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <Input
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Brief description of the campaign"
                        />
                    </div>

                    {/* Campaign Type */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Campaign Type *</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {CAMPAIGN_TYPES.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setForm({ ...form, campaignType: type.value })}
                                        className={`p-4 rounded-xl border-2 text-left transition-colors ${
                                            form.campaignType === type.value
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-muted-foreground"
                                        }`}
                                    >
                                        <Icon className="h-5 w-5 mb-2" />
                                        <p className="font-medium text-sm">{type.label}</p>
                                        <p className="text-xs text-muted-foreground">{type.description}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Message Template */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Message Template *</label>
                        <Textarea
                            value={form.messageTemplate}
                            onChange={(e) => setForm({ ...form, messageTemplate: e.target.value })}
                            placeholder="สุขสันต์วันเกิด คุณ{{name}} 🎂 รับส่วนลดพิเศษ..."
                            rows={4}
                            required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            ใช้ {"{{name}}"} แทนชื่อลูกค้า, {"{{points}}"} แทนแต้มสะสม
                        </p>
                    </div>

                    {/* Coupon */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Attach Coupon (Optional)</label>
                        <select
                            value={form.couponId}
                            onChange={(e) => setForm({ ...form, couponId: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                        >
                            <option value="">No coupon</option>
                            {coupons.map((coupon) => (
                                <option key={coupon.id} value={coupon.id}>
                                    {coupon.code} - {coupon.discount_type === "percentage" 
                                        ? `${coupon.discount_value}%` 
                                        : `฿${coupon.discount_value}`} off
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Schedule */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Schedule</label>
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
                    <div className="flex gap-3">
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? "Creating..." : "Create Campaign"}
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/admin/campaigns">Cancel</Link>
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
