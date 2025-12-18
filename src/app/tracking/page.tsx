import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Package, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
    title: "ติดตามพัสดุ",
    description: "ติดตามสถานะการจัดส่งสินค้าของคุณ ด้วยเลขคำสั่งซื้อหรือเลข Tracking",
};

const trackingSteps = [
    { id: 1, label: "ยืนยันคำสั่งซื้อ", description: "รับออเดอร์แล้ว" },
    { id: 2, label: "กำลังจัดเตรียม", description: "เตรียมสินค้า" },
    { id: 3, label: "จัดส่งแล้ว", description: "ส่งมอบขนส่ง" },
    { id: 4, label: "กำลังนำส่ง", description: "อยู่ระหว่างขนส่ง" },
    { id: 5, label: "ได้รับสินค้า", description: "ส่งสำเร็จ" },
];

export default function TrackingPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-12">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Package className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-4">ติดตามพัสดุ</h1>
                <p className="text-muted-foreground">
                    กรอกเลขคำสั่งซื้อหรือเลข Tracking เพื่อตรวจสอบสถานะการจัดส่ง
                </p>
            </div>

            {/* Search Form */}
            <div className="max-w-xl mx-auto mb-12">
                <form className="flex gap-3">
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="เลขคำสั่งซื้อ เช่น ORD-2024XXXXX"
                            className="h-14 pl-12 rounded-full"
                        />
                    </div>
                    <Button type="submit" size="lg" className="h-14 px-8 rounded-full">
                        ค้นหา
                    </Button>
                </form>
            </div>

            {/* Example Tracking Steps */}
            <div className="max-w-2xl mx-auto bg-card rounded-2xl p-8 border border-border mb-12">
                <h2 className="text-lg font-semibold text-foreground mb-6">ตัวอย่างสถานะการจัดส่ง</h2>
                <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
                    
                    {/* Steps */}
                    <div className="space-y-6">
                        {trackingSteps.map((step, index) => {
                            const isCompleted = index < 3; // Example: first 3 completed
                            const isCurrent = index === 3;

                            return (
                                <div key={step.id} className="flex items-start gap-4">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                                            isCompleted
                                                ? "bg-green-500 text-white"
                                                : isCurrent
                                                ? "bg-primary text-primary-foreground animate-pulse"
                                                : "bg-muted text-muted-foreground"
                                        }`}
                                    >
                                        {step.id}
                                    </div>
                                    <div className="flex-1 pt-2">
                                        <p
                                            className={`font-medium ${
                                                isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                                            }`}
                                        >
                                            {step.label}
                                        </p>
                                        <p className="text-sm text-muted-foreground">{step.description}</p>
                                        {isCurrent && (
                                            <p className="text-xs text-primary mt-1">อัปเดตล่าสุด: วันนี้ 14:30</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="bg-card rounded-2xl p-6 border border-border">
                    <h3 className="font-semibold text-foreground mb-2">ไม่มีเลขคำสั่งซื้อ?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        ตรวจสอบอีเมลหรือ LINE ที่คุณใช้สมัครสมาชิก เราจะส่งข้อมูลคำสั่งซื้อไปให้คุณ
                    </p>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/account">ดูประวัติคำสั่งซื้อ</Link>
                    </Button>
                </div>

                <div className="bg-card rounded-2xl p-6 border border-border">
                    <h3 className="font-semibold text-foreground mb-2">ต้องการความช่วยเหลือ?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        ทีมงานพร้อมให้บริการคุณทุกวัน 10:00 - 21:00 น.
                    </p>
                    <Button asChild size="sm">
                        <a href="https://line.me/ti/p/@thevisionary" target="_blank" rel="noopener noreferrer">
                            💬 แชทกับเรา
                        </a>
                    </Button>
                </div>
            </div>
        </div>
    );
}
