"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Tag, Percent, DollarSign, Calendar, Users, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Coupon {
    id: string;
    code: string;
    description: string | null;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    min_purchase: number;
    max_discount: number | null;
    usage_limit: number | null;
    usage_count: number;
    per_customer_limit: number;
    starts_at: string;
    expires_at: string | null;
    is_active: boolean;
    created_at: string;
}

export default function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "active" | "expired">("all");

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch("/api/coupons");
            const data = await res.json();
            setCoupons(data);
        } catch (error) {
            console.error("Failed to fetch coupons:", error);
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
        return new Date(date).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const isExpired = (coupon: Coupon) => {
        if (!coupon.expires_at) return false;
        return new Date(coupon.expires_at) < new Date();
    };

    const getUsagePercent = (coupon: Coupon) => {
        if (!coupon.usage_limit) return 0;
        return Math.min(100, (coupon.usage_count / coupon.usage_limit) * 100);
    };

    const filteredCoupons = coupons.filter((coupon) => {
        if (filter === "active") return coupon.is_active && !isExpired(coupon);
        if (filter === "expired") return isExpired(coupon) || !coupon.is_active;
        return true;
    });

    if (loading) {
        return (
            <div className="p-6 lg:p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-48"></div>
                    <div className="grid gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-muted rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Coupons</h1>
                    <p className="text-muted-foreground">
                        Manage discount codes and promotions
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/coupons/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Coupon
                    </Link>
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                {["all", "active", "expired"].map((f) => (
                    <Button
                        key={f}
                        variant={filter === f ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter(f as typeof filter)}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Button>
                ))}
            </div>

            {/* Coupons Grid */}
            {filteredCoupons.length > 0 ? (
                <div className="grid gap-4">
                    {filteredCoupons.map((coupon) => (
                        <Card key={coupon.id} className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                {/* Left: Coupon Info */}
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${
                                        coupon.discount_type === "percentage"
                                            ? "bg-blue-100 text-blue-600"
                                            : "bg-green-100 text-green-600"
                                    }`}>
                                        {coupon.discount_type === "percentage" ? (
                                            <Percent className="h-6 w-6" />
                                        ) : (
                                            <DollarSign className="h-6 w-6" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg font-mono">
                                                {coupon.code}
                                            </h3>
                                            {!coupon.is_active || isExpired(coupon) ? (
                                                <Badge variant="secondary">Inactive</Badge>
                                            ) : (
                                                <Badge className="bg-green-100 text-green-700">Active</Badge>
                                            )}
                                        </div>
                                        <p className="text-muted-foreground text-sm">
                                            {coupon.description || "No description"}
                                        </p>
                                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Tag className="h-3 w-3" />
                                                {coupon.discount_type === "percentage"
                                                    ? `${coupon.discount_value}% off`
                                                    : `${formatPrice(coupon.discount_value)} off`}
                                            </span>
                                            {coupon.min_purchase > 0 && (
                                                <span>Min: {formatPrice(coupon.min_purchase)}</span>
                                            )}
                                            {coupon.max_discount && (
                                                <span>Max: {formatPrice(coupon.max_discount)}</span>
                                            )}
                                            {coupon.expires_at && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Expires: {formatDate(coupon.expires_at)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Usage Stats */}
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{coupon.usage_count}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {coupon.usage_limit ? `/ ${coupon.usage_limit}` : "uses"}
                                        </p>
                                        {coupon.usage_limit && (
                                            <div className="w-20 h-2 bg-muted rounded-full mt-1 overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full"
                                                    style={{ width: `${getUsagePercent(coupon)}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="p-12 text-center">
                    <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No coupons found</h3>
                    <p className="text-muted-foreground mb-4">
                        Create your first coupon to start offering discounts
                    </p>
                    <Button asChild>
                        <Link href="/admin/coupons/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Coupon
                        </Link>
                    </Button>
                </Card>
            )}
        </div>
    );
}
