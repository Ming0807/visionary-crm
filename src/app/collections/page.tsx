import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Tag, Star } from "lucide-react";

export const metadata: Metadata = {
    title: "คอลเลกชัน",
    description: "เลือกซื้อแว่นตาจากคอลเลกชันหลากหลายสไตล์ ทั้ง แว่นกันแดด แว่นสายตา และอุปกรณ์เสริม",
};

const collections = [
    {
        id: "sunglasses",
        name: "แว่นกันแดด",
        nameEn: "Sunglasses",
        description: "ปกป้องดวงตาด้วยสไตล์ แว่นกันแดดคุณภาพจากแบรนด์ดัง",
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=600&fit=crop",
        href: "/products?category=Sunglasses",
        productCount: 50,
        featured: true,
    },
    {
        id: "eyeglasses",
        name: "แว่นสายตา",
        nameEn: "Eyeglasses",
        description: "กรอบแว่นหลากหลายสไตล์ พร้อมบริการตัดเลนส์ตามค่าสายตา",
        image: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800&h=600&fit=crop",
        href: "/products?category=Eyeglasses",
        productCount: 80,
        featured: true,
    },
    {
        id: "lenses",
        name: "เลนส์",
        nameEn: "Lenses",
        description: "เลนส์คุณภาพสูง กรองแสง Blue Cut, Photochromic, Progressive",
        image: "https://images.unsplash.com/photo-1516714819001-8ee7a13b71d7?w=800&h=600&fit=crop",
        href: "/products?category=Lenses",
        productCount: 25,
        featured: false,
    },
    {
        id: "accessories",
        name: "อุปกรณ์เสริม",
        nameEn: "Accessories",
        description: "กล่องแว่น, สายคล้อง, น้ำยาเช็ดเลนส์ และอื่นๆ",
        image: "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?w=800&h=600&fit=crop",
        href: "/products?category=Accessories",
        productCount: 30,
        featured: false,
    },
];

const specialCollections = [
    {
        id: "new-arrivals",
        name: "สินค้าใหม่",
        description: "แว่นตาคอลเลกชันล่าสุด",
        href: "/products?sort=newest",
        icon: Sparkles,
        color: "bg-blue-500",
    },
    {
        id: "sale",
        name: "ลดราคา",
        description: "ส่วนลดสูงสุด 50%",
        href: "/products?sale=true",
        icon: Tag,
        color: "bg-red-500",
    },
    {
        id: "bestsellers",
        name: "ขายดี",
        description: "สินค้ายอดนิยม",
        href: "/products?sort=bestseller",
        icon: Star,
        color: "bg-amber-500",
    },
];

export default function CollectionsPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-foreground mb-4">คอลเลกชัน</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    เลือกซื้อแว่นตาจากคอลเลกชันหลากหลายสไตล์ ทุกชิ้นคัดสรรมาเพื่อคุณ
                </p>
            </div>

            {/* Special Collections */}
            <div className="grid md:grid-cols-3 gap-4 mb-12">
                {specialCollections.map((col) => (
                    <Link
                        key={col.id}
                        href={col.href}
                        className="group flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:shadow-lg transition-shadow"
                    >
                        <div className={`w-12 h-12 rounded-xl ${col.color} flex items-center justify-center`}>
                            <col.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {col.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">{col.description}</p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                ))}
            </div>

            {/* Main Collections */}
            <h2 className="text-2xl font-bold text-foreground mb-6">หมวดหมู่สินค้า</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
                {collections.filter(c => c.featured).map((collection) => (
                    <Link
                        key={collection.id}
                        href={collection.href}
                        className="group relative aspect-[16/9] rounded-3xl overflow-hidden"
                    >
                        <Image
                            src={collection.image}
                            alt={collection.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                            <span className="text-xs text-white/60 uppercase tracking-wider">{collection.nameEn}</span>
                            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">{collection.name}</h3>
                            <p className="text-white/80 text-sm mb-4 max-w-md">{collection.description}</p>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-white/60">{collection.productCount}+ สินค้า</span>
                                <span className="inline-flex items-center text-white font-medium text-sm opacity-0 transform translate-y-2 transition-all group-hover:opacity-100 group-hover:translate-y-0">
                                    ดูทั้งหมด <ArrowRight className="ml-1 h-4 w-4" />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Other Collections */}
            <div className="grid md:grid-cols-2 gap-6">
                {collections.filter(c => !c.featured).map((collection) => (
                    <Link
                        key={collection.id}
                        href={collection.href}
                        className="group relative aspect-[2/1] rounded-2xl overflow-hidden"
                    >
                        <Image
                            src={collection.image}
                            alt={collection.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
                        <div className="absolute inset-0 p-6 flex flex-col justify-center">
                            <span className="text-xs text-white/60 uppercase tracking-wider">{collection.nameEn}</span>
                            <h3 className="text-xl font-bold text-white mb-1">{collection.name}</h3>
                            <p className="text-white/70 text-sm">{collection.description}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
                <Button asChild size="lg" className="rounded-full px-8">
                    <Link href="/products">
                        ดูสินค้าทั้งหมด
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}
