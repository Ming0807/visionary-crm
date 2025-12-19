"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ShoppingBag,
  Star,
  Eye,
  Heart,
  ShoppingCart,
  Gift,
  FileText,
  MessageSquare,
  Plus,
  Minus,
  Cake,
  Calendar,
  AlertTriangle,
  TrendingUp,
  Crown,
  RefreshCw,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import TierBadge from "@/components/TierBadge";
import RFMBadge from "@/components/RFMBadge";

interface CustomerDetailProps {
  customer: {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    address: Record<string, unknown>;
    tier: string;
    points: number;
    total_spent: number;
    style_tags: string[] | null;
    notes: string | null;
    rfm_segment: string | null;
    rfm_score: string | null;
    purchase_count: number;
    last_purchase_at: string | null;
    created_at: string;
    birthday: string | null;
    join_date: string | null;
    segment: string | null;
    last_order_at: string | null;
    social_identities: Array<{
      platform: string;
      social_user_id: string;
      profile_data: Record<string, unknown>;
    }>;
    orders: Array<{
      id: string;
      order_number: string;
      total_amount: number;
      payment_status: string;
      fulfillment_status: string;
      created_at: string;
      items: Array<{
        product_name_snapshot: string;
        quantity: number;
        price_per_unit: number;
      }>;
    }>;
    pointTransactions: Array<{
      id: string;
      amount: number;
      reason: string | null;
      created_at: string;
    }>;
    behaviors: Array<{
      id: string;
      behavior_type: string;
      created_at: string;
      variant: {
        color_name: string;
        product: {
          name: string;
        };
      } | null;
    }>;
    claims: Array<{
      id: string;
      claim_type: string;
      status: string;
      reason: string;
      created_at: string;
    }>;
  };
}

