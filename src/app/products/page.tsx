import Link from "next/link";
import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Grid, List } from "lucide-react";

export const metadata: Metadata = {
    title: "สินค้าทั้งหมด",
    description: "เลือกซื้อแว่นตาพรีเมียมจากแบรนด์ดังหลากหลาย Ray-Ban, Oakley, Gucci และอื่นๆ",
};

async function getProducts() {
    const { data: products, error } = await supabase
        .from("products")
        .select(`
            *,
            variants:product_variants(
                id,
                sku,
                color_name,
                color_code,
                price,
                images,
                inventory(quantity)
            )
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching products:", error);
        return [];
    }

    return products;
}

async function getCategories() {
    const { data } = await supabase
        .from("products")
        .select("category")
        .eq("is_active", true)
        .not("category", "is", null);

    if (!data) return [];
    
    const unique = [...new Set(data.map(p => p.category))].filter(Boolean);
    return unique as string[];
}

async function getBrands() {
    const { data } = await supabase
        .from("products")
        .select("brand")
        .eq("is_active", true)
        .not("brand", "is", null);

    if (!data) return [];
    
    const unique = [...new Set(data.map(p => p.brand))].filter(Boolean);
    return unique as string[];
}

export default async function ProductsPage() {
    const [products, categories, brands] = await Promise.all([
        getProducts(),
        getCategories(),
        getBrands(),
    ]);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">สินค้าทั้งหมด</h1>
                    <p className="text-muted-foreground mt-1">
                        แว่นตาพรีเมียมคุณภาพสูงจากแบรนด์ชั้นนำ ({products.length} รายการ)
                    </p>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-border">
                {/* Category Pills */}
                <Link
                    href="/products"
                    className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
                >
                    ทั้งหมด
                </Link>
                {categories.slice(0, 5).map((cat) => (
                    <Link
                        key={cat}
                        href={`/products?category=${encodeURIComponent(cat)}`}
                        className="px-4 py-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 text-sm font-medium transition-colors"
                    >
                        {cat === "Sunglasses" ? "แว่นกันแดด" : 
                         cat === "Eyeglasses" ? "แว่นสายตา" :
                         cat === "Lenses" ? "เลนส์" :
                         cat === "Accessories" ? "อุปกรณ์เสริม" : cat}
                    </Link>
                ))}

                {/* Divider */}
                <div className="hidden md:block w-px h-6 bg-border" />

                {/* Brand Pills */}
                {brands.slice(0, 4).map((brand) => (
                    <Link
                        key={brand}
                        href={`/products?brand=${encodeURIComponent(brand)}`}
                        className="px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary text-sm transition-colors"
                    >
                        {brand}
                    </Link>
                ))}
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Load More */}
                    {products.length >= 20 && (
                        <div className="text-center mt-12">
                            <Button variant="outline" size="lg" className="rounded-full px-8">
                                โหลดเพิ่มเติม
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                        <SlidersHorizontal className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">ยังไม่มีสินค้า</h3>
                    <p className="text-muted-foreground mb-6">
                        สินค้าจะแสดงที่นี่เมื่อมีการเพิ่มเข้าระบบ
                    </p>
                    <Button asChild>
                        <Link href="/admin/products/new">เพิ่มสินค้าแรก</Link>
                    </Button>
                </div>
            )}

            {/* Info Banner */}
            <div className="mt-16 bg-card rounded-2xl p-6 lg:p-8 border border-border text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    ต้องการความช่วยเหลือในการเลือกแว่นตา?
                </h3>
                <p className="text-muted-foreground mb-4">
                    ทีมผู้เชี่ยวชาญของเราพร้อมให้คำปรึกษาฟรี
                </p>
                <div className="flex gap-4 justify-center">
                    <Button asChild>
                        <a href="https://line.me/ti/p/@thevisionary" target="_blank" rel="noopener noreferrer">
                            💬 แชทกับเรา
                        </a>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/faq">ดู FAQ</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
