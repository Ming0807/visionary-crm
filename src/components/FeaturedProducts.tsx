import ProductCard from "./ProductCard";
import { Product, ProductVariant } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

async function getProducts() {
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      *,
      variants:product_variants(*)
    `)
    .eq("is_active", true)
    .limit(8);
  
  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }
  
  return products as (Product & { variants: ProductVariant[] })[];
}

export default async function FeaturedProducts() {
  const products = await getProducts();

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Featured Products
            </h2>
            <p className="text-muted-foreground">
              Handpicked favorites from our collection
            </p>
          </div>
          <a
            href="/products"
            className="text-primary hover:text-primary/80 font-medium inline-flex items-center transition-colors"
          >
            View All
            <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No products available yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
