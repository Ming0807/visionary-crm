"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Product, ProductVariant } from "@/lib/supabase";

interface ExtendedVariant extends ProductVariant {
  is_on_sale?: boolean;
  compare_at_price?: number | null;
  sale_start_date?: string | null;
  sale_end_date?: string | null;
}

interface ProductCardProps {
  product: Product & { variants?: ExtendedVariant[] };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  
  const defaultVariant = product.variants?.[0];
  const imageUrl = defaultVariant?.images?.[0] || "";
  const price = defaultVariant?.price || product.base_price;
  
  // Check if any variant is on sale (with date validation)
  const now = new Date().toISOString();
  const saleVariant = product.variants?.find((v) => {
    if (!v.is_on_sale) return false;
    const startOk = !v.sale_start_date || v.sale_start_date <= now;
    const endOk = !v.sale_end_date || v.sale_end_date >= now;
    return startOk && endOk && v.compare_at_price;
  });
  
  const isOnSale = !!saleVariant;
  const compareAtPrice = saleVariant?.compare_at_price;
  const salePercentage = isOnSale && compareAtPrice && price
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!defaultVariant) return;
    
    addItem({
      variantId: defaultVariant.id,
      productId: product.id,
      productName: product.name,
      variantName: `${product.name} (${defaultVariant.color_name || "Default"})`,
      sku: defaultVariant.sku,
      price: defaultVariant.price,
      quantity: 1,
      image: imageUrl,
      colorName: defaultVariant.color_name,
      colorCode: defaultVariant.color_code,
    });
  };

  // Get available colors from variants
  const colors = product.variants?.map((v) => ({
    name: v.color_name,
    code: v.color_code,
  })) || [];

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-card rounded-2xl lg:rounded-3xl overflow-hidden hover-lift border border-border/50">
        {/* Product Image */}
        <div className="relative aspect-square bg-secondary overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <ShoppingBag className="h-12 w-12" />
            </div>
          )}
          
          {/* Sale Badge */}
          {isOnSale && (
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
              SALE {salePercentage > 0 && `-${salePercentage}%`}
            </div>
          )}
          
          {/* Quick Add Button */}
          <div className="absolute bottom-4 left-4 right-4 opacity-0 transform translate-y-4 transition-all group-hover:opacity-100 group-hover:translate-y-0">
            <Button 
              className="w-full bg-primary hover:bg-primary/90 rounded-full"
              onClick={handleAddToCart}
              disabled={!defaultVariant}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 lg:p-5">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {product.brand}
            </p>
          )}
          
          {/* Name */}
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
          
          {/* Color Swatches - Fixed height for consistent cards */}
          <div className="h-6 mt-2 flex items-center">
            {colors.length > 1 ? (
              <div className="flex items-center gap-1.5">
                {colors.slice(0, 4).map((color, index) => (
                  <span
                    key={index}
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: color.code || "#ccc" }}
                    title={color.name || ""}
                  />
                ))}
                {colors.length > 4 && (
                  <span className="text-xs text-muted-foreground">
                    +{colors.length - 4}
                  </span>
                )}
              </div>
            ) : null}
          </div>
          
          {/* Price with Sale Display */}
          <div className="mt-2 flex items-center gap-2">
            {isOnSale && compareAtPrice ? (
              <>
                <p className="text-lg font-bold text-red-500">
                  {formatPrice(price)}
                </p>
                <p className="text-sm text-muted-foreground line-through">
                  {formatPrice(compareAtPrice)}
                </p>
              </>
            ) : (
              <p className="text-lg font-bold text-primary">
                {formatPrice(price)}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
