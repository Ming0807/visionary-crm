import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import ProductDetail from "./ProductDetail";
import RelatedProducts from "@/components/RelatedProducts";

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  
  if (!product) {
    return { title: "ไม่พบสินค้า" };
  }

  return {
    title: product.name,
    description: product.description || `${product.name} - ${product.brand} แว่นตาคุณภาพจาก The Visionary`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.variants?.[0]?.images?.[0] ? [product.variants[0].images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductDetail product={product} />
      <RelatedProducts 
        currentProductId={product.id} 
        category={product.category}
        brand={product.brand}
      />
    </>
  );
}

