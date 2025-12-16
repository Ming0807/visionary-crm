import Link from "next/link";
import Image from "next/image";
import { Plus, Package, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

async function getProducts() {
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      *,
      variants:product_variants(
        *,
        inventory(*)
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return products;
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {products.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const firstVariant = product.variants?.[0];
                const imageUrl = firstVariant?.images?.[0];
                const totalStock = product.variants?.reduce(
                  (sum: number, v: { inventory?: { quantity: number }[] }) => 
                    sum + (v.inventory?.[0]?.quantity || 0),
                  0
                ) || 0;

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {firstVariant?.sku}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.brand || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category || "N/A"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {product.variants?.slice(0, 3).map((v: { id: string; color_code: string | null }) => (
                          <span
                            key={v.id}
                            className="w-5 h-5 rounded-full border"
                            style={{ backgroundColor: v.color_code || "#ccc" }}
                          />
                        ))}
                        {product.variants?.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{product.variants.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(product.base_price)}
                    </TableCell>
                    <TableCell>
                      <span className={totalStock <= 5 ? "text-destructive font-medium" : ""}>
                        {totalStock}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first product
            </p>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
