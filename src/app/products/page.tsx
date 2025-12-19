import Link from "next/link";
import { Suspense } from "react";
import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import ProductSort from "@/components/ProductSort";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Tag, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
    title: "สินค้าทั้งหมด",
    description: "เลือกซื้อแว่นตาพรีเมียมจากแบรนด์ดังหลากหลาย Ray-Ban, Oakley, Gucci และอื่นๆ",
};

interface ProductFilters {
    category?: string;
    brand?: string;
    sale?: boolean;
    sort?: string;
}

async function getProducts(filters: ProductFilters = {}) {
    let query = supabase
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
        .eq("is_active", true);

    // Apply category filter
    if (filters.category) {
        query = query.eq("category", filters.category);
    }

    // Apply brand filter
    if (filters.brand) {
        query = query.eq("brand", filters.brand);
    }

    // Apply sorting
    switch (filters.sort) {
        case "newest":
            query = query.order("created_at", { ascending: false });
            break;
        case "price-low":
            query = query.order("base_price", { ascending: true });
            break;
        case "price-high":
            query = query.order("base_price", { ascending: false });
            break;
        case "name":
            query = query.order("name", { ascending: true });
            break;
        default:
            query = query.order("created_at", { ascending: false });
    }

    const { data: products, error } = await query;

    if (error) {
        console.error("Error fetching products:", error);
        return [];
    }

    // Filter for sale products if needed
    if (filters.sale && products) {
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

// Category display names
const categoryNames: Record<string, string> = {
    Sunglasses: "แว่นกันแดด",
    Eyeglasses: "แว่นสายตา",
    Lenses: "เลนส์",
    Accessories: "อุปกรณ์เสริม",
};

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    
    // Extract filters from URL params
    const filters: ProductFilters = {
        category: typeof params.category === "string" ? params.category : undefined,
        brand: typeof params.brand === "string" ? params.brand : undefined,
        sale: params.sale === "true",
        sort: typeof params.sort === "string" ? params.sort : undefined,
    };
    
    const [products, categories, brands] = await Promise.all([
        getProducts(filters),
        getCategories(),
        getBrands(),
    ]);

    // Build page title based on filters
    const getPageTitle = () => {
        if (filters.sale) return "🔥 Flash Sale";
        if (filters.category) return categoryNames[filters.category] || filters.category;
        if (filters.brand) return filters.brand;
        return "สินค้าทั้งหมด";
    };

    const getPageDescription = () => {
        if (filters.sale) return `สินค้าลดราคาพิเศษ (${products.length} รายการ)`;
        if (filters.category) return `${categoryNames[filters.category] || filters.category} คุณภาพสูง (${products.length} รายการ)`;
        if (filters.brand) return `แว่นตา ${filters.brand} (${products.length} รายการ)`;
        return `แว่นตาพรีเมียมคุณภาพสูงจากแบรนด์ชั้นนำ (${products.length} รายการ)`;
    };

    // Check if any filter is active
    const hasActiveFilter = filters.category || filters.brand || filters.sale;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb */}
            {hasActiveFilter && (
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Link href="/products" className="hover:text-foreground transition-colors">
                        สินค้าทั้งหมด
                    </Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground font-medium">
                        {getPageTitle()}
                    </span>
                </nav>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        {filters.sale ? (
                            <span className="flex items-center gap-2">
                                <Tag className="h-8 w-8 text-red-500" />
                                Flash Sale
                            </span>
                        ) : getPageTitle()}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {getPageDescription()}
                    </p>
                </div>
                
                {/* Sort dropdown */}
                <Suspense fallback={<div className="w-32 h-10 bg-muted rounded-lg animate-pulse" />}>
                    <ProductSort currentSort={filters.sort || "newest"} />
                </Suspense>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-border">
                {/* All Products */}
                <Link
                    href="/products"
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        !hasActiveFilter 
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
                        filters.sale 
                            ? "bg-red-500 text-white" 
                            : "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-950 dark:text-red-400"
                    }`}
                >
                    🔥 Sale
                </Link>
                
                {/* Divider */}
                <div className="hidden md:block w-px h-6 bg-border" />
                
                {/* Category Pills */}
                {categories.map((cat) => (
                    <Link
                        key={cat}
                        href={`/products?category=${encodeURIComponent(cat)}`}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            filters.category === cat
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                    >
                        {categoryNames[cat] || cat}
                    </Link>
                ))}

                {/* Brand Pills - show first 3 */}
                {brands.slice(0, 3).map((brand) => (
                    <Link
                        key={brand}
                        href={`/products?brand=${encodeURIComponent(brand)}`}
                        className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                            filters.brand === brand
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                        }`}
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
                        {filters.sale ? <Tag className="h-10 w-10 text-muted-foreground" /> : <SlidersHorizontal className="h-10 w-10 text-muted-foreground" />}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                        {filters.sale ? "ยังไม่มีสินค้าลดราคา" : 
                         filters.category ? `ไม่มีสินค้าในหมวด ${categoryNames[filters.category] || filters.category}` :
                         filters.brand ? `ไม่มีสินค้าจาก ${filters.brand}` :
                         "ยังไม่มีสินค้า"}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                        {hasActiveFilter 
                            ? "ลองดูสินค้าทั้งหมดแทน"
                            : "สินค้าจะแสดงที่นี่เมื่อมีการเพิ่มเข้าระบบ"}
                    </p>
                    <Button asChild>
                        {hasActiveFilter 
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
                        <a href="https://lin.ee/Y0lv8Nr" target="_blank" rel="noopener noreferrer">
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
