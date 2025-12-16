"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { ShoppingBag, Check, Truck, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Product, ProductVariant, Inventory } from "@/lib/supabase";

interface ProductDetailProps {
  product: Product & { 
    variants: (ProductVariant & { inventory: Inventory[] })[] 
  };
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const { addItem } = useCart();
  const { customer } = useAuth();
  const { toast } = useToast();

  // Track product view behavior
  useEffect(() => {
    const trackView = async () => {
      try {
        await fetch("/api/behaviors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerId: customer?.id || null,
            behaviorType: "view",
            productId: product.id,
            variantId: product.variants[0]?.id || null,
            metadata: { source: "product_page" },
          }),
        });
      } catch (error) {
        console.error("Failed to track view:", error);
      }
    };
    trackView();
  }, [product.id, customer?.id, product.variants]);

  const selectedVariant = product.variants[selectedVariantIndex];
  const images = selectedVariant?.images || [];
  const stock = selectedVariant?.inventory?.[0]?.quantity || 0;
  const isOutOfStock = stock <= 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleVariantChange = (index: number) => {
    setSelectedVariantIndex(index);
    setMainImageIndex(0);
  };

  const handleAddToCart = () => {
    if (!selectedVariant || isOutOfStock) return;

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      variantName: `${product.name} (${selectedVariant.color_name || "Default"})`,
      sku: selectedVariant.sku,
      price: selectedVariant.price,
      quantity: 1,
      image: images[0] || "",
      colorName: selectedVariant.color_name,
      colorCode: selectedVariant.color_code,
    });

    toast({
      title: "Added to cart!",
      description: `${product.name} (${selectedVariant.color_name}) has been added to your bag.`,
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-secondary">
            {images[mainImageIndex] ? (
              <Image
                src={images[mainImageIndex]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ShoppingBag className="h-24 w-24" />
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setMainImageIndex(index)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    mainImageIndex === index
                      ? "border-primary"
                      : "border-transparent hover:border-border"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="space-y-6">
          {/* Brand & Category */}
          <div className="flex items-center gap-2">
            {product.brand && (
              <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                {product.brand}
              </span>
            )}
            {product.category && (
              <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground">
                {product.category}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(selectedVariant?.price || product.base_price)}
            </span>
            {selectedVariant?.price !== product.base_price && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.base_price)}
              </span>
            )}
          </div>

          {/* Color Selector */}
          {product.variants.length > 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Color</span>
                <span className="text-sm text-muted-foreground">
                  {selectedVariant?.color_name}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant, index) => (
                  <button
                    key={variant.id}
                    onClick={() => handleVariantChange(index)}
                    className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                      selectedVariantIndex === index
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                    style={{ backgroundColor: variant.color_code || "#ccc" }}
                    title={variant.color_name || "Color option"}
                  >
                    {selectedVariantIndex === index && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check className={`h-5 w-5 ${
                          variant.color_code && variant.color_code.toLowerCase() !== '#ffffff' 
                            ? 'text-white' 
                            : 'text-foreground'
                        }`} />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SKU & Stock */}
          <div className="flex items-center gap-4 py-4 border-y border-border">
            <span className="text-sm text-muted-foreground">
              SKU: {selectedVariant?.sku}
            </span>
            <span className={`text-sm font-medium ${
              isOutOfStock ? "text-destructive" : stock <= 5 ? "text-orange-500" : "text-green-600"
            }`}>
              {isOutOfStock 
                ? "Out of Stock" 
                : stock <= 5 
                  ? `Only ${stock} left!` 
                  : "In Stock"}
            </span>
          </div>

          {/* Description */}
          <div className="prose prose-sm text-muted-foreground">
            <p>{product.description}</p>
          </div>

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 text-lg rounded-full"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </Button>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <Truck className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Free Shipping</p>
            </div>
            <div className="text-center">
              <Shield className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-xs text-muted-foreground">1 Year Warranty</p>
            </div>
            <div className="text-center">
              <RotateCcw className="h-6 w-6 mx-auto text-primary mb-2" />
              <p className="text-xs text-muted-foreground">30-Day Returns</p>
            </div>
          </div>

          {/* Material Info */}
          {selectedVariant?.frame_material && (
            <div className="bg-muted/50 rounded-2xl p-4">
              <h3 className="font-medium text-foreground mb-2">Specifications</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-muted-foreground">Material</dt>
                <dd className="font-medium">{selectedVariant.frame_material}</dd>
                {selectedVariant.size_label && (
                  <>
                    <dt className="text-muted-foreground">Size</dt>
                    <dd className="font-medium">{selectedVariant.size_label}</dd>
                  </>
                )}
                <dt className="text-muted-foreground">Gender</dt>
                <dd className="font-medium capitalize">{product.gender}</dd>
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
