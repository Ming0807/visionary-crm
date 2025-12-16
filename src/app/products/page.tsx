import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

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

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Shop All</h1>
        <p className="text-muted-foreground mt-2">
          Discover our collection of premium eyewear
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">No products available yet</p>
          <Button asChild>
            <Link href="/admin/products/new">Add First Product</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
