import Link from "next/link";
import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Tag } from "lucide-react";

export const metadata: Metadata = {
    title: "สินค้าทั้งหมด",
    description: "เลือกซื้อแว่นตาพรีเมียมจากแบรนด์ดังหลากหลาย Ray-Ban, Oakley, Gucci และอื่นๆ",
};

async function getProducts(saleOnly: boolean = false) {
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
                is_on_sale,
                compare_at_price,
                sale_start_date,
                sale_end_date,
                inventory(quantity)
            )
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching products:", error);
        return [];
    }

    // Filter for sale products if needed
    if (saleOnly && products) {
        const now = new Date().toISOString();
        return products.filter((product) => {
            if (!product.variants || product.variants.length === 0) return false;
            return product.variants.some((v: {
                is_on_sale: boolean;
                sale_start_date: string | null;
                sale_end_date: string | null;
                compare_at_price: number | null;
            }) => {
                if (!v.is_on_sale) return false;
                const startOk = !v.sale_start_date || v.sale_start_date <= now;
                const endOk = !v.sale_end_date || v.sale_end_date >= now;
                return startOk && endOk;
            });
        });
    }

    return products || [];
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

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const saleOnly = params.sale === "true";
    
    const [products, categories, brands] = await Promise.all([
        getProducts(saleOnly),
        getCategories(),
        getBrands(),
    ]);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        {saleOnly ? (
                            <span className="flex items-center gap-2">
                                <Tag className="h-8 w-8 text-red-500" />
                                Flash Sale
                            </span>
                        ) : "สินค้าทั้งหมด"}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {saleOnly 
                            ? `สินค้าลดราคาพิเศษ (${products.length} รายการ)` 
                            : `แว่นตาพรีเมียมคุณภาพสูงจากแบรนด์ชั้นนำ (${products.length} รายการ)`}
                    </p>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-border">
                {/* All Products */}
                <Link
                    href="/products"
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        !saleOnly 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                >
                    ทั้งหมด
                </Link>
                
                {/* Sale Filter Pill */}
                <Link
                    href="/products?sale=true"
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        saleOnly 
                            ? "bg-red-500 text-white" 
                            : "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-950 dark:text-red-400"
                    }`}
                >
                    🔥 Sale
                </Link>
                
                {/* Divider */}
                <div className="hidden md:block w-px h-6 bg-border" />
                
                {/* Category Pills */}
                {categories.slice(0, 4).map((cat) => (
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

                {/* Brand Pills */}
                {brands.slice(0, 3).map((brand) => (
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
                        {saleOnly ? <Tag className="h-10 w-10 text-muted-foreground" /> : <SlidersHorizontal className="h-10 w-10 text-muted-foreground" />}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        {saleOnly ? "ยังไม่มีสินค้าลดราคา" : "ยังไม่มีสินค้า"}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        {saleOnly 
                            ? "ไม่มีสินค้าลดราคาในขณะนี้ ลองดูสินค้าทั้งหมด"
                            : "สินค้าจะแสดงที่นี่เมื่อมีการเพิ่มเข้าระบบ"}
                    </p>
                    <Button asChild>
                        {saleOnly 
                            ? <Link href="/products">ดูสินค้าทั้งหมด</Link>
                            : <Link href="/admin/products/new">เพิ่มสินค้าแรก</Link>}
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
