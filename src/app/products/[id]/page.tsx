import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import ProductDetail from "./ProductDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  const { data: product, error } = await supabase
    .from("products")
    .select(`
      *,
      variants:product_variants(
        *,
        inventory(*)
      )
    `)
    .eq("id", id)
    .single();

  if (error || !product) {
    return null;
  }

  return product;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
