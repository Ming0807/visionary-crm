"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { QrCode, Upload, CheckCircle2, Loader2, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// PromptPay ID (replace with actual shop's PromptPay number)
const PROMPTPAY_ID = "0812345678"; // เบอร์โทรหรือเลขบัตรประชาชน

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const orderNumber = searchParams.get("order") || "";
  const amount = parseFloat(searchParams.get("amount") || "0");
  
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [slipUploaded, setSlipUploaded] = useState(false);
  const [slipUrl, setSlipUrl] = useState("");

  useEffect(() => {
    // Generate PromptPay QR Code using API
    if (amount > 0) {
      const qrUrl = `https://promptpay.io/${PROMPTPAY_ID}/${amount}.png`;
      setQrCodeUrl(qrUrl);
    }
  }, [amount]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const copyAccountInfo = () => {
    navigator.clipboard.writeText(PROMPTPAY_ID);
    toast({
      title: "คัดลอกแล้ว!",
      description: `เบอร์ PromptPay: ${PROMPTPAY_ID}`,
    });
  };

  const handleSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "slip");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      
      const data = await res.json();
      setSlipUrl(data.url);
      setSlipUploaded(true);

      // Save slip to order
      await fetch("/api/orders/slip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          slipUrl: data.url,
        }),
      });

      toast({
        title: "อัพโหลดสลิปสำเร็จ! 🎉",
        description: "เราจะตรวจสอบและแจ้งผลทาง LINE",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "อัพโหลดไม่สำเร็จ",
        description: "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!orderNumber) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">ไม่พบข้อมูลคำสั่งซื้อ</p>
        <Button onClick={() => router.push("/")} className="mt-4">
          กลับหน้าแรก
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">ชำระเงิน</h1>
        <p className="text-muted-foreground">
          คำสั่งซื้อ: <span className="font-mono font-medium">{orderNumber}</span>
        </p>
      </div>

      <Card className="p-6 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-4">
            {formatPrice(amount)}
          </div>
          
          {/* PromptPay QR */}
          <div className="bg-white rounded-2xl p-4 inline-block mb-4">
            {qrCodeUrl ? (
              <Image
                src={qrCodeUrl}
                alt="PromptPay QR Code"
                width={200}
                height={200}
                className="mx-auto"
                unoptimized
              />
            ) : (
              <div className="w-[200px] h-[200px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
            <QrCode className="h-4 w-4" />
            <span>สแกน QR Code ด้วยแอปธนาคาร</span>
          </div>

          {/* Manual Info */}
          <div className="bg-muted/50 rounded-xl p-4 text-left">
            <p className="text-sm text-muted-foreground mb-2">หรือโอนเงินไปที่:</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">PromptPay</p>
                <p className="text-lg font-mono">{PROMPTPAY_ID}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={copyAccountInfo}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Slip Upload */}
      <Card className="p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5" />
          อัพโหลดสลิปโอนเงิน
        </h2>

        {slipUploaded ? (
          <div className="text-center py-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold text-green-700 mb-2">
              ส่งสลิปเรียบร้อยแล้ว!
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              เราจะตรวจสอบและแจ้งผลทาง LINE ภายใน 5 นาที
            </p>
            {slipUrl && (
              <Image
                src={slipUrl}
                alt="Uploaded slip"
                width={150}
                height={200}
                className="mx-auto rounded-lg border"
              />
            )}
            <Button 
              onClick={() => router.push("/")} 
              className="mt-6"
            >
              กลับหน้าแรก
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <input
              type="file"
              accept="image/*"
              onChange={handleSlipUpload}
              className="hidden"
              id="slip-upload"
              disabled={isUploading}
            />
            <label htmlFor="slip-upload">
              <div className="border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:border-primary transition-colors">
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">กำลังอัพโหลด...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="font-medium mb-1">แตะเพื่ออัพโหลดสลิป</p>
                    <p className="text-xs text-muted-foreground">
                      รองรับ JPG, PNG
                    </p>
                  </div>
                )}
              </div>
            </label>
          </div>
        )}
      </Card>

      {/* Help */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          มีปัญหา?{" "}
          <a 
            href="https://line.me/R/ti/p/@xxx" 
            target="_blank"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            ติดต่อเรา <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
