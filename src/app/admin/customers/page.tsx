import Link from "next/link";
import { Users, Search, Filter, Download } from "lucide-react";
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
import TierBadge from "@/components/TierBadge";
import RFMBadge from "@/components/RFMBadge";

async function getCustomers() {
  const { data: customers, error } = await supabase
    .from("customers")
    .select(`
      *,
      social_identities(*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching customers:", error);
    return [];
  }

  return customers;
}

export default async function AdminCustomersPage() {
  const customers = await getCustomers();

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
    });
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer relationships ({customers.length} total)
          </p>
        </div>
        <a href="/api/export?type=customers" download>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </a>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search customers..." className="pl-9" />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Customers Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {customers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>RFM Segment</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="block w-full font-medium text-foreground hover:text-primary"
                    >
                      {customer.name || "Unknown"}
                    </Link>
                    {customer.style_tags && customer.style_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {customer.style_tags.slice(0, 2).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/customers/${customer.id}`} className="block">
                      <div className="text-sm">
                        <p>{customer.phone || "-"}</p>
                        <p className="text-muted-foreground text-xs">{customer.email || "-"}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/customers/${customer.id}`}>
                      <TierBadge tier={customer.tier} />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/customers/${customer.id}`} className="font-medium">
                      {customer.points?.toLocaleString() || 0}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/customers/${customer.id}`}>
                      <RFMBadge segment={customer.rfm_segment} score={customer.rfm_score} />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/customers/${customer.id}`} className="font-medium">
                      {formatPrice(customer.total_spent || 0)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/customers/${customer.id}`}>
                      {customer.purchase_count || 0}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/customers/${customer.id}`} className="text-muted-foreground text-sm">
                      {formatDate(customer.created_at)}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No customers yet</h3>
            <p className="text-muted-foreground">
              Customers will appear here when they make purchases
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
