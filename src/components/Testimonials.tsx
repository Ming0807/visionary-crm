import { Star, Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
    {
        id: 1,
        name: "คุณแพรว",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        rating: 5,
        text: "ซื้อแว่น Ray-Ban มา สวยมากคะ ของแท้ บริการดีเยี่ยม จัดส่งเร็วมาก 2 วันก็ได้รับแล้ว",
        product: "Ray-Ban Aviator Classic",
    },
    {
        id: 2,
        name: "คุณต้า",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
        rating: 5,
        text: "ประทับใจมากครับ แนะนำเลนส์ได้ดี ตัดแว่นเสร็จเร็ว ใส่สบายตา ไม่มืนหัว",
        product: "Oakley Holbrook",
    },
    {
        id: 3,
        name: "คุณแนน",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
        rating: 5,
        text: "เป็นลูกค้าประจำมา 3 ปีแล้วคะ บริการหลังการขายดีมาก เปลี่ยนเลนส์ ปรับกรอบ ฟรีตลอด",
        product: "Tom Ford FT5294",
    },
    {
        id: 4,
        name: "คุณบอส",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
        rating: 5,
        text: "ราคาดีที่สุดที่หาได้ ของแท้ มีใบรับประกัน ผ่อนได้ด้วย ต้องบอกต่อเลย",
        product: "Gucci GG0061S",
    },
];

export default function Testimonials() {
    return (
        <section className="py-16 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                        ลูกค้าของเราพูดถึงเรา
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        รีวิวจริงจากลูกค้าที่ไว้วางใจ The Visionary
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow"
                        >
                            {/* Quote Icon */}
                            <Quote className="h-8 w-8 text-primary/20 mb-4" />
                            
                            {/* Rating */}
                            <div className="flex gap-1 mb-3">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                    />
                                ))}
                            </div>

                            {/* Text */}
                            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                "{testimonial.text}"
                            </p>

                            {/* Product */}
                            <p className="text-xs text-primary font-medium mb-4">
                                ซื้อ: {testimonial.product}
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                    <Image
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground text-sm">
                                        {testimonial.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        ลูกค้า Verified ✓
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
