import { Star, Quote, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "รีวิวจากลูกค้า | The Visionary",
    description: "อ่านรีวิวจากลูกค้าที่ซื้อแว่นตาจากร้าน The Visionary ความประทับใจและประสบการณ์จริงจากผู้ใช้งาน",
    openGraph: {
        title: "รีวิวจากลูกค้า | The Visionary",
        description: "อ่านรีวิวจากลูกค้าที่ซื้อแว่นตาจากร้าน The Visionary",
    },
};

interface Testimonial {
    id: string;
    customer_name: string;
    avatar_url: string;
    rating: number;
    comment: string;
    product_name: string;
    created_at: string;
}

async function getTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching testimonials:", error);
        return [];
    }

    return data || [];
}

export default async function ReviewsPage() {
    const testimonials = await getTestimonials();

    const averageRating = testimonials.length > 0
        ? (testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length).toFixed(1)
        : "5.0";

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-primary/5 to-background py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-3xl lg:text-5xl font-bold mb-4">
                        รีวิวจากลูกค้าของเรา
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                        ความประทับใจและประสบการณ์จริงจากลูกค้าที่ไว้วางใจเลือกซื้อแว่นตากับ The Visionary
                    </p>
                    
                    {/* Stats */}
                    <div className="flex justify-center gap-8 mb-8">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                                <span className="text-3xl font-bold">{averageRating}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">คะแนนเฉลี่ย</p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <MessageSquare className="h-6 w-6 text-primary" />
                                <span className="text-3xl font-bold">{testimonials.length}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">รีวิวทั้งหมด</p>
                        </div>
                    </div>

                    <Button asChild size="lg" className="rounded-full">
                        <Link href="/products">
                            เลือกซื้อสินค้า
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Reviews Grid */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    {testimonials.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {testimonials.map((testimonial) => (
                                <div
                                    key={testimonial.id}
                                    className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg transition-shadow relative"
                                >
                                    {/* Quote Icon */}
                                    <Quote className="h-8 w-8 text-primary/20 absolute top-4 right-4" />

                                    {/* Stars */}
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                            />
                                        ))}
                                        {[...Array(5 - testimonial.rating)].map((_, i) => (
                                            <Star
                                                key={`empty-${i}`}
                                                className="h-4 w-4 text-gray-200"
                                            />
                                        ))}
                                    </div>

                                    {/* Comment */}
                                    <p className="text-foreground mb-6">
                                        "{testimonial.comment}"
                                    </p>

                                    {/* Author */}
                                    <div className="flex items-center gap-3">
                                        {testimonial.avatar_url ? (
                                            <Image
                                                src={testimonial.avatar_url}
                                                alt={testimonial.customer_name}
                                                width={48}
                                                height={48}
                                                className="rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="text-primary font-semibold text-lg">
                                                    {testimonial.customer_name.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {testimonial.customer_name}
                                            </p>
                                            {testimonial.product_name && (
                                                <p className="text-sm text-muted-foreground">
                                                    ซื้อ {testimonial.product_name}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <p className="text-xs text-muted-foreground mt-4">
                                        {new Date(testimonial.created_at).toLocaleDateString("th-TH", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <h2 className="text-xl font-semibold mb-2">ยังไม่มีรีวิว</h2>
                            <p className="text-muted-foreground mb-6">
                                เป็นคนแรกที่มาแบ่งปันประสบการณ์!
                            </p>
                            <Button asChild>
                                <Link href="/products">เลือกซื้อสินค้า</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            {testimonials.length > 0 && (
                <section className="py-16 bg-primary/5">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                            พร้อมเป็นส่วนหนึ่งกับเรา?
                        </h2>
                        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                            ซื้อแว่นตาคุณภาพจาก The Visionary และแบ่งปันประสบการณ์ของคุณ
                        </p>
                        <Button asChild size="lg" className="rounded-full">
                            <Link href="/products">เลือกซื้อสินค้าเลย</Link>
                        </Button>
                    </div>
                </section>
            )}
        </div>
    );
}
