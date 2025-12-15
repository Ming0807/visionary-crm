import Link from "next/link";
import { Package, ShoppingCart, Users, MessageSquare, FileText, BarChart3 } from "lucide-react";
import AnalyticsCharts from "@/components/AnalyticsCharts";

export default function AdminDashboard() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">ภาพรวมร้านค้าและ Analytics</p>
      </div>

      {/* Analytics Charts */}
      <AnalyticsCharts />

      {/* Quick Actions */}
      <div className="bg-card rounded-2xl p-6 border border-border mt-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/products"
            className="flex items-center gap-3 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <Package className="h-5 w-5 text-primary" />
            <span className="font-medium">Products</span>
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <ShoppingCart className="h-5 w-5 text-primary" />
            <span className="font-medium">Orders</span>
          </Link>
          <Link
            href="/admin/customers"
            className="flex items-center gap-3 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <Users className="h-5 w-5 text-primary" />
            <span className="font-medium">Customers</span>
          </Link>
          <Link
            href="/admin/inbox"
            className="flex items-center gap-3 p-4 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
          >
            <MessageSquare className="h-5 w-5 text-primary" />
            <span className="font-medium">Inbox</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
