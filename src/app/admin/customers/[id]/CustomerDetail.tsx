"use client";

import { useState } from "react";
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
  AlertTriangle
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: "bg-green-100 text-green-700",
      pending_payment: "bg-yellow-100 text-yellow-700",
      cancelled: "bg-red-100 text-red-700",
      delivered: "bg-blue-100 text-blue-700",
      shipped: "bg-purple-100 text-purple-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getBehaviorIcon = (type: string) => {
    switch (type) {
      case "view": return <Eye className="h-4 w-4" />;
      case "wishlist_add": return <Heart className="h-4 w-4" />;
      case "cart_abandon": return <ShoppingCart className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  // Calculate tier progress (matching schema_phase4.sql)
  const tierThresholds = { member: 0, vip: 10001, platinum: 50001 };
  const currentTierThreshold = tierThresholds[customer.tier as keyof typeof tierThresholds] || 0;
  const nextTiers = Object.entries(tierThresholds).filter(([_, val]) => val > currentTierThreshold);
  const nextTier = nextTiers[0];
  const progress = nextTier 
    ? Math.min(100, ((customer.total_spent - currentTierThreshold) / (nextTier[1] - currentTierThreshold)) * 100)
    : 100;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/customers">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {customer.name || "Unknown Customer"}
          </h1>
          <p className="text-muted-foreground">Customer ID: {customer.id.slice(0, 8)}...</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <TierBadge tier={customer.tier} size="md" />
            </div>

            <h2 className="text-xl font-semibold mb-4">{customer.name || "Unknown"}</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phone || "-"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email || "-"}</span>
              </div>
              {customer.address && Object.keys(customer.address).length > 0 && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{JSON.stringify(customer.address)}</span>
                </div>
              )}
              {customer.birthday && (
                <div className="flex items-center gap-3 text-sm">
                  <Cake className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(customer.birthday).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                    {/* Check if birthday is within next 7 days */}
                    {(() => {
                      const birthday = new Date(customer.birthday);
                      const today = new Date();
                      // Reset both to midnight for accurate day comparison
                      today.setHours(0, 0, 0, 0);
                      birthday.setFullYear(today.getFullYear());
                      birthday.setHours(0, 0, 0, 0);
                      const diffDays = Math.round((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      if (diffDays === 0) {
                        return <Badge className="ml-2 bg-pink-500 text-white">🎉 วันนี้!</Badge>;
                      } else if (diffDays > 0 && diffDays <= 7) {
                        return <Badge className="ml-2 bg-pink-100 text-pink-700">🎂 อีก {diffDays} วัน</Badge>;
                      }
                      return null;
                    })()}
                  </span>
                </div>
              )}
              {customer.join_date && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Member since {new Date(customer.join_date).toLocaleDateString("th-TH", { year: "numeric", month: "short" })}
                  </span>
                </div>
              )}
            </div>

            {/* Customer Segment Badge */}
            {customer.segment && (
              <div className="mt-4 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  {customer.segment === "champion" && <Star className="h-4 w-4 text-yellow-500" />}
                  {customer.segment === "at_risk" && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                  {customer.segment === "lost" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  {customer.segment === "new" && <Gift className="h-4 w-4 text-green-500" />}
                  {customer.segment === "loyal" && <Heart className="h-4 w-4 text-pink-500" />}
                  {customer.segment === "promising" && <ShoppingCart className="h-4 w-4 text-blue-500" />}
                  <span className="text-sm font-medium capitalize">{customer.segment.replace("_", " ")}</span>
                  <Badge 
                    variant="outline" 
                    className={
                      customer.segment === "champion" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                      customer.segment === "at_risk" ? "bg-orange-50 text-orange-700 border-orange-200" :
                      customer.segment === "lost" ? "bg-red-50 text-red-700 border-red-200" :
                      customer.segment === "loyal" ? "bg-pink-50 text-pink-700 border-pink-200" :
                      customer.segment === "new" ? "bg-green-50 text-green-700 border-green-200" :
                      "bg-blue-50 text-blue-700 border-blue-200"
                    }
                  >
                    Segment
                  </Badge>
                </div>
                {customer.segment === "at_risk" && (
                  <p className="text-xs text-orange-600 mt-1">⚠️ ลูกค้าไม่มีกิจกรรมมากกว่า 60 วัน</p>
                )}
                {customer.segment === "lost" && (
                  <p className="text-xs text-red-600 mt-1">⚠️ ลูกค้าหายไปมากกว่า 180 วัน - ควร win-back</p>
                )}
              </div>
            )}

            <Separator className="my-4" />

            {/* Social Identities */}
            {customer.social_identities.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Connected Accounts</h4>
                <div className="flex flex-wrap gap-2">
                  {customer.social_identities.map((identity, idx) => (
                    <Badge key={idx} variant="secondary">
                      {identity.platform}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Style Tags */}
            {customer.style_tags && customer.style_tags.length > 0 && (
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
            )}
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center">
              <ShoppingBag className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{customer.purchase_count || 0}</p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </Card>
            <Card className="p-4 text-center">
              <Star className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
              <p className="text-2xl font-bold">{customer.points?.toLocaleString() || 0}</p>
              <p className="text-xs text-muted-foreground">Points</p>
            </Card>
          </div>

          {/* Total Spent */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Spent</span>
              <span className="text-lg font-bold text-primary">
                {formatPrice(customer.total_spent || 0)}
              </span>
            </div>
            
            {/* Tier Progress */}
            {nextTier && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{customer.tier}</span>
                  <span>{nextTier[0]}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPrice(nextTier[1] - customer.total_spent)} more to {nextTier[0]}
                </p>
              </div>
            )}
          </Card>

          {/* RFM Segment */}
          <Card className="p-4">
            <h4 className="text-sm font-medium mb-3">RFM Analysis</h4>
            <div className="flex items-center gap-3">
              <RFMBadge segment={customer.rfm_segment} score={customer.rfm_score} showScore size="md" />
            </div>
            {customer.last_purchase_at && (
              <p className="text-xs text-muted-foreground mt-2">
                Last purchase: {formatDate(customer.last_purchase_at)}
              </p>
            )}
          </Card>

          {/* Notes */}
          <Card className="p-4">
            <h4 className="text-sm font-medium mb-2">Admin Notes</h4>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add private notes about this customer..."
              rows={3}
            />
            <Button size="sm" className="mt-2" variant="outline">
              Save Notes
            </Button>
          </Card>
        </div>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="orders" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="points" className="gap-2">
                <Gift className="h-4 w-4" />
                Points
              </TabsTrigger>
              <TabsTrigger value="behavior" className="gap-2">
                <Eye className="h-4 w-4" />
                Behavior
              </TabsTrigger>
              <TabsTrigger value="claims" className="gap-2">
                <FileText className="h-4 w-4" />
                Claims
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-4">
              <Card className="p-4">
                {customer.orders.length > 0 ? (
                  <div className="space-y-4">
                    {customer.orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                        <div>
                          <Link 
                            href={`/admin/orders/${order.id}`}
                            className="font-medium hover:text-primary"
                          >
                            {order.order_number}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(order.created_at)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.items?.length || 0} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatPrice(order.total_amount)}</p>
                          <Badge className={getStatusColor(order.payment_status)}>
                            {order.payment_status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders yet
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Points Tab */}
            <TabsContent value="points" className="mt-4">
              <Card className="p-4">
                {/* Point Adjustment Section */}
                <div className="mb-6 p-4 bg-muted/50 rounded-xl">
                  <h4 className="font-medium mb-3">Adjust Points</h4>
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setAdjustAmount(Math.max(-1000, adjustAmount - 100))}
                      disabled={isAdjusting}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <input
                      type="number"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(parseInt(e.target.value) || 0)}
                      className="w-24 text-center text-lg font-bold border rounded-lg p-2"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setAdjustAmount(Math.min(1000, adjustAmount + 100))}
                      disabled={isAdjusting}
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
                            alert(`Points updated! New balance: ${data.newPoints}`);
                          }
                        } catch (error) {
                          console.error(error);
                        } finally {
                          setIsAdjusting(false);
                        }
                      }}
                    >
                      {isAdjusting ? "Saving..." : "Apply"}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Current balance: <span className="font-bold text-foreground">{customerPoints.toLocaleString()}</span> points
                  </p>
                </div>

                {/* Transaction History */}
                {customer.pointTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {customer.pointTransactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="font-medium text-sm">
                            {(tx.reason || "transaction").replace(/_/g, " ").toUpperCase()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(tx.created_at)}
                          </p>
                        </div>
                        <span className={`font-bold ${tx.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                          {tx.amount > 0 ? "+" : ""}{tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No point transactions yet
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Behavior Tab */}
            <TabsContent value="behavior" className="mt-4">
              <Card className="p-4">
                {customer.behaviors.length > 0 ? (
                  <div className="space-y-3">
                    {customer.behaviors.map((behavior) => (
                      <div key={behavior.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                        <div className={`p-2 rounded-full ${
                          behavior.behavior_type === "view" ? "bg-blue-100 text-blue-600" :
                          behavior.behavior_type === "wishlist_add" ? "bg-pink-100 text-pink-600" :
                          "bg-orange-100 text-orange-600"
                        }`}>
                          {getBehaviorIcon(behavior.behavior_type)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {behavior.behavior_type.replace("_", " ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {behavior.variant?.product?.name} 
                            {behavior.variant?.color_name && ` (${behavior.variant.color_name})`}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(behavior.created_at)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No behavior tracked yet
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
                            {claim.reason} • {formatDate(claim.created_at)}
                          </p>
                        </div>
                        <Badge variant={claim.status === "approved" ? "default" : "secondary"}>
                          {claim.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No claims or returns
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
