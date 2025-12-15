"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tag, Percent, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function NewCouponPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        code: "",
        description: "",
        discountType: "percentage" as "percentage" | "fixed",
        discountValue: "",
        minPurchase: "",
        maxDiscount: "",
        usageLimit: "",
        perCustomerLimit: "1",
        expiresAt: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    code: form.code,
                    description: form.description || null,
                    discountType: form.discountType,
                    discountValue: parseFloat(form.discountValue),
                    minPurchase: form.minPurchase ? parseFloat(form.minPurchase) : 0,
                    maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : null,
                    usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
                    perCustomerLimit: parseInt(form.perCustomerLimit) || 1,
                    expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to create coupon");
            }

            router.push("/admin/coupons");
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
                    <Link href="/admin/coupons">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Create Coupon</h1>
                    <p className="text-muted-foreground">Add a new discount code</p>
                </div>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Coupon Code */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Coupon Code *
                        </label>
                        <Input
                            value={form.code}
                            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                            placeholder="e.g., SUMMER20"
                            className="font-mono uppercase"
                            required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            This is the code customers will enter at checkout
                        </p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Description
                        </label>
                        <Textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="e.g., Summer sale 20% off all items"
                            rows={2}
                        />
                    </div>

                    {/* Discount Type */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Discount Type *
                        </label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, discountType: "percentage" })}
                                className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                                    form.discountType === "percentage"
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-muted-foreground"
                                }`}
                            >
                                <Percent className="h-6 w-6 mx-auto mb-2" />
                                <p className="font-medium">Percentage</p>
                                <p className="text-xs text-muted-foreground">e.g., 10% off</p>
                            </button>
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, discountType: "fixed" })}
                                className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                                    form.discountType === "fixed"
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-muted-foreground"
                                }`}
                            >
                                <DollarSign className="h-6 w-6 mx-auto mb-2" />
                                <p className="font-medium">Fixed Amount</p>
                                <p className="text-xs text-muted-foreground">e.g., ฿100 off</p>
                            </button>
                        </div>
                    </div>

                    {/* Discount Value */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Discount Value *
                        </label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={form.discountValue}
                                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                                placeholder={form.discountType === "percentage" ? "10" : "100"}
                                min="0"
                                step="0.01"
                                required
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {form.discountType === "percentage" ? "%" : "฿"}
                            </span>
                        </div>
                    </div>

                    {/* Min Purchase & Max Discount */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Minimum Purchase
                            </label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={form.minPurchase}
                                    onChange={(e) => setForm({ ...form, minPurchase: e.target.value })}
                                    placeholder="0"
                                    min="0"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    ฿
                                </span>
                            </div>
                        </div>
                        {form.discountType === "percentage" && (
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Maximum Discount
                                </label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={form.maxDiscount}
                                        onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                                        placeholder="No limit"
                                        min="0"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        ฿
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Usage Limits */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Total Usage Limit
                            </label>
                            <Input
                                type="number"
                                value={form.usageLimit}
                                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                                placeholder="Unlimited"
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Per Customer Limit
                            </label>
                            <Input
                                type="number"
                                value={form.perCustomerLimit}
                                onChange={(e) => setForm({ ...form, perCustomerLimit: e.target.value })}
                                placeholder="1"
                                min="1"
                            />
                        </div>
                    </div>

                    {/* Expiry Date */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Expiry Date
                        </label>
                        <Input
                            type="datetime-local"
                            value={form.expiresAt}
                            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Leave empty for no expiration
                        </p>
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
                            {loading ? "Creating..." : "Create Coupon"}
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/admin/coupons">Cancel</Link>
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
