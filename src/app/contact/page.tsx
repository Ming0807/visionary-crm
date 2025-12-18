import { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
    title: "ติดต่อเรา",
    description: "ติดต่อ The Visionary ร้านแว่นตาพรีเมียม พร้อมให้บริการทุกวัน",
};

const contactInfo = [
    {
        icon: MapPin,
        title: "ที่อยู่ร้าน",
        content: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110",
        link: "https://maps.google.com",
        linkText: "ดูแผนที่",
    },
    {
        icon: Phone,
        title: "โทรศัพท์",
        content: "02-XXX-XXXX",
        link: "tel:02XXXXXXX",
        linkText: "โทรเลย",
    },
    {
        icon: Mail,
        title: "อีเมล",
        content: "hello@thevisionary.co.th",
        link: "mailto:hello@thevisionary.co.th",
        linkText: "ส่งอีเมล",
    },
    {
        icon: MessageCircle,
        title: "LINE Official",
        content: "@thevisionary",
        link: "https://line.me/ti/p/@thevisionary",
        linkText: "แชทเลย",
    },
];

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-12">
                <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                    Contact Us
                </span>
                <h1 className="text-4xl font-bold text-foreground mb-4">ติดต่อเรา</h1>
                <p className="text-muted-foreground">
                    มีคำถาม? ต้องการคำแนะนำ? ทีมงานพร้อมให้บริการคุณทุกวัน
                </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* Contact Info */}
                <div>
                    <div className="grid sm:grid-cols-2 gap-6 mb-8">
                        {contactInfo.map((info, index) => (
                            <div
                                key={index}
                                className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                    <info.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                                <p className="text-sm text-muted-foreground mb-3">{info.content}</p>
                                <a
                                    href={info.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline font-medium"
                                >
                                    {info.linkText} →
                                </a>
                            </div>
                        ))}
                    </div>

                    {/* Hours */}
                    <div className="bg-card rounded-2xl p-6 border border-border">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="font-semibold text-foreground">เวลาทำการ</h3>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">จันทร์ - ศุกร์</span>
                                <span className="text-foreground font-medium">10:00 - 21:00</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">เสาร์ - อาทิตย์</span>
                                <span className="text-foreground font-medium">10:00 - 22:00</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">วันหยุดนักขัตฤกษ์</span>
                                <span className="text-foreground font-medium">11:00 - 20:00</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-card rounded-2xl p-8 border border-border">
                    <h2 className="text-2xl font-bold text-foreground mb-2">ส่งข้อความถึงเรา</h2>
                    <p className="text-muted-foreground text-sm mb-6">
                        กรอกแบบฟอร์มด้านล่าง เราจะติดต่อกลับภายใน 24 ชั่วโมง
                    </p>

                    <form className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1 block">
                                    ชื่อ-นามสกุล *
                                </label>
                                <Input placeholder="กรอกชื่อของคุณ" required />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground mb-1 block">
                                    เบอร์โทรศัพท์ *
                                </label>
                                <Input type="tel" placeholder="0XX-XXX-XXXX" required />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">
                                อีเมล
                            </label>
                            <Input type="email" placeholder="email@example.com" />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">
                                หัวข้อ
                            </label>
                            <select className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm">
                                <option value="">เลือกหัวข้อ</option>
                                <option value="product">สอบถามสินค้า</option>
                                <option value="order">สอบถามคำสั่งซื้อ</option>
                                <option value="warranty">เคลมประกัน / ซ่อม</option>
                                <option value="other">อื่นๆ</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">
                                ข้อความ *
                            </label>
                            <textarea
                                className="w-full min-h-[120px] px-3 py-2 rounded-md border border-border bg-background text-sm resize-none"
                                placeholder="รายละเอียดที่ต้องการสอบถาม..."
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" size="lg">
                            <Send className="h-4 w-4 mr-2" />
                            ส่งข้อความ
                        </Button>
                    </form>
                </div>
            </div>

            {/* Map Placeholder */}
            <div className="mt-12 rounded-2xl overflow-hidden border border-border h-[400px] bg-muted flex items-center justify-center">
                <div className="text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Google Maps จะแสดงที่นี่</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        123 ถนนสุขุมวิท กรุงเทพฯ
                    </p>
                </div>
            </div>
        </div>
    );
}
