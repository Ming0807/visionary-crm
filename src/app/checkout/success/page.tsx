"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
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
        Order Confirmed!
      </h1>

      {orderNumber && (
        <p className="text-muted-foreground mb-2">
          Order Number: <span className="font-mono font-semibold">{orderNumber}</span>
        </p>
      )}

      <p className="text-muted-foreground mb-8">
        Thank you for your purchase. We&apos;ll send you a confirmation email shortly.
      </p>

      <div className="bg-muted/50 rounded-2xl p-6 mb-8">
        <Package className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="font-semibold text-foreground mb-2">What&apos;s Next?</h3>
        <p className="text-sm text-muted-foreground">
          We&apos;re preparing your order. You&apos;ll receive tracking information once it ships.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="rounded-full">
          <Link href="/products">
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild className="rounded-full">
          <Link href="/">
            Back to Home
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
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
