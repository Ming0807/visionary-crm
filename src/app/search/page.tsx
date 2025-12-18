import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
    title: "ค้นหาสินค้า",
    description: "ค้นหาแว่นตาจากคอลเลกชันกว่า 500+ รายการ Ray-Ban, Oakley, Gucci และอีกมากมาย",
};

async function searchProducts(query: string) {
    if (!query || query.length < 2) return [];

    const { data } = await supabase
        .from("products")
        .select(`
            id,
            name,
            brand,
            category,
            base_price,
            variants:product_variants(id, price, images)
        `)
        .eq("is_active", true)
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(20);

    return data || [];
}

interface PageProps {
    searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
    const { q } = await searchParams;
    const query = q || "";
    const products = await searchProducts(query);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("th-TH", {
            style: "currency",
            currency: "THB",
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Search Header */}
            <div className="max-w-2xl mx-auto mb-8">
                <form action="/search" method="GET">
                    <div className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="search"
                            name="q"
                            placeholder="ค้นหาแว่นตา, แบรนด์, หมวดหมู่..."
                            defaultValue={query}
                            className="h-14 pl-12 rounded-full text-lg"
                            autoFocus
                        />
                    </div>
                </form>
            </div>

            {/* Results */}
            {query ? (
                <>
                    <p className="text-muted-foreground mb-6">
                        {products.length > 0 
                            ? `พบ ${products.length} รายการสำหรับ "${query}"` 
                            : `ไม่พบสินค้าสำหรับ "${query}"`
                        }
                    </p>

                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                            {products.map((product) => {
                                const firstVariant = product.variants?.[0];
                                const image = firstVariant?.images?.[0];
                                const price = firstVariant?.price || product.base_price;

                                return (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.id}`}
                                        className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-shadow"
                                    >
                                        <div className="relative aspect-square bg-muted">
                                            {image ? (
                                                <Image
                                                    src={image}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover transition-transform group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            {product.brand && (
                                                <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                                            )}
                                            <h3 className="font-medium text-foreground text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                {product.name}
                                            </h3>
                                            <p className="text-primary font-bold">{formatPrice(price)}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <SlidersHorizontal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">ไม่พบสินค้าที่ค้นหา</h3>
                            <p className="text-muted-foreground mb-4">
                                ลองค้นหาด้วยคำอื่น หรือเลือกดูสินค้าทั้งหมด
                            </p>
                            <Link
                                href="/products"
                                className="text-primary hover:underline font-medium"
                            >
                                ดูสินค้าทั้งหมด →
                            </Link>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-16">
                    <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">ค้นหาสินค้า</h3>
                    <p className="text-muted-foreground">
                        พิมพ์ชื่อสินค้า, แบรนด์ หรือหมวดหมู่ที่ต้องการค้นหา
                    </p>
                </div>
            )}

            {/* Popular Searches */}
            <div className="mt-12 border-t border-border pt-8">
                <h2 className="text-lg font-semibold text-foreground mb-4">ค้นหายอดนิยม</h2>
                <div className="flex flex-wrap gap-2">
                    {["Ray-Ban", "Oakley", "แว่นกันแดด", "แว่นสายตา", "Gucci", "Prada"].map((term) => (
                        <Link
                            key={term}
                            href={`/search?q=${encodeURIComponent(term)}`}
                            className="px-4 py-2 rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground text-sm transition-colors"
                        >
                            {term}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
