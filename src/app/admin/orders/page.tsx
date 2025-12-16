import Link from "next/link";
import { ShoppingCart, Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

async function getOrders() {
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      customer:customers(id, name, phone),
      items:order_items(id)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return orders;
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: "bg-green-100 text-green-700",
      pending_payment: "bg-yellow-100 text-yellow-700",
      verifying: "bg-blue-100 text-blue-700",
      cancelled: "bg-red-100 text-red-700",
      refunded: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getFulfillmentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      delivered: "bg-green-100 text-green-700",
      shipped: "bg-blue-100 text-blue-700",
      packing: "bg-purple-100 text-purple-700",
      unfulfilled: "bg-orange-100 text-orange-700",
      returned: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  // Calculate stats
  const pendingOrders = orders.filter(o => o.payment_status === "pending_payment").length;
  const toShipOrders = orders.filter(o => o.payment_status === "paid" && o.fulfillment_status === "unfulfilled").length;
  const totalRevenue = orders
    .filter(o => o.payment_status === "paid")
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders ({orders.length} total)
          </p>
        </div>
        <a href="/api/export?type=orders" download>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Pending Payment</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">To Ship</p>
          <p className="text-2xl font-bold text-blue-600">{toShipOrders}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold text-primary">{formatPrice(totalRevenue)}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search orders..." className="pl-9" />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {orders.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-foreground hover:text-primary font-mono"
                    >
                      {order.order_number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {order.customer ? (
                      <Link
                        href={`/admin/customers/${order.customer.id}`}
                        className="hover:text-primary"
                      >
                        <p className="font-medium">{order.customer.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">Guest</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {order.items?.length || 0} items
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(order.total_amount)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getPaymentStatusColor(order.payment_status)}>
                      {order.payment_status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getFulfillmentStatusColor(order.fulfillment_status)}>
                      {order.fulfillment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {order.platform_source}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(order.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No orders yet</h3>
            <p className="text-muted-foreground">
              Orders will appear here when customers make purchases
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
