import { Metadata } from "next";
import Link from "next/link";
import { Truck, Clock, MapPin, Package, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "การจัดส่ง",
    description: "ข้อมูลการจัดส่งสินค้า ค่าส่ง และระยะเวลาในการจัดส่งของ The Visionary",
};

const shippingMethods = [
    {
        name: "จัดส่งปกติ",
        price: "฿50 - ฿100",
        time: "2-4 วันทำการ",
        description: "ส่งฟรีเมื่อซื้อครบ ฿1,500",
        icon: Truck,
    },
    {
        name: "จัดส่งด่วน",
        price: "฿150",
        time: "1-2 วันทำการ",
        description: "กรุงเทพฯ และปริมณฑล",
        icon: Clock,
    },
];

const areas = [
    { area: "กรุงเทพฯ และปริมณฑล", time: "1-2 วันทำการ" },
    { area: "ภาคกลาง", time: "2-3 วันทำการ" },
    { area: "ภาคเหนือ / ภาคอีสาน", time: "3-4 วันทำการ" },
    { area: "ภาคใต้", time: "3-5 วันทำการ" },
];

const packagingFeatures = [
    "บรรจุภัณฑ์กันกระแทกหลายชั้น",
    "กล่องแข็งแรงพร้อมกันสั่นสะเทือน",
    "มีกล่องใส่แว่นตาพรีเมียมพร้อมผ้าเช็ดเลนส์",
    "ใบรับประกันและใบเสร็จรับเงิน",
];

export default function ShippingPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h1 className="text-4xl font-bold text-foreground mb-4">การจัดส่ง</h1>
                <p className="text-muted-foreground">
                    เราใส่ใจทุกการจัดส่ง เพื่อให้สินค้าถึงมือคุณอย่างปลอดภัย
                </p>
            </div>

            {/* Free Shipping Banner */}
            <div className="bg-primary/10 rounded-2xl p-6 lg:p-8 text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <Truck className="h-8 w-8 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">ส่งฟรีทั่วประเทศ!</h2>
                </div>
                <p className="text-muted-foreground">เมื่อซื้อสินค้าครบ ฿1,500 ขึ้นไป</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 mb-12">
                {/* Shipping Methods */}
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-6">รูปแบบการจัดส่ง</h2>
                    <div className="space-y-4">
                        {shippingMethods.map((method, index) => (
                            <div
                                key={index}
                                className="bg-card rounded-xl p-6 border border-border flex items-start gap-4"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <method.icon className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-semibold text-foreground">{method.name}</h3>
                                        <span className="text-primary font-bold">{method.price}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                        ระยะเวลา: {method.time}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{method.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Delivery Areas */}
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-6">ระยะเวลาจัดส่งตามพื้นที่</h2>
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left p-4 font-medium text-foreground">พื้นที่</th>
                                    <th className="text-right p-4 font-medium text-foreground">ระยะเวลา</th>
                                </tr>
                            </thead>
                            <tbody>
                                {areas.map((area, index) => (
                                    <tr key={index} className="border-t border-border">
                                        <td className="p-4 text-sm text-muted-foreground">{area.area}</td>
                                        <td className="p-4 text-sm text-right font-medium text-foreground">
                                            {area.time}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Packaging */}
            <div className="bg-card rounded-2xl p-8 border border-border mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <Package className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">บรรจุภัณฑ์ปลอดภัย</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    {packagingFeatures.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="text-center">
                <p className="text-muted-foreground mb-4">มีคำถามเกี่ยวกับการจัดส่ง?</p>
                <div className="flex gap-4 justify-center">
                    <Button asChild>
                        <Link href="/faq">ดูคำถามที่พบบ่อย</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/contact">ติดต่อเรา</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
