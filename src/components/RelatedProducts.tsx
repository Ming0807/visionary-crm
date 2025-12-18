import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Star } from "lucide-react";

interface RelatedProductsProps {
    currentProductId: string;
    category?: string | null;
    brand?: string | null;
}

async function getRelatedProducts(currentId: string, category?: string | null, brand?: string | null) {
    // Get products from same category or brand, excluding current
    let query = supabase
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
        .neq("id", currentId)
        .limit(4);

    if (category) {
        query = query.eq("category", category);
    }

    const { data } = await query;
    return data || [];
}

async function getBestsellers(excludeId: string) {
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
        .neq("id", excludeId)
        .limit(4);

    return data || [];
}

export default async function RelatedProducts({ currentProductId, category, brand }: RelatedProductsProps) {
    const [related, bestsellers] = await Promise.all([
        getRelatedProducts(currentProductId, category, brand),
        getBestsellers(currentProductId),
    ]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("th-TH", {
            style: "currency",
            currency: "THB",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const ProductGrid = ({ products, title }: { products: typeof related; title: string }) => {
        if (products.length === 0) return null;

        return (
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">{title}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
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
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-12 border-t border-border">
            <ProductGrid products={related} title="สินค้าที่คล้ายกัน" />
            <ProductGrid products={bestsellers} title="สินค้าขายดี" />
        </div>
    );
}
