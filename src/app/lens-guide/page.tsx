import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Eye, Glasses, Sun, Shield, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
    title: "คู่มือเลือกเลนส์",
    description: "คำแนะนำในการเลือกเลนส์แว่นตาที่เหมาะกับการใช้งานของคุณ",
};

const lensTypes = [
    {
        name: "เลนส์สายตาปกติ",
        nameEn: "Single Vision",
        description: "สำหรับสายตาสั้น, ยาว, หรือเอียง ใช้ระยะเดียว",
        icon: Eye,
        suitable: ["ใช้งานทั่วไป", "อ่านหนังสือ", "ทำงานคอมพิวเตอร์"],
        price: "เริ่มต้น ฿1,500",
    },
    {
        name: "เลนส์โปรเกรสซีฟ",
        nameEn: "Progressive",
        description: "เลนส์ไร้รอยต่อ มองได้ทุกระยะในเลนส์เดียว",
        icon: Glasses,
        suitable: ["อายุ 40+ ปี", "สายตายาวตามอายุ", "ต้องมองหลายระยะ"],
        price: "เริ่มต้น ฿4,500",
    },
    {
        name: "เลนส์ Blue Cut",
        nameEn: "Blue Light Filter",
        description: "กรองแสงสีฟ้าจากหน้าจอ ลดอาการเมื่อยล้า",
        icon: Shield,
        suitable: ["ทำงานหน้าจอนาน", "เล่นเกม", "ใช้มือถือบ่อย"],
        price: "เพิ่ม ฿500-1,500",
    },
    {
        name: "เลนส์ปรับแสง",
        nameEn: "Photochromic / Transitions",
        description: "เปลี่ยนสีอัตโนมัติตามแสงแดด",
        icon: Sun,
        suitable: ["เข้าออกอาคารบ่อย", "ขับรถ", "กิจกรรมกลางแจ้ง"],
        price: "เพิ่ม ฿2,000-4,000",
    },
];

const coatings = [
    { name: "AR Coating", description: "ลดแสงสะท้อน มองชัดขึ้น" },
    { name: "Scratch Resistant", description: "กันรอยขีดข่วน" },
    { name: "Hydrophobic", description: "กันน้ำ กันฝุ่น" },
    { name: "UV Protection", description: "ป้องกัน UV 100%" },
];

export default function LensGuidePage() {
    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-12">
                <h1 className="text-4xl font-bold text-foreground mb-4">คู่มือเลือกเลนส์</h1>
                <p className="text-muted-foreground">
                    เลนส์ที่ดีต้องเหมาะกับการใช้งานของคุณ มาดูว่าเลนส์ประเภทไหนเหมาะกับคุณ
                </p>
            </div>

            {/* Lens Types */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                {lensTypes.map((lens, index) => (
                    <div
                        key={index}
                        className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <lens.icon className="h-7 w-7 text-primary" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h3 className="font-bold text-foreground">{lens.name}</h3>
                                        <p className="text-xs text-muted-foreground">{lens.nameEn}</p>
                                    </div>
                                    <span className="text-sm text-primary font-medium">{lens.price}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{lens.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {lens.suitable.map((item, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground"
                                        >
                                            ✓ {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Coatings */}
            <div className="bg-card rounded-2xl p-8 border border-border mb-12">
                <h2 className="text-xl font-bold text-foreground mb-6">Coating เพิ่มเติม</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {coatings.map((coating, index) => (
                        <div key={index} className="text-center p-4 rounded-xl bg-muted/50">
                            <h4 className="font-medium text-foreground mb-1">{coating.name}</h4>
                            <p className="text-xs text-muted-foreground">{coating.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="text-center bg-primary/10 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-foreground mb-4">ยังไม่แน่ใจว่าจะเลือกอะไร?</h2>
                <p className="text-muted-foreground mb-6">
                    ให้ผู้เชี่ยวชาญของเราช่วยแนะนำเลนส์ที่เหมาะกับคุณ
                </p>
                <div className="flex gap-4 justify-center">
                    <Button asChild size="lg">
                        <a href="https://line.me/ti/p/@thevisionary" target="_blank" rel="noopener noreferrer">
                            💬 ปรึกษาฟรี
                        </a>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                        <Link href="/products?category=Lenses">ดูเลนส์ทั้งหมด</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