export default function CustomerDetail({ customer }: CustomerDetailProps) {
  const [notes, setNotes] = useState(customer.notes || "");
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [customerPoints, setCustomerPoints] = useState(customer.points || 0);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(price);
  }, []);

  const formatDate = useCallback((date: string) => {
    return new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const formatShortDate = useCallback((date: string) => {
    return new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const getPaymentStatusColor = useCallback((status: string) => {
    const colors: Record<string, { bg: string; text: string; dot: string }> = {
      paid: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
      pending_payment: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
      verifying: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
      cancelled: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
      refunded: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" },
    };
    return colors[status] || { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" };
  }, []);

  const getBehaviorIcon = useCallback((type: string) => {
    switch (type) {
      case "view": return <Eye className="h-4 w-4" />;
      case "wishlist_add": return <Heart className="h-4 w-4" />;
      case "cart_abandon": return <ShoppingCart className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  }, []);

  // Calculate tier progress
  const { nextTier, progress } = useMemo(() => {
    const tierThresholds = { member: 0, vip: 10001, platinum: 50001 };
    const currentTierThreshold = tierThresholds[customer.tier as keyof typeof tierThresholds] || 0;
    const nextTiers = Object.entries(tierThresholds).filter(([_, val]) => val > currentTierThreshold);
    const next = nextTiers[0];
    const prog = next 
      ? Math.min(100, ((customer.total_spent - currentTierThreshold) / (next[1] - currentTierThreshold)) * 100)
      : 100;
    return { nextTier: next, progress: prog };
  }, [customer.tier, customer.total_spent]);

  // Birthday check
  const birthdayStatus = useMemo(() => {
    if (!customer.birthday) return null;
    const birthday = new Date(customer.birthday);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    birthday.setFullYear(today.getFullYear());
    birthday.setHours(0, 0, 0, 0);
    const diffDays = Math.round((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "today";
    if (diffDays > 0 && diffDays <= 7) return diffDays;
    return null;
  }, [customer.birthday]);

  // Extract profile picture - check profile_image_url first, then social_identities
  const profilePicture = useMemo(() => {
    // Priority 1: Direct profile_image_url column
    if ((customer as any).profile_image_url) return (customer as any).profile_image_url;
    
    // Priority 2: social_identities profile_data
    if (!customer.social_identities?.length) return null;
    for (const identity of customer.social_identities) {
      const data = identity.profile_data as Record<string, any>;
      if (data?.pictureUrl) return data.pictureUrl; // LINE
      if (data?.picture) return data.picture; // Facebook
      if (data?.avatar_url) return data.avatar_url; // Generic
    }
    return null;
  }, [customer]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild className="flex-shrink-0">
          <Link href="/admin/customers">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
              {customer.name || "ลูกค้าไม่ระบุชื่อ"}
            </h1>
            <TierBadge tier={customer.tier} />
          </div>
          <p className="text-sm text-muted-foreground">
            ID: {customer.id.slice(0, 8)}... • สมัครเมื่อ {formatShortDate(customer.created_at)}
          </p>
        </div>
      </div>

      {/* Stats Overview - Mobile First */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {/* Total Spent */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 rounded-xl p-3 sm:p-4 border border-emerald-200/50">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">ยอดซื้อรวม</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-emerald-800 dark:text-emerald-200">
            {formatPrice(customer.total_spent || 0)}
          </p>
        </div>

        {/* Orders */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl p-3 sm:p-4 border border-blue-200/50">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">ออเดอร์</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-blue-800 dark:text-blue-200">
            {customer.purchase_count || 0}
          </p>
        </div>

        {/* Points */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 rounded-xl p-3 sm:p-4 border border-amber-200/50">
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-4 w-4 text-amber-600" />
            <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">แต้มสะสม</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-amber-800 dark:text-amber-200">
            {customerPoints.toLocaleString()}
          </p>
        </div>

        {/* Tier Progress */}
        <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/20 rounded-xl p-3 sm:p-4 border border-violet-200/50">
          <div className="flex items-center gap-2 mb-1">
            <Crown className="h-4 w-4 text-violet-600" />
            <span className="text-xs text-violet-700 dark:text-violet-300 font-medium">
              {nextTier ? `ถึง ${nextTier[0]}` : "Max Tier"}
            </span>
          </div>
          {nextTier ? (
            <div className="space-y-1.5">
              <div className="h-2 bg-violet-200/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-violet-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-violet-600">{formatPrice(nextTier[1] - customer.total_spent)}</p>
            </div>
          ) : (
            <p className="text-sm font-bold text-violet-800">🎉 Platinum</p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile */}
        <div className="space-y-4">
          {/* Contact Info Card */}
          <Card className="p-4 sm:p-5">
            <div className="flex items-start gap-4 mb-4">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt={customer.name || "Profile"}
                  className="h-14 w-14 rounded-full object-cover flex-shrink-0 ring-2 ring-primary/20"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-primary">
                    {(customer.name || "?").charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold truncate">{customer.name || "ไม่ระบุชื่อ"}</h2>
                <RFMBadge segment={customer.rfm_segment} score={customer.rfm_score} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 rounded-lg bg-muted">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <span>{customer.phone || "-"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="p-2 rounded-lg bg-muted">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="truncate">{customer.email || "-"}</span>
              </div>
              {customer.birthday && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 rounded-lg bg-pink-50">
                    <Cake className="h-4 w-4 text-pink-500" />
                  </div>
                  <span>
                    {new Date(customer.birthday).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                    {birthdayStatus === "today" && (
                      <Badge className="ml-2 bg-pink-500 text-white text-xs">🎉 วันนี้!</Badge>
                    )}
                    {typeof birthdayStatus === "number" && (
                      <Badge className="ml-2 bg-pink-100 text-pink-700 text-xs">🎂 อีก {birthdayStatus} วัน</Badge>
                    )}
                  </span>
                </div>
              )}
              {customer.join_date && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="p-2 rounded-lg bg-muted">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span>
                    สมาชิกตั้งแต่ {new Date(customer.join_date).toLocaleDateString("th-TH", { year: "numeric", month: "short" })}
                  </span>
                </div>
              )}
            </div>

            {/* Customer Segment */}
            {customer.segment && (
              <>
                <Separator className="my-4" />
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    {customer.segment === "champion" && <Star className="h-4 w-4 text-yellow-500" />}
                    {customer.segment === "at_risk" && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                    {customer.segment === "lost" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {customer.segment === "new" && <Gift className="h-4 w-4 text-green-500" />}
                    {customer.segment === "loyal" && <Heart className="h-4 w-4 text-pink-500" />}
                    {customer.segment === "promising" && <ShoppingCart className="h-4 w-4 text-blue-500" />}
                    <span className="text-sm font-medium capitalize">{customer.segment.replace("_", " ")}</span>
                  </div>
                  {customer.segment === "at_risk" && (
                    <p className="text-xs text-orange-600 mt-1">⚠️ ไม่มีกิจกรรมมากกว่า 60 วัน</p>
                  )}
                  {customer.segment === "lost" && (
                    <p className="text-xs text-red-600 mt-1">⚠️ หายไปมากกว่า 180 วัน - ควร win-back</p>
                  )}
                </div>
              </>
            )}

            {/* Social Identities */}
            {customer.social_identities.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="text-sm font-medium mb-2">บัญชีที่เชื่อมต่อ</h4>
                  <div className="flex flex-wrap gap-2">
                    {customer.social_identities.map((identity, idx) => (
                      <Badge key={idx} variant="secondary" className="capitalize">
                        {identity.platform}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Style Tags */}
            {customer.style_tags && customer.style_tags.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="text-sm font-medium mb-2">Style Preferences</h4>
                  <div className="flex flex-wrap gap-2">
                    {customer.style_tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </Card>

          {/* Notes Card */}
          <Card className="p-4">
            <h4 className="text-sm font-medium mb-2">Admin Notes</h4>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="บันทึกส่วนตัวเกี่ยวกับลูกค้า..."
              rows={3}
              className="text-sm"
            />
            <Button size="sm" className="mt-2" variant="outline">
              บันทึก
            </Button>
          </Card>
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid grid-cols-4 w-full h-auto p-1">
              <TabsTrigger value="orders" className="gap-1.5 text-xs sm:text-sm py-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">ออเดอร์</span>
              </TabsTrigger>
              <TabsTrigger value="points" className="gap-1.5 text-xs sm:text-sm py-2">
                <Gift className="h-4 w-4" />
                <span className="hidden sm:inline">แต้ม</span>
              </TabsTrigger>
              <TabsTrigger value="behavior" className="gap-1.5 text-xs sm:text-sm py-2">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">พฤติกรรม</span>
              </TabsTrigger>
              <TabsTrigger value="claims" className="gap-1.5 text-xs sm:text-sm py-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">เคลม</span>
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-4">
              <Card className="p-4">
                {customer.orders.length > 0 ? (
                  <div className="space-y-3">
                    {customer.orders.map((order) => {
                      const statusColors = getPaymentStatusColor(order.payment_status);
                      return (
                        <Link
                          key={order.id}
                          href={`/admin/orders/${order.id}`}
                          className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors group"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium text-sm group-hover:text-primary transition-colors">
                                {order.order_number}
                              </span>
                              <Badge className={`${statusColors.bg} ${statusColors.text} gap-1 text-xs`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${statusColors.dot}`} />
                                {order.payment_status.replace("_", " ")}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatShortDate(order.created_at)} • {order.items?.length || 0} รายการ
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm sm:text-base">{formatPrice(order.total_amount)}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>ยังไม่มีคำสั่งซื้อ</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Points Tab */}
            <TabsContent value="points" className="mt-4">
              <Card className="p-4">
                {/* Point Adjustment Section */}
                <div className="mb-6 p-4 bg-gradient-to-br from-amber-50 to-amber-100/30 dark:from-amber-950/20 dark:to-amber-900/10 rounded-xl border border-amber-200/50">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    ปรับแต้ม
                  </h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setAdjustAmount(Math.max(-1000, adjustAmount - 100))}
                      disabled={isAdjusting}
                      className="h-10 w-10"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <input
                      type="number"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                      className="w-24 text-center text-lg font-bold border rounded-lg p-2 bg-background"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setAdjustAmount(Math.min(1000, adjustAmount + 100))}
                      disabled={isAdjusting}
                      className="h-10 w-10"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      disabled={adjustAmount === 0 || isAdjusting}
                      onClick={async () => {
                        setIsAdjusting(true);
                        try {
                          const res = await fetch("/api/points/adjust", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              customerId: customer.id,
                              amount: adjustAmount,
                              reason: "manual_adjustment",
                            }),
                          });
                          if (res.ok) {
                            const data = await res.json();
                            setCustomerPoints(data.newPoints);
                            setAdjustAmount(0);
                            alert(`อัปเดตแล้ว! แต้มใหม่: ${data.newPoints}`);
                          }
                        } catch (error) {
                          console.error(error);
                        } finally {
                          setIsAdjusting(false);
                        }
                      }}
                      className="gap-2"
                    >
                      {isAdjusting ? "กำลังบันทึก..." : "ยืนยัน"}
                    </Button>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-3">
                    แต้มปัจจุบัน: <span className="font-bold">{customerPoints.toLocaleString()}</span>
                  </p>
                </div>

                {/* Transaction History */}
                {customer.pointTransactions.length > 0 ? (
                  <div className="space-y-2">
                    {customer.pointTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <div>
                          <p className="font-medium text-sm">
                            {(tx.reason || "transaction").replace(/_/g, " ").toUpperCase()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatShortDate(tx.created_at)}
                          </p>
                        </div>
                        <span className={`font-bold tabular-nums ${tx.amount > 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Gift className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>ยังไม่มีประวัติแต้ม</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Behavior Tab */}
            <TabsContent value="behavior" className="mt-4">
              <Card className="p-4">
                {customer.behaviors.length > 0 ? (
                  <div className="space-y-2">
                    {customer.behaviors.map((behavior) => (
                      <div key={behavior.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                        <div className={`p-2 rounded-full ${
                          behavior.behavior_type === "view" ? "bg-blue-100 text-blue-600" :
                          behavior.behavior_type === "wishlist_add" ? "bg-pink-100 text-pink-600" :
                          "bg-orange-100 text-orange-600"
                        }`}>
                          {getBehaviorIcon(behavior.behavior_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm capitalize">
                            {behavior.behavior_type.replace("_", " ")}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {behavior.variant?.product?.name} 
                            {behavior.variant?.color_name && ` (${behavior.variant.color_name})`}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatShortDate(behavior.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Eye className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>ยังไม่มีข้อมูลพฤติกรรม</p>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Claims Tab */}
            <TabsContent value="claims" className="mt-4">
              <Card className="p-4">
                {customer.claims.length > 0 ? (
                  <div className="space-y-3">
                    {customer.claims.map((claim) => (
                      <div key={claim.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm capitalize">
                            {claim.claim_type}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {claim.reason} • {formatShortDate(claim.created_at)}
                          </p>
                        </div>
                        <Badge variant={claim.status === "approved" ? "default" : "secondary"}>
                          {claim.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>ไม่มีประวัติการเคลม</p>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
