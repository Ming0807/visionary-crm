"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Save, ArrowLeft } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface VariantForm {
  id: string;
  dbId?: string; // Database ID for existing variants
  colorName: string;
  colorCode: string;
  sku: string;
  price: string;
  costPrice: string;
  frameMaterial: string;
  sizeLabel: string;
  images: string[];
  stock: string;
  // Sale fields
  isOnSale: boolean;
  compareAtPrice: string;
  saleStartDate: string;
  saleEndDate: string;
}

const categories = ["Sunglasses", "Eyeglasses", "Lenses", "Accessories"];
const genders = ["unisex", "men", "women"];

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [product, setProduct] = useState({
    name: "",
    description: "",
    brand: "",
    category: "Sunglasses",
    gender: "unisex",
    basePrice: "",
  });

  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);

  // Load product data
  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          variants:product_variants(
            id,
            sku,
            color_name,
            color_code,
            price,
            cost_price,
            frame_material,
            size_label,
            images,
            is_on_sale,
            compare_at_price,
            sale_start_date,
            sale_end_date,
            inventory(quantity)
          )
        `)
        .eq("id", resolvedParams.id)
        .single();

      if (error || !data) {
        toast({ title: "Product not found", variant: "destructive" });
        router.push("/admin/products");
        return;
      }

      setProduct({
        name: data.name || "",
        description: data.description || "",
        brand: data.brand || "",
        category: data.category || "Sunglasses",
        gender: data.gender || "unisex",
        basePrice: data.base_price?.toString() || "",
      });

      setVariants(
        data.variants?.map((v: {
          id: string;
          sku: string;
          color_name: string;
          color_code: string;
          price: number;
          cost_price: number;
          frame_material: string;
          size_label: string;
          images: string[];
          inventory: { quantity: number }[];
          is_on_sale?: boolean;
          compare_at_price?: number | null;
          sale_start_date?: string | null;
          sale_end_date?: string | null;
        }) => {
          // Convert ISO datetime to datetime-local format (YYYY-MM-DDTHH:mm)
          const formatDateForInput = (isoDate: string | null | undefined) => {
            if (!isoDate) return "";
            try {
              const date = new Date(isoDate);
              // Format as YYYY-MM-DDTHH:mm for datetime-local input
              return date.toISOString().slice(0, 16);
            } catch {
              return "";
            }
          };

          return {
            id: crypto.randomUUID(),
            dbId: v.id,
            colorName: v.color_name || "",
            colorCode: v.color_code || "#000000",
            sku: v.sku || "",
            price: v.price?.toString() || "",
            costPrice: v.cost_price?.toString() || "",
            frameMaterial: v.frame_material || "",
            sizeLabel: v.size_label || "",
            images: v.images || [],
            stock: v.inventory?.[0]?.quantity?.toString() || "0",
            isOnSale: v.is_on_sale || false,
            compareAtPrice: v.compare_at_price?.toString() || "",
            saleStartDate: formatDateForInput(v.sale_start_date),
            saleEndDate: formatDateForInput(v.sale_end_date),
          };
        }) || []
      );

      setIsLoading(false);
    };

    fetchProduct();
  }, [resolvedParams.id, router, toast]);

  const handleProductChange = (field: string, value: string) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
  };

  const handleVariantChange = (id: string, field: string, value: string) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleVariantImages = (id: string, newImages: string[]) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, images: newImages } : v))
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
        isOnSale: false,
        compareAtPrice: "",
        saleStartDate: "",
        saleEndDate: "",
      },
    ]);
  };

  const removeVariant = (id: string) => {
    if (variants.length > 1) {
      const variant = variants.find((v) => v.id === id);
      // Track if this is an existing variant (has dbId) for later deletion
      if (variant?.dbId) {
        setDeletedVariantIds((prev) => [...prev, variant.dbId!]);
      }
      setVariants((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update product
      const { error: productError } = await supabase
        .from("products")
        .update({
          name: product.name,
          description: product.description,
          brand: product.brand,
          category: product.category,
          gender: product.gender,
          base_price: parseFloat(product.basePrice) || 0,
        })
        .eq("id", resolvedParams.id);

      if (productError) throw productError;

      // Delete removed variants from database
      for (const dbId of deletedVariantIds) {
        await supabase.from("product_variants").delete().eq("id", dbId);
      }

      // Update/Create variants
      for (const variant of variants) {
        // Format datetime-local to ISO string for PostgreSQL
        const formatDatetime = (dt: string) => {
          if (!dt) return null;
          try {
            return new Date(dt).toISOString();
          } catch {
            return null;
          }
        };

        const variantData = {
          product_id: resolvedParams.id,
          sku: variant.sku,
          color_name: variant.colorName,
          color_code: variant.colorCode,
          price: parseFloat(variant.price) || 0,
          cost_price: parseFloat(variant.costPrice) || 0,
          frame_material: variant.frameMaterial,
          size_label: variant.sizeLabel,
          images: variant.images,
          is_on_sale: variant.isOnSale,
          compare_at_price: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : null,
          sale_start_date: formatDatetime(variant.saleStartDate),
          sale_end_date: formatDatetime(variant.saleEndDate),
        };

        console.log("Saving variant:", variant.sku, "Sale:", variant.isOnSale, "Data:", variantData);

        if (variant.dbId) {
          // Update existing variant
          const { error } = await supabase
            .from("product_variants")
            .update(variantData)
            .eq("id", variant.dbId);
          
          if (error) console.error("Update variant error:", error);

          // Update inventory
          await supabase
            .from("inventory")
            .update({ quantity: parseInt(variant.stock) || 0 })
            .eq("variant_id", variant.dbId);
        } else {
          // Create new variant
          const { data: newVariant } = await supabase
            .from("product_variants")
            .insert(variantData)
            .select("id")
            .single();

          if (newVariant) {
            await supabase.from("inventory").insert({
              variant_id: newVariant.id,
              quantity: parseInt(variant.stock) || 0,
            });
          }
        }
      }

      toast({ title: "Product updated successfully! 🎉" });
      router.push("/admin/products");
    } catch (error) {
      console.error("Update error:", error);
      toast({ title: "Failed to update product", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", resolvedParams.id);

      if (error) throw error;

      toast({ title: "Product deleted" });
      router.push("/admin/products");
    } catch (error) {
      console.error("Delete error:", error);
      toast({ title: "Failed to delete product", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Edit Product</h1>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the product and all its variants.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Product Info */}
        <div className="bg-card rounded-xl p-6 border">
          <h2 className="font-semibold mb-4">Product Information</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={product.name}
                onChange={(e) => handleProductChange("name", e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={product.description}
                onChange={(e) => handleProductChange("description", e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={product.brand}
                onChange={(e) => handleProductChange("brand", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="basePrice">Base Price *</Label>
              <Input
                id="basePrice"
                type="number"
                value={product.basePrice}
                onChange={(e) => handleProductChange("basePrice", e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={product.category}
                onValueChange={(v) => handleProductChange("category", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Gender</Label>
              <Select
                value={product.gender}
                onValueChange={(v) => handleProductChange("gender", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genders.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Variants ({variants.length})</h2>
            <Button type="button" variant="outline" onClick={addVariant}>
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </div>

          {variants.map((variant, index) => (
            <div key={variant.id} className="bg-card rounded-xl p-6 border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Variant {index + 1}</h3>
                {variants.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariant(variant.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label>SKU *</Label>
                  <Input
                    value={variant.sku}
                    onChange={(e) => handleVariantChange(variant.id, "sku", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Color Name *</Label>
                  <Input
                    value={variant.colorName}
                    onChange={(e) => handleVariantChange(variant.id, "colorName", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Color Code</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={variant.colorCode}
                      onChange={(e) => handleVariantChange(variant.id, "colorCode", e.target.value)}
                      className="w-12 p-1 h-9"
                    />
                    <Input
                      value={variant.colorCode}
                      onChange={(e) => handleVariantChange(variant.id, "colorCode", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    value={variant.price}
                    onChange={(e) => handleVariantChange(variant.id, "price", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Cost Price</Label>
                  <Input
                    type="number"
                    value={variant.costPrice}
                    onChange={(e) => handleVariantChange(variant.id, "costPrice", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Stock *</Label>
                  <Input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => handleVariantChange(variant.id, "stock", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Frame Material</Label>
                  <Input
                    value={variant.frameMaterial}
                    onChange={(e) => handleVariantChange(variant.id, "frameMaterial", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Size</Label>
                  <Input
                    value={variant.sizeLabel}
                    onChange={(e) => handleVariantChange(variant.id, "sizeLabel", e.target.value)}
                    placeholder="e.g. 52-18-140"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label>Images</Label>
                <ImageUploader
                  images={variant.images}
                  onChange={(imgs) => handleVariantImages(variant.id, imgs)}
                  maxImages={5}
                />
              </div>

              {/* Sale Settings */}
              <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-900">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id={`sale-${variant.id}`}
                    checked={variant.isOnSale}
                    onChange={(e) =>
                      setVariants((prev) =>
                        prev.map((v) => (v.id === variant.id ? { ...v, isOnSale: e.target.checked } : v))
                      )
                    }
                    className="w-4 h-4 rounded"
                  />
                  <Label htmlFor={`sale-${variant.id}`} className="text-orange-700 dark:text-orange-300 font-medium">
                    🏷️ On Sale
                  </Label>
                </div>
                
                {variant.isOnSale && (
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Compare Price (Original)</Label>
                      <Input
                        type="number"
                        value={variant.compareAtPrice}
                        onChange={(e) =>
                          handleVariantChange(variant.id, "compareAtPrice", e.target.value)
                        }
                        placeholder="3500"
                        className="bg-white dark:bg-background"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Start Date</Label>
                      <Input
                        type="datetime-local"
                        value={variant.saleStartDate}
                        onChange={(e) =>
                          handleVariantChange(variant.id, "saleStartDate", e.target.value)
                        }
                        className="bg-white dark:bg-background"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">End Date</Label>
                      <Input
                        type="datetime-local"
                        value={variant.saleEndDate}
                        onChange={(e) =>
                          handleVariantChange(variant.id, "saleEndDate", e.target.value)
                        }
                        className="bg-white dark:bg-background"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
