"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const claimTypes = [
  { value: "return", label: "Return - ต้องการคืนสินค้า" },
  { value: "exchange", label: "Exchange - ต้องการเปลี่ยนสินค้า" },
  { value: "claim", label: "Claim - สินค้ามีปัญหา/ชำรุด" },
];

const reasons = [
  { value: "defective", label: "สินค้าชำรุด/ใช้งานไม่ได้" },
  { value: "wrong_item", label: "ได้รับสินค้าผิดรายการ" },
  { value: "not_as_described", label: "สินค้าไม่ตรงตามรายละเอียด" },
  { value: "damaged_shipping", label: "เสียหายจากการขนส่ง" },
  { value: "change_mind", label: "เปลี่ยนใจ" },
  { value: "other", label: "อื่นๆ" },
];

export default function ClaimsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    orderNumber: "",
    phone: "",
    claimType: "return",
    reason: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit claim");
      }

      toast({
        title: "เรื่องร้องเรียนสำเร็จ!",
        description: "ทีมงานจะติดต่อกลับภายใน 1-2 วันทำการ",
      });

      router.push("/claims/success");
    } catch (error) {
      console.error("Claim error:", error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error instanceof Error ? error.message : "กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          แจ้งเคลม / คืนสินค้า
        </h1>
        <p className="text-muted-foreground">
          กรอกข้อมูลด้านล่างเพื่อแจ้งเรื่องร้องเรียนหรือขอคืนสินค้า
        </p>
      </div>

      <div className="bg-card rounded-2xl p-6 lg:p-8 border border-border">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orderNumber">หมายเลขคำสั่งซื้อ *</Label>
              <Input
                id="orderNumber"
                value={formData.orderNumber}
                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                placeholder="INV-20241213-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">เบอร์โทรศัพท์ *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="081-234-5678"
                required
              />
            </div>
          </div>

          {/* Claim Type */}
          <div className="space-y-2">
            <Label>ประเภทการแจ้ง *</Label>
            <Select
              value={formData.claimType}
              onValueChange={(value) => setFormData({ ...formData, claimType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {claimTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>สาเหตุ *</Label>
            <Select
              value={formData.reason}
              onValueChange={(value) => setFormData({ ...formData, reason: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกสาเหตุ" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียดเพิ่มเติม</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="กรุณาอธิบายปัญหาหรือเหตุผลเพิ่มเติม..."
              rows={4}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isSubmitting || !formData.orderNumber || !formData.phone || !formData.reason}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังส่ง...
              </>
            ) : (
              "ส่งเรื่องร้องเรียน"
            )}
          </Button>
        </form>
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-muted/50 rounded-xl text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-2">หมายเหตุ:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>สามารถแจ้งเคลมได้ภายใน 7 วันหลังจากได้รับสินค้า</li>
          <li>กรณีเปลี่ยนใจ รับพิจารณาเฉพาะสินค้าที่ยังไม่ได้แกะซีล</li>
          <li>ทีมงานจะติดต่อกลับภายใน 1-2 วันทำการ</li>
        </ul>
      </div>
    </div>
  );
}
