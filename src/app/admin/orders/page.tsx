"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ShoppingCart, Search, Download, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/hooks/use-data";
import { TableSkeleton, StatsGridSkeleton } from "@/components/ui/skeletons";

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [fulfillmentStatus, setFulfillmentStatus] = useState("");
  const limit = 20;

  const { orders, pagination, isLoading, isError, mutate } = useOrders(
    page, limit, search, paymentStatus, fulfillmentStatus
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

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

  // Calculate stats from current page (for display purposes)
  const stats = useMemo(() => {
    if (!orders.length) return { pending: 0, toShip: 0, total: 0, revenue: 0 };
    const pending = orders.filter(o => o.payment_status === "pending_payment").length;
    const toShip = orders.filter(o => o.payment_status === "paid" && o.fulfillment_status === "unfulfilled").length;
    const revenue = orders.filter(o => o.payment_status === "paid").reduce((sum, o) => sum + (o.total_amount || 0), 0);
    return { pending, toShip, total: pagination?.total || orders.length, revenue };
  }, [orders, pagination]);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground">
            Manage customer orders {pagination && `(${pagination.total} total)`}
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
      {isLoading ? (
        <StatsGridSkeleton count={4} className="mb-6" />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">รอชำระเงิน</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">รอจัดส่ง</p>
            <p className="text-2xl font-bold text-blue-600">{stats.toShip}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">ยอดรวม (หน้านี้)</p>
            <p className="text-2xl font-bold text-primary">{formatPrice(stats.revenue)}</p>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="ค้นหาเลข Order..." 
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Select value={paymentStatus} onValueChange={(v) => { setPaymentStatus(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="สถานะชำระเงิน" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="pending_payment">รอชำระ</SelectItem>
            <SelectItem value="verifying">ตรวจสอบ</SelectItem>
            <SelectItem value="paid">ชำระแล้ว</SelectItem>
            <SelectItem value="cancelled">ยกเลิก</SelectItem>
            <SelectItem value="refunded">คืนเงิน</SelectItem>
          </SelectContent>
        </Select>
        <Select value={fulfillmentStatus} onValueChange={(v) => { setFulfillmentStatus(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="สถานะจัดส่ง" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="unfulfilled">ยังไม่จัดส่ง</SelectItem>
            <SelectItem value="packing">กำลังแพ็ค</SelectItem>
            <SelectItem value="shipped">จัดส่งแล้ว</SelectItem>
            <SelectItem value="delivered">ส่งถึงแล้ว</SelectItem>
            <SelectItem value="returned">ส่งคืน</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="default">
          <Search className="h-4 w-4 mr-2" />
          ค้นหา
        </Button>
        {(search || paymentStatus || fulfillmentStatus) && (
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => { 
              setSearch(""); 
              setSearchInput(""); 
              setPaymentStatus(""); 
              setFulfillmentStatus(""); 
              setPage(1); 
            }}
          >
            ล้าง
          </Button>
        )}
      </form>

      {/* Loading State */}
      {isLoading && <TableSkeleton rows={10} columns={8} />}

      {/* Error State */}
      {isError && (
        <div className="text-center py-12 bg-card rounded-2xl border">
          <p className="text-muted-foreground mb-4">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
          <Button onClick={() => mutate()}>ลองใหม่</Button>
        </div>
      )}

      {/* Orders Table */}
      {!isLoading && !isError && (
        <>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {orders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Fulfillment</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/50">
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
                      <TableCell className="text-center">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            ดู
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {search || paymentStatus || fulfillmentStatus ? "ไม่พบคำสั่งซื้อที่ตรงกับเงื่อนไข" : "No orders yet"}
                </h3>
                <p className="text-muted-foreground">
                  {search || paymentStatus || fulfillmentStatus ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" : "Orders will appear here when customers make purchases"}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                แสดง {((page - 1) * limit) + 1}-{Math.min(page * limit, pagination.total)} จาก {pagination.total} รายการ
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  ก่อนหน้า
                </Button>
                <span className="flex items-center px-3 text-sm">
                  หน้า {page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  ถัดไป
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
