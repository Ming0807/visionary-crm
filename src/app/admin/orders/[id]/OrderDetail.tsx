"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Package,
  Truck,
  CreditCard,
  Loader2,
  Receipt,
  CheckCircle,
  XCircle,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
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

interface OrderDetailProps {
  order: {
    id: string;
    order_number: string;
    customer_id: string | null;
    platform_source: string;
    subtotal: number;
    discount_amount: number;
    shipping_cost: number;
    total_amount: number;
    payment_status: string;
    fulfillment_status: string;
    slip_image_url: string | null;
    shipping_address: Record<string, unknown> | null;
    tracking_number: string | null;
    shipping_carrier: string | null;
    created_at: string;
    customer: {
      id: string;
      name: string | null;
      phone: string | null;
      email: string | null;
    } | null;
    items: Array<{
      id: string;
      product_name_snapshot: string;
      sku_snapshot: string;
      quantity: number;
      price_per_unit: number;
      variant: {
        id: string;
        color_name: string | null;
        images: string[];
        product: {
          name: string;
        };
      } | null;
    }>;
  };
}

const paymentStatuses = [
  { value: "pending_payment", label: "Pending Payment" },
  { value: "verifying", label: "Verifying" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

const fulfillmentStatuses = [
  { value: "unfulfilled", label: "Unfulfilled" },
  { value: "packing", label: "Packing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "returned", label: "Returned" },
];

const carriers = ["Flash Express", "Kerry Express", "J&T Express", "Thailand Post", "DHL", "Other"];

export default function OrderDetail({ order }: OrderDetailProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status);
  const [fulfillmentStatus, setFulfillmentStatus] = useState(order.fulfillment_status);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || "");
  const [carrier, setCarrier] = useState(order.shipping_carrier || "");

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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: "bg-green-100 text-green-700",
      pending_payment: "bg-yellow-100 text-yellow-700",
      verifying: "bg-blue-100 text-blue-700",
      cancelled: "bg-red-100 text-red-700",
      refunded: "bg-gray-100 text-gray-700",
      delivered: "bg-green-100 text-green-700",
      shipped: "bg-blue-100 text-blue-700",
      packing: "bg-purple-100 text-purple-700",
      unfulfilled: "bg-orange-100 text-orange-700",
      returned: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const handleUpdateOrder = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: paymentStatus,
          fulfillment_status: fulfillmentStatus,
          tracking_number: trackingNumber || null,
          shipping_carrier: carrier || null,
        })
        .eq("id", order.id);

      if (error) throw error;

      toast({
        title: "Order updated",
        description: "Order status has been updated successfully.",
      });
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Update failed",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const address = order.shipping_address as { name?: string; line1?: string; city?: string; zip?: string } | null;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground font-mono">
            {order.order_number}
          </h1>
          <p className="text-muted-foreground">{formatDate(order.created_at)}</p>
        </div>
        <Badge className={getStatusColor(order.payment_status)}>
          {order.payment_status.replace("_", " ")}
        </Badge>
        <Badge className={getStatusColor(order.fulfillment_status)}>
          {order.fulfillment_status}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-muted/50 rounded-xl">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    {item.variant?.images?.[0] ? (
                      <Image
                        src={item.variant.images[0]}
                        alt={item.product_name_snapshot}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product_name_snapshot}</p>
                    <p className="text-sm text-muted-foreground">
                      SKU: {item.sku_snapshot}
                      {item.variant?.color_name && ` • ${item.variant.color_name}`}
                    </p>
                    <p className="text-sm">
                      {formatPrice(item.price_per_unit)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatPrice(item.price_per_unit * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-green-600">-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : "Free"}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </Card>

          {/* Update Status */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Update Order</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Fulfillment Status</Label>
                <Select value={fulfillmentStatus} onValueChange={setFulfillmentStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fulfillmentStatuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Carrier</Label>
                <Select value={carrier} onValueChange={setCarrier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    {carriers.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tracking Number</Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                />
              </div>
            </div>
            <Button 
              className="mt-4" 
              onClick={handleUpdateOrder}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </Card>
        </div>

        {/* Right Column - Customer & Shipping */}
        <div className="space-y-6">
          {/* Customer */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer
            </h2>
            {order.customer ? (
              <div className="space-y-2">
                <Link
                  href={`/admin/customers/${order.customer.id}`}
                  className="font-medium hover:text-primary"
                >
                  {order.customer.name || "Unknown"}
                </Link>
                <p className="text-sm text-muted-foreground">{order.customer.phone}</p>
                <p className="text-sm text-muted-foreground">{order.customer.email}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Guest checkout</p>
            )}
          </Card>

          {/* Shipping Address */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </h2>
            {address ? (
              <div className="text-sm space-y-1">
                <p className="font-medium">{address.name}</p>
                <p className="text-muted-foreground">{address.line1}</p>
                <p className="text-muted-foreground">{address.city} {address.zip}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No address provided</p>
            )}
          </Card>

          {/* Shipping Info */}
          {(order.tracking_number || order.shipping_carrier) && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping
              </h2>
              <div className="text-sm space-y-2">
                {order.shipping_carrier && (
                  <p><span className="text-muted-foreground">Carrier:</span> {order.shipping_carrier}</p>
                )}
                {order.tracking_number && (
                  <p><span className="text-muted-foreground">Tracking:</span> {order.tracking_number}</p>
                )}
              </div>
            </Card>
          )}

          {/* Payment Proof / Slip */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              หลักฐานการชำระเงิน
            </h2>
            {order.slip_image_url ? (
              <div className="space-y-4">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src={order.slip_image_url}
                    alt="Payment slip"
                    fill
                    className="object-contain"
                  />
                </div>
                <a
                  href={order.slip_image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  เปิดรูปเต็ม
                </a>
                
                {/* Quick Actions for Payment */}
                {paymentStatus === "verifying" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setPaymentStatus("paid");
                        handleUpdateOrder();
                      }}
                      disabled={isUpdating}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      อนุมัติ
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        setPaymentStatus("cancelled");
                        handleUpdateOrder();
                      }}
                      disabled={isUpdating}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      ปฏิเสธ
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">ยังไม่มีหลักฐานการโอน</p>
              </div>
            )}
          </Card>

          {/* Platform */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Order Source
            </h2>
            <Badge variant="outline" className="capitalize">
              {order.platform_source}
            </Badge>
          </Card>
        </div>
      </div>
    </div>
  );
}
