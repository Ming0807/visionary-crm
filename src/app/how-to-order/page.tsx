import { Metadata } from "next";
import Link from "next/link";
import { ShoppingCart, CreditCard, Truck, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "วิธีการสั่งซื้อ",
    description: "ขั้นตอนการสั่งซื้อสินค้าจาก The Visionary ง่ายๆ เพียง 4 ขั้นตอน",
};

const steps = [
    {
        step: 1,
        title: "เลือกสินค้า",
        description: "เลือกแว่นตาที่คุณชื่นชอบ เลือกสีและขนาดที่ต้องการ",
        icon: ShoppingCart,
        tips: ["กดดูรายละเอียดสินค้าเพื่อดูรูปเพิ่มเติม", "เลือกสีจากตัวเลือกที่มี", "ดูสถานะสินค้าคงเหลือ"],
    },
    {
        step: 2,
        title: "เพิ่มลงตะกร้า",
        description: "กดปุ่ม 'เพิ่มลงตะกร้า' สามารถเพิ่มได้หลายชิ้น",
        icon: ShoppingCart,
        tips: ["ตรวจสอบจำนวนสินค้าในตะกร้า", "สามารถแก้ไขหรือลบสินค้าได้", "ดูยอดรวมก่อนสั่งซื้อ"],
    },
    {
        step: 3,
        title: "กรอกข้อมูลและชำระเงิน",
        description: "กรอกที่อยู่จัดส่ง เลือกวิธีชำระเงินที่สะดวก",
        icon: CreditCard,
        tips: ["โอนเงิน / PromptPay / บัตรเครดิต", "ผ่อน 0% สูงสุด 10 เดือน", "ชำระภายใน 24 ชั่วโมง"],
    },
    {
        step: 4,
        title: "รอรับสินค้า",
        description: "เราจัดส่งให้คุณถึงบ้าน พร้อมติดตามพัสดุได้",
        icon: Truck,
        tips: ["รับ Tracking ทาง LINE/Email", "จัดส่ง 1-4 วันทำการ", "ส่งฟรีเมื่อซื้อครบ ฿1,500"],
    },
];

const paymentMethods = [
    { name: "โอนธนาคาร", banks: ["SCB", "KBANK", "BBL", "KTB"] },
    { name: "PromptPay", banks: ["สแกน QR ชำระเงิน"] },
    { name: "บัตรเครดิต/เดบิต", banks: ["VISA", "Mastercard"] },
    { name: "ผ่อนชำระ 0%", banks: ["KBank", "SCB", "Krungsri"] },
];

export default function HowToOrderPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h1 className="text-4xl font-bold text-foreground mb-4">วิธีการสั่งซื้อ</h1>
                <p className="text-muted-foreground">
                    สั่งซื้อง่ายๆ เพียง 4 ขั้นตอน จัดส่งถึงบ้านทั่วประเทศ
                </p>
            </div>

            {/* Steps */}
            <div className="max-w-4xl mx-auto mb-16">
                {steps.map((step, index) => (
                    <div key={step.step} className="relative">
                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div className="absolute left-8 top-20 w-0.5 h-24 bg-border hidden md:block" />
                        )}

                        <div className="flex gap-6 mb-8">
                            {/* Step Number */}
                            <div className="flex-shrink-0">
                                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
                                    <step.icon className="h-7 w-7 text-primary-foreground" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 bg-card rounded-2xl p-6 border border-border">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                                        ขั้นตอนที่ {step.step}
                                    </span>
                                    <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                                </div>
                                <p className="text-muted-foreground mb-4">{step.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {step.tips.map((tip, i) => (
                                        <span
                                            key={i}
                                            className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-full"
                                        >
                                            ✓ {tip}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment Methods */}
            <div className="bg-card rounded-2xl p-8 border border-border mb-12">
                <h2 className="text-xl font-bold text-foreground mb-6 text-center">ช่องทางชำระเงิน</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {paymentMethods.map((method, index) => (
                        <div key={index} className="text-center p-4 rounded-xl bg-muted/50">
                            <h4 className="font-medium text-foreground mb-2">{method.name}</h4>
                            <div className="flex flex-wrap justify-center gap-1">
                                {method.banks.map((bank, i) => (
                                    <span key={i} className="text-xs text-muted-foreground">
                                        {bank}
                                        {i < method.banks.length - 1 && " •"}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-4">พร้อมสั่งซื้อแล้วใช่ไหม?</h2>
                <div className="flex gap-4 justify-center">
                    <Button asChild size="lg" className="rounded-full px-8">
                        <Link href="/products">
                            เลือกซื้อเลย
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full">
                        <Link href="/faq">ดู FAQ</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
