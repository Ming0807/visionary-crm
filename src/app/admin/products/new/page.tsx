"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import ImageUploader from "@/components/ImageUploader";

interface VariantForm {
  id: string;
  colorName: string;
  colorCode: string;
  sku: string;
  price: string;
  costPrice: string;
  frameMaterial: string;
  sizeLabel: string;
  images: string[];
  stock: string;
}

const categories = ["Sunglasses", "Eyeglasses", "Lenses", "Accessories"];
const genders = ["unisex", "men", "women"];

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [product, setProduct] = useState({
    name: "",
    description: "",
    brand: "",
    category: "Sunglasses",
    gender: "unisex",
    basePrice: "",
  });

  const [variants, setVariants] = useState<VariantForm[]>([
    {
      id: crypto.randomUUID(),
      colorName: "",
      colorCode: "#000000",
      sku: "",
      price: "",
      costPrice: "",
      frameMaterial: "",
      sizeLabel: "",
      images: [],
      stock: "10",
    },
  ]);

  const handleProductChange = (field: string, value: string) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleVariantChange = (id: string, field: string, value: string) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        colorName: "",
        colorCode: "#000000",
        sku: "",
        price: product.basePrice,
        costPrice: "",
        frameMaterial: "",
        sizeLabel: "",
        images: [],
        stock: "10",
      },
    ]);
  };

  const handleVariantImages = (id: string, newImages: string[]) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, images: newImages } : v))
    );
  };

  const removeVariant = (id: string) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate
      if (!product.name || !product.basePrice) {
        throw new Error("Please fill in required fields");
      }

      if (variants.some((v) => !v.sku || !v.price)) {
        throw new Error("Each variant needs SKU and price");
      }

      // Create product
      const { data: newProduct, error: productError } = await supabase
        .from("products")
        .insert({
          name: product.name,
          description: product.description || null,
          brand: product.brand || null,
          category: product.category,
          gender: product.gender,
          base_price: parseFloat(product.basePrice),
          is_active: true,
        })
        .select("id")
        .single();

      if (productError) throw productError;

      // Create variants
      for (const variant of variants) {
        const { data: newVariant, error: variantError } = await supabase
          .from("product_variants")
          .insert({
            product_id: newProduct.id,
            sku: variant.sku,
            color_name: variant.colorName || null,
            color_code: variant.colorCode || null,
            frame_material: variant.frameMaterial || null,
            size_label: variant.sizeLabel || null,
            price: parseFloat(variant.price),
            cost_price: variant.costPrice ? parseFloat(variant.costPrice) : 0,
            images: variant.images,
            is_active: true,
          })
          .select("id")
          .single();

        if (variantError) throw variantError;

        // Create inventory
        const { error: inventoryError } = await supabase
          .from("inventory")
          .insert({
            variant_id: newVariant.id,
            quantity: parseInt(variant.stock) || 0,
            location: "main_warehouse",
          });

        if (inventoryError) throw inventoryError;
      }

      toast({
        title: "Product created!",
        description: `${product.name} has been added to your catalog.`,
      });

      router.push("/admin/products");
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Add New Product</h1>
        <p className="text-muted-foreground">Create a new product with variants</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-card rounded-2xl p-6 border border-border space-y-5">
          <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={product.name}
                onChange={(e) => handleProductChange("name", e.target.value)}
                placeholder="Vintage Round Master"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={product.brand}
                onChange={(e) => handleProductChange("brand", e.target.value)}
                placeholder="Visionary Classic"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="basePrice">Base Price (THB) *</Label>
              <Input
                id="basePrice"
                type="number"
                value={product.basePrice}
                onChange={(e) => handleProductChange("basePrice", e.target.value)}
                placeholder="2590"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={product.category}
                onValueChange={(value) => handleProductChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={product.gender}
                onValueChange={(value) => handleProductChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genders.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={product.description}
                onChange={(e) => handleProductChange("description", e.target.value)}
                placeholder="Premium sunglasses with titanium frame..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-card rounded-2xl p-6 border border-border space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Variants</h2>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </div>

          <div className="space-y-6">
            {variants.map((variant, index) => (
              <div key={variant.id} className="p-4 bg-muted/50 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Variant {index + 1}</span>
                  {variants.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeVariant(variant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>SKU *</Label>
                    <Input
                      value={variant.sku}
                      onChange={(e) =>
                        handleVariantChange(variant.id, "sku", e.target.value)
                      }
                      placeholder="VRM-001-BLK"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Color Name</Label>
                    <Input
                      value={variant.colorName}
                      onChange={(e) =>
                        handleVariantChange(variant.id, "colorName", e.target.value)
                      }
                      placeholder="Matte Black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Color Code</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={variant.colorCode}
                        onChange={(e) =>
                          handleVariantChange(variant.id, "colorCode", e.target.value)
                        }
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        value={variant.colorCode}
                        onChange={(e) =>
                          handleVariantChange(variant.id, "colorCode", e.target.value)
                        }
                        placeholder="#000000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Price (THB) *</Label>
                    <Input
                      type="number"
                      value={variant.price}
                      onChange={(e) =>
                        handleVariantChange(variant.id, "price", e.target.value)
                      }
                      placeholder="2590"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cost Price</Label>
                    <Input
                      type="number"
                      value={variant.costPrice}
                      onChange={(e) =>
                        handleVariantChange(variant.id, "costPrice", e.target.value)
                      }
                      placeholder="1000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      value={variant.stock}
                      onChange={(e) =>
                        handleVariantChange(variant.id, "stock", e.target.value)
                      }
                      placeholder="10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Frame Material</Label>
                    <Input
                      value={variant.frameMaterial}
                      onChange={(e) =>
                        handleVariantChange(variant.id, "frameMaterial", e.target.value)
                      }
                      placeholder="Titanium"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Size</Label>
                    <Input
                      value={variant.sizeLabel}
                      onChange={(e) =>
                        handleVariantChange(variant.id, "sizeLabel", e.target.value)
                      }
                      placeholder="M"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-3">
                    <Label>Product Images</Label>
                    <ImageUploader
                      images={variant.images}
                      onChange={(newImages) => handleVariantImages(variant.id, newImages)}
                      maxImages={5}
                      type="product"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Product"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
