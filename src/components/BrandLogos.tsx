"use client";

import Image from "next/image";

const brands = [
    { name: "Ray-Ban", logo: "https://images.unsplash.com/photo-1617957743083-0a80ed3c5a12?w=200&h=80&fit=crop" },
    { name: "Oakley", logo: "https://images.unsplash.com/photo-1617957743083-0a80ed3c5a12?w=200&h=80&fit=crop" },
    { name: "Gucci", logo: "https://images.unsplash.com/photo-1617957743083-0a80ed3c5a12?w=200&h=80&fit=crop" },
    { name: "Prada", logo: "https://images.unsplash.com/photo-1617957743083-0a80ed3c5a12?w=200&h=80&fit=crop" },
    { name: "Tom Ford", logo: "https://images.unsplash.com/photo-1617957743083-0a80ed3c5a12?w=200&h=80&fit=crop" },
    { name: "Dior", logo: "https://images.unsplash.com/photo-1617957743083-0a80ed3c5a12?w=200&h=80&fit=crop" },
];

export default function BrandLogos() {
    return (
        <section className="py-12 lg:py-16 border-y border-border">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">
                        แบรนด์ชั้นนำที่เราจำหน่าย
                    </p>
                </div>

                {/* Brand Logos */}
                <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
                    {brands.map((brand, index) => (
                        <div
                            key={index}
                            className="grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300 cursor-pointer"
                        >
                            <div className="relative w-24 h-10 lg:w-32 lg:h-12 flex items-center justify-center">
                                <span className="text-lg lg:text-xl font-bold text-foreground">
                                    {brand.name}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
