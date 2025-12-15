import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import CustomerDetail from "@/app/admin/customers/[id]/CustomerDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getCustomer(id: string) {
  const { data: customer, error } = await supabase
    .from("customers")
    .select(`
      *,
      social_identities(*)
    `)
    .eq("id", id)
    .single();

  if (error || !customer) {
    return null;
  }

  // Get orders
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items(
        *,
        variant:product_variants(
          *,
          product:products(*)
        )
      )
    `)
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  // Get point transactions
  const { data: pointTransactions } = await supabase
    .from("point_transactions")
    .select("*")
    .eq("customer_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  // Get behaviors
  const { data: behaviors } = await supabase
    .from("customer_behaviors")
    .select(`
      *,
      variant:product_variants(
        *,
        product:products(*)
      )
    `)
    .eq("customer_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Get claims
  const { data: claims } = await supabase
    .from("claims_returns")
    .select("*")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  return {
    ...customer,
    orders: orders || [],
    pointTransactions: pointTransactions || [],
    behaviors: behaviors || [],
    claims: claims || [],
  };
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) {
    notFound();
  }

  return <CustomerDetail customer={customer} />;
}
