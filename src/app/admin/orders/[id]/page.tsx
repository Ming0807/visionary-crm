import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import OrderDetail from "@/app/admin/orders/[id]/OrderDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getOrder(id: string) {
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      customer:customers(*),
      items:order_items(
        *,
        variant:product_variants(
          *,
          product:products(*)
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !order) {
    return null;
  }

  return order;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  return <OrderDetail order={order} />;
}
