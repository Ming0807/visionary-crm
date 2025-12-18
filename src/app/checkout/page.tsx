"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag, CreditCard, Loader2, User, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const { isLoggedIn, customer, profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  // Pre-fill form with saved customer data
  useEffect(() => {
    const loadCustomerData = async () => {
      if (!customer?.id) return;
      
      setIsLoadingCustomer(true);
      try {
        const { data } = await supabase
          .from("customers")
          .select("name, phone, email, address, address_json")
          .eq("id", customer.id)
          .single();

        if (data) {
          // Parse address from different possible formats
          const addressJson = data.address_json || {};
          const legacyAddress = typeof data.address === 'object' ? data.address : {};
          
          // Try multiple field names for address
          const addressFull = addressJson.full || addressJson.line1 || addressJson.address || 
                             legacyAddress.full || legacyAddress.line1 || legacyAddress.address || "";
          
          // Try multiple field names for city
          const city = addressJson.city || addressJson.province || 
                      legacyAddress.city || legacyAddress.province || "";
          
          // Try multiple field names for postal code
          const postalCode = addressJson.zip || addressJson.postal_code || addressJson.postalCode ||
                            legacyAddress.zip || legacyAddress.postal_code || legacyAddress.postalCode || "";

          setFormData((prev) => ({
            ...prev,
            name: data.name || profile?.displayName || prev.name,
            phone: data.phone || prev.phone,
            email: data.email || prev.email,
            address: addressFull || prev.address,
            city: city || prev.city,
            postalCode: postalCode || prev.postalCode,
          }));
        }
      } catch (error) {
        console.error("Error loading customer data:", error);
      } finally {
        setIsLoadingCustomer(false);
      }
    };

    loadCustomerData();
  }, [customer?.id, profile?.displayName]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const shippingCost = totalAmount >= 1500 ? 0 : 50;
  const grandTotal = totalAmount + shippingCost;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer?.id, // Link to existing customer if logged in
          customer: {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
          },
          shippingAddress: {
            name: formData.name,
            line1: formData.address,
            city: formData.city,
            zip: formData.postalCode,
          },
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            productName: item.productName,
            sku: item.sku,
          })),
          subtotal: totalAmount,
          shippingCost,
          totalAmount: grandTotal,
          notes: formData.notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to place order");
      }

      // Save address for next time if logged in
      if (customer?.id) {
        await supabase
          .from("customers")
          .update({
            name: formData.name,
            phone: formData.phone,
            email: formData.email || null,
            address_json: {
              full: formData.address,
              city: formData.city,
              zip: formData.postalCode,
            },
            profile_status: "complete",
          })
          .eq("id", customer.id);
      }

      clearCart();
      // Redirect to payment page instead of success
      router.push(`/checkout/payment?order=${result.orderNumber}&amount=${grandTotal}`);
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Order failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some items to get started!</p>
        <Button onClick={() => router.push("/products")}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Shipping Form */}
        <div>
          <div className="bg-card rounded-2xl p-6 lg:p-8 border border-border">
            {/* Login Prompt or User Info */}
            {isLoggedIn ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg mb-6">
                {profile?.pictureUrl ? (
                  <Image
                    src={profile.pictureUrl}
                    alt={profile.displayName}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-green-800">
                    สวัสดีคุณ {profile?.displayName} 👋
                  </p>
                  <p className="text-xs text-green-600">
                    ข้อมูลถูกดึงมาอัตโนมัติ คุณสามารถแก้ไขได้
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                <p className="text-sm text-blue-800 mb-2">
                  💡 Login เพื่อไม่ต้องกรอกข้อมูลซ้ำครั้งหน้า
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/?login=true")}
                  className="text-blue-600 border-blue-300"
                >
                  Login with LINE
                </Button>
              </div>
            )}

            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              ข้อมูลการจัดส่ง
            </h2>

            {isLoadingCustomer ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">กำลังโหลดข้อมูล...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="สมชาย ใจดี"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="081-234-5678"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">ที่อยู่ *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 ถ.สุขุมวิท แขวงคลองตัน"
                    rows={2}
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">จังหวัด *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="กรุงเทพมหานคร"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">รหัสไปรษณีย์ *</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="10110"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">หมายเหตุ (ถ้ามี)</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="เช่น ส่งช่วงเย็น, ฝากไว้ที่..."
                    rows={2}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 h-14 text-lg rounded-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      กำลังดำเนินการ...
                    </>
                  ) : (
                    <>
                      <QrCode className="mr-2 h-5 w-5" />
                      ดำเนินการชำระเงิน - {formatPrice(grandTotal)}
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div>
          <div className="bg-muted/50 rounded-2xl p-6 lg:p-8 sticky top-24">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              สรุปคำสั่งซื้อ
            </h2>

            {/* Items */}
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm line-clamp-1">
                      {item.productName}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {item.colorName} × {item.quantity}
                    </p>
                    <p className="text-sm font-medium text-primary mt-1">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Totals */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ราคาสินค้า</span>
                <span className="font-medium">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">ค่าจัดส่ง</span>
                <span className="font-medium">
                  {shippingCost === 0 ? (
                    <span className="text-green-600">ฟรี</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              {shippingCost > 0 && (
                <p className="text-xs text-muted-foreground">
                  ฟรีค่าจัดส่งเมื่อซื้อครบ ฿1,500
                </p>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between">
              <span className="text-lg font-semibold">รวมทั้งหมด</span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
