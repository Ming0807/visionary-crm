import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import { Product, ProductVariant } from "@/lib/supabase";

interface PageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

async function getProducts(category?: string, search?: string) {
  let query = supabase
    .from("products")
    .select(`
      *,
      variants:product_variants(*)
    `)
    .eq("is_active", true);

  if (category) {
    query = query.eq("category", category);
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data: products, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }

  return products as (Product & { variants: ProductVariant[] })[];
}

const categories = ["All", "Sunglasses", "Eyeglasses", "Lenses", "Accessories"];

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeCategory = params.category || "All";
  const products = await getProducts(
    activeCategory !== "All" ? activeCategory : undefined,
    params.search
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Page Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
          Our Collection
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore our curated selection of premium eyewear designed to complement your unique style.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {categories.map((category) => (
          <a
            key={category}
            href={category === "All" ? "/products" : `/products?category=${category}`}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
            }`}
          >
            {category}
          </a>
        ))}
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">👓</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No products found
          </h3>
          <p className="text-muted-foreground">
            {activeCategory !== "All"
              ? `No products in ${activeCategory} category yet.`
              : "Check back soon for new arrivals!"}
          </p>
        </div>
      )}
    </div>
  );
}
