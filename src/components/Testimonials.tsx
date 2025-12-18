import { Star, Quote, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface Testimonial {
    id: string;
    customer_name: string;
    avatar_url: string;
    rating: number;
    comment: string;
    product_name: string;
}

// Empty fallback - we want to show real data only
const fallbackTestimonials: Testimonial[] = [];

async function getTestimonials(): Promise<Testimonial[]> {
    try {
        const { data, error } = await supabase
            .from("testimonials")
            .select("*")
            .eq("is_active", true)
            .eq("is_featured", true)
            .order("display_order", { ascending: true })
            .limit(4);

        if (error) {
            console.error("Testimonials fetch error:", error);
            return fallbackTestimonials;
        }

        return data || fallbackTestimonials;
    } catch (e) {
        console.error("Testimonials error:", e);
        return fallbackTestimonials;
    }
}

export default async function Testimonials() {
    const testimonials = await getTestimonials();

    // Don't render if no testimonials
    if (!testimonials || testimonials.length === 0) {
        return null;
    }

    return (
        <section className="py-16 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                        ลูกค้าของเราพูดถึงเรา
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        รีวิวจากลูกค้าที่ไว้วางใจเลือกซื้อแว่นตากับเรา
                    </p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                            </div>

                            {/* Comment */}
                            <p className="text-foreground mb-6 line-clamp-4">
                                "{testimonial.comment}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center gap-3">
                                {testimonial.avatar_url ? (
                                    <Image
                                        src={testimonial.avatar_url}
                                        alt={testimonial.customer_name}
                                        width={40}
                                        height={40}
                                        className="rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-primary font-semibold">
                                            {testimonial.customer_name.charAt(0)}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium text-foreground text-sm">
                                        {testimonial.customer_name}
                                    </p>
                                    {testimonial.product_name && (
                                        <p className="text-xs text-muted-foreground">
                                            ซื้อ {testimonial.product_name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Button */}
                <div className="text-center mt-10">
                    <Button asChild variant="outline" size="lg" className="rounded-full">
                        <Link href="/reviews">
                            ดูรีวิวทั้งหมด
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
