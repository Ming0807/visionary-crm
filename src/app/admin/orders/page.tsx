"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { 
  ShoppingCart, Search, Download, Eye, ChevronLeft, ChevronRight, 
  Clock, CreditCard, Truck, Package, X, Filter, RefreshCw
} from "lucide-react";
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

// Memoized Order Card component for mobile view - performance optimization
const OrderCard = ({ order, formatPrice, formatDate, getPaymentStatusColor, getFulfillmentStatusColor }: {
  order: any;
  formatPrice: (price: number) => string;
  formatDate: (date: string) => string;
  getPaymentStatusColor: (status: string) => { bg: string; text: string; dot: string };
  getFulfillmentStatusColor: (status: string) => { bg: string; text: string; dot: string };
}) => {
  const paymentColors = getPaymentStatusColor(order.payment_status);
  const fulfillmentColors = getFulfillmentStatusColor(order.fulfillment_status);
  
  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <Link
            href={`/admin/orders/${order.id}`}
            className="font-mono font-semibold text-primary hover:underline"
          >
            {order.order_number}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(order.created_at)}
          </p>
        </div>
        <p className="text-lg font-bold">{formatPrice(order.total_amount)}</p>
      </div>

      {/* Customer Info */}
      {order.customer && (
        <Link
          href={`/admin/customers/${order.customer.id}`}
          className="flex items-center gap-2 mb-3 hover:bg-muted/50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-semibold text-primary">
            {(order.customer.name || "G").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{order.customer.name || "Unknown"}</p>
            <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
          </div>
        </Link>
      )}

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge className={`${paymentColors.bg} ${paymentColors.text} gap-1.5`}>
          <span className={`h-1.5 w-1.5 rounded-full ${paymentColors.dot} ${order.payment_status === 'pending_payment' ? 'animate-pulse' : ''}`} />
          {order.payment_status.replace("_", " ")}
        </Badge>
        <Badge className={`${fulfillmentColors.bg} ${fulfillmentColors.text} gap-1.5`}>
          <span className={`h-1.5 w-1.5 rounded-full ${fulfillmentColors.dot}`} />
          {order.fulfillment_status}
        </Badge>
        <Badge variant="outline" className="capitalize text-xs">
          {order.platform_source}
        </Badge>
      </div>

      {/* Action */}
      <Link href={`/admin/orders/${order.id}`} className="block">
        <Button size="sm" variant="outline" className="w-full gap-2">
          <Eye className="h-4 w-4" />
          ดูรายละเอียด
        </Button>
      </Link>
    </div>
  );
};

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

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }, [searchInput]);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setSearchInput("");
    setPaymentStatus("");
    setFulfillmentStatus("");
    setPage(1);
  }, []);

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 0,
    }).format(price);
  }, []);

  const formatDate = useCallback((date: string) => {
    return new Date(date).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getPaymentStatusColor = useCallback((status: string) => {
    const colors: Record<string, { bg: string; text: string; dot: string }> = {
      paid: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
      pending_payment: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
      verifying: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
      cancelled: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
      refunded: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" },
    };
    return colors[status] || { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" };
  }, []);

  const getFulfillmentStatusColor = useCallback((status: string) => {
    const colors: Record<string, { bg: string; text: string; dot: string }> = {
      delivered: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
      shipped: { bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500" },
      packing: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
      unfulfilled: { bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
      returned: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
    };
    return colors[status] || { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" };
  }, []);

  // Calculate stats from current page (for display purposes)
  const stats = useMemo(() => {
    if (!orders.length) return { pending: 0, toShip: 0, total: 0, revenue: 0 };
    const pending = orders.filter(o => o.payment_status === "pending_payment").length;
    const toShip = orders.filter(o => o.payment_status === "paid" && o.fulfillment_status === "unfulfilled").length;
    const revenue = orders.filter(o => o.payment_status === "paid").reduce((sum, o) => sum + (o.total_amount || 0), 0);
    return { pending, toShip, total: pagination?.total || orders.length, revenue };
  }, [orders, pagination]);

  const hasFilters = search || paymentStatus || fulfillmentStatus;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            จัดการคำสั่งซื้อ {pagination && <span className="font-medium">({pagination.total.toLocaleString()} รายการ)</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => mutate()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">รีเฟรช</span>
          </Button>
          <a href="/api/export?type=orders" download>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <StatsGridSkeleton count={4} className="mb-6" />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {/* Pending Payment */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 font-medium">รอชำระเงิน</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-800 dark:text-amber-200">{stats.pending}</p>
              </div>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-10">
              <Clock className="h-16 w-16 text-amber-600" />
            </div>
          </div>

          {/* To Ship */}
          <div className="relative overflow-hidden bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/30 dark:to-sky-900/20 rounded-xl p-4 border border-sky-200/50 dark:border-sky-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-sky-700 dark:text-sky-300 font-medium">รอจัดส่ง</p>
                <p className="text-xl sm:text-2xl font-bold text-sky-800 dark:text-sky-200">{stats.toShip}</p>
              </div>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-10">
              <Package className="h-16 w-16 text-sky-600" />
            </div>
          </div>

          {/* Total Orders */}
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/20 rounded-xl p-4 border border-violet-200/50 dark:border-violet-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-violet-700 dark:text-violet-300 font-medium">ออเดอร์ทั้งหมด</p>
                <p className="text-xl sm:text-2xl font-bold text-violet-800 dark:text-violet-200">{stats.total.toLocaleString()}</p>
              </div>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-10">
              <ShoppingCart className="h-16 w-16 text-violet-600" />
            </div>
          </div>

          {/* Revenue */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 font-medium">ยอดรวม (หน้านี้)</p>
                <p className="text-lg sm:text-xl font-bold text-emerald-800 dark:text-emerald-200">{formatPrice(stats.revenue)}</p>
              </div>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-10">
              <CreditCard className="h-16 w-16 text-emerald-600" />
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-card rounded-xl border border-border p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาเลข Order, ชื่อลูกค้า..."
              className="pl-9 h-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <Select value={paymentStatus} onValueChange={(v) => { setPaymentStatus(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[150px] h-10">
                <CreditCard className="h-4 w-4 mr-2 text-muted-foreground hidden sm:block" />
                <SelectValue placeholder="ชำระเงิน" />
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
              <SelectTrigger className="w-full sm:w-[150px] h-10">
                <Truck className="h-4 w-4 mr-2 text-muted-foreground hidden sm:block" />
                <SelectValue placeholder="จัดส่ง" />
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

            <Button type="submit" className="h-10 gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">กรอง</span>
            </Button>

            {hasFilters && (
              <Button type="button" variant="ghost" onClick={handleClearFilters} className="h-10 gap-2 text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">ล้าง</span>
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Loading State */}
      {isLoading && <TableSkeleton rows={10} columns={8} />}

      {/* Error State */}
      {isError && (
        <div className="text-center py-12 bg-card rounded-2xl border">
          <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
          <Button onClick={() => mutate()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            ลองใหม่
          </Button>
        </div>
      )}

      {/* Orders Display */}
      {!isLoading && !isError && (
        <>
          {orders.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block bg-card rounded-2xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold">Order</TableHead>
                      <TableHead className="font-semibold">ลูกค้า</TableHead>
                      <TableHead className="font-semibold">ยอดรวม</TableHead>
                      <TableHead className="font-semibold">ชำระเงิน</TableHead>
                      <TableHead className="font-semibold hidden lg:table-cell">จัดส่ง</TableHead>
                      <TableHead className="font-semibold hidden xl:table-cell">Platform</TableHead>
                      <TableHead className="font-semibold">วันที่</TableHead>
                      <TableHead className="text-center font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const paymentColors = getPaymentStatusColor(order.payment_status);
                      const fulfillmentColors = getFulfillmentStatusColor(order.fulfillment_status);
                      return (
                        <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell>
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="font-medium text-foreground hover:text-primary font-mono transition-colors"
                            >
                              {order.order_number}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {order.customer ? (
                              <Link
                                href={`/admin/customers/${order.customer.id}`}
                                className="hover:text-primary transition-colors"
                              >
                                <p className="font-medium">{order.customer.name || "Unknown"}</p>
                                <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">Guest</span>
                            )}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatPrice(order.total_amount)}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${paymentColors.bg} ${paymentColors.text} gap-1.5`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${paymentColors.dot} ${order.payment_status === 'pending_payment' ? 'animate-pulse' : ''}`} />
                              {order.payment_status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge className={`${fulfillmentColors.bg} ${fulfillmentColors.text} gap-1.5`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${fulfillmentColors.dot}`} />
                              {order.fulfillment_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <Badge variant="outline" className="capitalize">
                              {order.platform_source}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDate(order.created_at)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Link href={`/admin/orders/${order.id}`}>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden grid gap-3">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    formatPrice={formatPrice}
                    formatDate={formatDate}
                    getPaymentStatusColor={getPaymentStatusColor}
                    getFulfillmentStatusColor={getFulfillmentStatusColor}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-card rounded-2xl border">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {hasFilters ? "ไม่พบคำสั่งซื้อที่ตรงกับเงื่อนไข" : "ยังไม่มีออเดอร์"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {hasFilters ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" : "ออเดอร์จะปรากฏที่นี่เมื่อลูกค้าสั่งซื้อ"}
              </p>
              {hasFilters && (
                <Button variant="outline" onClick={handleClearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  ล้างตัวกรอง
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-card rounded-xl border border-border p-4">
              <p className="text-sm text-muted-foreground order-2 sm:order-1">
                แสดง <span className="font-medium text-foreground">{((page - 1) * limit) + 1}-{Math.min(page * limit, pagination.total)}</span> จาก <span className="font-medium text-foreground">{pagination.total.toLocaleString()}</span> รายการ
              </p>
              <div className="flex items-center gap-1 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="h-9 px-3"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">ก่อนหน้า</span>
                </Button>
                
                {/* Page Numbers - show on larger screens */}
                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="h-9 w-9 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                {/* Mobile page indicator */}
                <span className="sm:hidden flex items-center px-3 text-sm font-medium">
                  {page} / {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="h-9 px-3"
                >
                  <span className="hidden sm:inline mr-1">ถัดไป</span>
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
