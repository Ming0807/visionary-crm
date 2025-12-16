"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
    User, 
    Package, 
    Crown, 
    Star, 
    ChevronRight,
    Edit,
    Loader2,
    FileText,
    Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ProfileCompletion from "@/components/ProfileCompletion";

interface Order {
    id: string;
    order_number: string;
    total_amount: number;
    fulfillment_status: string;
    created_at: string;
}

export default function AccountPage() {
    const router = useRouter();
    const { isLoggedIn, isLoading, profile, customer, refreshCustomer } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [showProfileModal, setShowProfileModal] = useState(false);

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            router.push("/");
        }
    }, [isLoading, isLoggedIn, router]);

    useEffect(() => {
        if (customer?.id) {
            fetchOrders();
            // Show profile completion if incomplete
            if (customer.profileStatus === "incomplete") {
                setShowProfileModal(true);
            }
        }
    }, [customer]);

    const fetchOrders = async () => {
        if (!customer?.id) return;
        const { data } = await supabase
            .from("orders")
            .select("id, order_number, total_amount, fulfillment_status, created_at")
            .eq("customer_id", customer.id)
            .order("created_at", { ascending: false })
            .limit(5);
        if (data) setOrders(data);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("th-TH", {
            style: "currency",
            currency: "THB",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getTierColor = (tier: string) => {
        const colors: Record<string, string> = {
            bronze: "text-orange-600 bg-orange-100",
            silver: "text-gray-600 bg-gray-100",
            gold: "text-yellow-600 bg-yellow-100",
            platinum: "text-purple-600 bg-purple-100",
        };
        return colors[tier] || colors.bronze;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            delivered: "bg-green-100 text-green-700",
            shipped: "bg-blue-100 text-blue-700",
            packing: "bg-purple-100 text-purple-700",
            unfulfilled: "bg-orange-100 text-orange-700",
        };
        return colors[status] || "bg-gray-100 text-gray-700";
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isLoggedIn || !customer) return null;

    return (
        <>
            <div className="min-h-screen bg-background py-8 px-4">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Profile Card */}
                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {profile?.pictureUrl ? (
                                    <Image
                                        src={profile.pictureUrl}
                                        alt={profile.displayName}
                                        width={80}
                                        height={80}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-10 w-10 text-primary" />
                                    </div>
                                )}
                                <Badge className={`absolute -bottom-1 -right-1 ${getTierColor(customer.tier)}`}>
                                    <Crown className="h-3 w-3 mr-1" />
                                    {customer.tier.toUpperCase()}
                                </Badge>
                            </div>
                            <div className="flex-1">
                                <h1 className="text-xl font-bold">{customer.name || profile?.displayName}</h1>
                                <p className="text-sm text-muted-foreground">{customer.phone || "ยังไม่ได้เพิ่มเบอร์โทร"}</p>
                                <div className="flex items-center gap-1 mt-1 text-yellow-600">
                                    <Star className="h-4 w-4 fill-current" />
                                    <span className="font-medium">{customer.points} points</span>
                                </div>
                            </div>
                            <Button 
                                variant="outline" 
                                size="icon"
                                onClick={() => setShowProfileModal(true)}
                            >
                                <Edit className="h-4 w-4" />
                            </Button>
                        </div>

                        {customer.profileStatus === "incomplete" && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    ⚠️ กรุณากรอกข้อมูลเพิ่มเติมเพื่อสั่งซื้อสินค้า
                                </p>
                                <Button 
                                    size="sm" 
                                    className="mt-2"
                                    onClick={() => setShowProfileModal(true)}
                                >
                                    กรอกข้อมูล
                                </Button>
                            </div>
                        )}
                    </Card>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <Card className="p-4 text-center">
                            <p className="text-2xl font-bold text-primary">{orders.length}</p>
                            <p className="text-xs text-muted-foreground">Orders</p>
                        </Card>
                        <Card className="p-4 text-center">
                            <p className="text-2xl font-bold text-primary">{customer.points}</p>
                            <p className="text-xs text-muted-foreground">Points</p>
                        </Card>
                        <Card className="p-4 text-center">
                            <p className="text-2xl font-bold text-primary capitalize">{customer.tier}</p>
                            <p className="text-xs text-muted-foreground">Tier</p>
                        </Card>
                    </div>

                    {/* Recent Orders */}
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                คำสั่งซื้อล่าสุด
                            </h2>
                            <Link href="/account/orders" className="text-sm text-primary hover:underline">
                                ดูทั้งหมด
                            </Link>
                        </div>

                        {orders.length > 0 ? (
                            <div className="space-y-3">
                                {orders.map((order) => (
                                    <Link
                                        key={order.id}
                                        href={`/account/orders/${order.id}`}
                                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <div>
                                            <p className="font-mono font-medium">{order.order_number}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(order.created_at).toLocaleDateString("th-TH")}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className={getStatusColor(order.fulfillment_status)}>
                                                {order.fulfillment_status}
                                            </Badge>
                                            <span className="font-medium">{formatPrice(order.total_amount)}</span>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                ยังไม่มีคำสั่งซื้อ
                            </p>
                        )}
                    </Card>

                    {/* Quick Actions */}
                    <Card className="p-6">
                        <h2 className="text-lg font-semibold mb-4">เมนู</h2>
                        <div className="space-y-2">
                            <Link
                                href="/claims"
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-medium">แจ้งเคลม / คืนสินค้า</p>
                                        <p className="text-sm text-muted-foreground">ร้องเรียนหรือขอคืนสินค้า</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                            <Link
                                href="/account/settings"
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Settings className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="font-medium">ตั้งค่าบัญชี</p>
                                        <p className="text-sm text-muted-foreground">แก้ไขข้อมูลส่วนตัว</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Profile Completion Modal */}
            {showProfileModal && (
                <ProfileCompletion
                    customer={customer}
                    onClose={() => setShowProfileModal(false)}
                    onSave={() => {
                        refreshCustomer();
                        setShowProfileModal(false);
                    }}
                />
            )}
        </>
    );
}
