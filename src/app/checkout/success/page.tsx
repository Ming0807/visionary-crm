"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-md">
      <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>

      <h1 className="text-3xl font-bold text-foreground mb-3">
        ยืนยันคำสั่งซื้อแล้ว!
      </h1>

      {orderNumber && (
        <p className="text-muted-foreground mb-2">
          หมายเลขคำสั่งซื้อ: <span className="font-mono font-semibold">{orderNumber}</span>
        </p>
      )}

      <p className="text-muted-foreground mb-8">
        ขอบคุณที่เลือกซื้อสินค้ากับเรา เราจะจัดส่งสินค้าให้เร็วที่สุด
      </p>

      <div className="bg-muted/50 rounded-2xl p-6 mb-6">
        <Package className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="font-semibold text-foreground mb-2">ขั้นตอนถัดไป</h3>
        <p className="text-sm text-muted-foreground">
          เรากำลังจัดเตรียมสินค้า คุณจะได้รับแจ้งเลข Tracking เมื่อสินค้าถูกจัดส่ง
        </p>
      </div>

      {/* Review CTA */}
      {orderNumber && (
        <div className="bg-primary/5 rounded-2xl p-4 mb-6 border border-primary/20">
          <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-sm text-foreground mb-3">
            หลังได้รับสินค้าแล้ว อย่าลืมมารีวิวให้เราด้วยนะ!
          </p>
          <Button variant="outline" size="sm" asChild className="rounded-full">
            <Link href={`/review?order=${orderNumber}`}>
              เขียนรีวิว
            </Link>
          </Button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="rounded-full">
          <Link href="/products">
            ช้อปปิ้งต่อ
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild className="rounded-full">
          <Link href="/account/orders">
            ดูคำสั่งซื้อ
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">กำลังโหลด...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
