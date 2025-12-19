"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { 
  Users, Search, Download, Eye, ChevronLeft, ChevronRight, 
  Crown, Star, Award, RefreshCw, Filter, X, ShoppingBag, TrendingUp
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
import TierBadge from "@/components/TierBadge";
import RFMBadge from "@/components/RFMBadge";
import { useCustomers } from "@/hooks/use-data";
import { TableSkeleton, StatsGridSkeleton } from "@/components/ui/skeletons";

// Helper to get profile picture - check customer.profile_image_url first, then social_identities
const getProfilePicture = (customer: any): string | null => {
  // Priority 1: Direct profile_image_url column
  if (customer.profile_image_url) return customer.profile_image_url;
  
  // Priority 2: social_identities profile_data
  if (!customer.social_identities?.length) return null;
  for (const identity of customer.social_identities) {
    const data = identity.profile_data as Record<string, any>;
    if (data?.pictureUrl) return data.pictureUrl; // LINE
    if (data?.picture) return data.picture; // Facebook
    if (data?.avatar_url) return data.avatar_url; // Generic
  }
  return null;
};

// Memoized Customer Card for mobile view
const CustomerCard = ({ 
  customer, 
  formatPrice, 
  formatDate 
}: { 
  customer: any; 
  formatPrice: (price: number) => string;
  formatDate: (date: string) => string;
}) => {
  const profilePic = getProfilePicture(customer);
  
  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow duration-200">
      {/* Header with avatar and name */}
      <div className="flex items-start gap-3 mb-3">
        {profilePic ? (
          <img
            src={profilePic}
            alt={customer.name || "Profile"}
            className="h-10 w-10 rounded-full object-cover flex-shrink-0 ring-2 ring-primary/20"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
            {(customer.name || "?").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Link
            href={`/admin/customers/${customer.id}`}
            className="font-semibold text-foreground hover:text-primary transition-colors truncate block"
          >
            {customer.name || "Unknown"}
          </Link>
          <p className="text-xs text-muted-foreground">{customer.phone || customer.email || "-"}</p>
        </div>
        <TierBadge tier={customer.tier} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="bg-muted/50 rounded-lg p-2">
          <p className="text-xs text-muted-foreground">ยอดซื้อ</p>
          <p className="text-sm font-semibold">{formatPrice(customer.total_spent || 0)}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2">
          <p className="text-xs text-muted-foreground">คำสั่งซื้อ</p>
          <p className="text-sm font-semibold">{customer.purchase_count || 0}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2">
          <p className="text-xs text-muted-foreground">แต้ม</p>
          <p className="text-sm font-semibold">{customer.points?.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* RFM and date */}
      <div className="flex items-center justify-between mb-3">
        <RFMBadge segment={customer.rfm_segment} score={customer.rfm_score} />
        <span className="text-xs text-muted-foreground">{formatDate(customer.created_at)}</span>
      </div>

      {/* Action */}
      <Link href={`/admin/customers/${customer.id}`} className="block">
        <Button size="sm" variant="outline" className="w-full gap-2">
          <Eye className="h-4 w-4" />
          ดูรายละเอียด
        </Button>
      </Link>
    </div>
  );
};

export default function AdminCustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [tier, setTier] = useState("");
  const limit = 20;

  const { customers, pagination, isLoading, isError, mutate } = useCustomers(page, limit, search, tier);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }, [searchInput]);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setSearchInput("");
    setTier("");
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
    });
  }, []);

  // Calculate stats from current data
  const stats = useMemo(() => {
    if (!customers.length) return { total: 0, vip: 0, avgSpent: 0, totalSpent: 0 };
    const vip = customers.filter(c => ["gold", "platinum", "vip"].includes(c.tier)).length;
    const totalSpent = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const avgSpent = totalSpent / customers.length;
    return { 
      total: pagination?.total || customers.length, 
      vip, 
      avgSpent,
      totalSpent
    };
  }, [customers, pagination]);

  const hasFilters = search || tier;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">ลูกค้า</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            จัดการลูกค้าและ CRM {pagination && <span className="font-medium">({pagination.total.toLocaleString()} คน)</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => mutate()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">รีเฟรช</span>
          </Button>
          <a href="/api/export?type=customers" download>
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
          {/* Total Customers */}
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/20 rounded-xl p-4 border border-violet-200/50 dark:border-violet-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-violet-700 dark:text-violet-300 font-medium">ลูกค้าทั้งหมด</p>
                <p className="text-xl sm:text-2xl font-bold text-violet-800 dark:text-violet-200">{stats.total.toLocaleString()}</p>
              </div>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-10">
              <Users className="h-16 w-16 text-violet-600" />
            </div>
          </div>

          {/* VIP Customers */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 rounded-xl p-4 border border-amber-200/50 dark:border-amber-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 font-medium">VIP/Gold+</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-800 dark:text-amber-200">{stats.vip}</p>
              </div>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-10">
              <Crown className="h-16 w-16 text-amber-600" />
            </div>
          </div>

          {/* Total Spent */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 font-medium">ยอดซื้อรวม</p>
                <p className="text-lg sm:text-xl font-bold text-emerald-800 dark:text-emerald-200">{formatPrice(stats.totalSpent)}</p>
              </div>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-10">
              <TrendingUp className="h-16 w-16 text-emerald-600" />
            </div>
          </div>

          {/* Average Spent */}
          <div className="relative overflow-hidden bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-950/30 dark:to-sky-900/20 rounded-xl p-4 border border-sky-200/50 dark:border-sky-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-sky-700 dark:text-sky-300 font-medium">เฉลี่ย/คน</p>
                <p className="text-lg sm:text-xl font-bold text-sky-800 dark:text-sky-200">{formatPrice(stats.avgSpent)}</p>
              </div>
            </div>
            <div className="absolute -right-2 -bottom-2 opacity-10">
              <ShoppingBag className="h-16 w-16 text-sky-600" />
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
              placeholder="ค้นหาชื่อ, เบอร์โทร, อีเมล..."
              className="pl-9 h-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <Select value={tier} onValueChange={(v) => { setTier(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[140px] h-10">
                <Crown className="h-4 w-4 mr-2 text-muted-foreground hidden sm:block" />
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
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
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
          <Button onClick={() => mutate()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            ลองใหม่
          </Button>
        </div>
      )}

      {/* Customers Display */}
      {!isLoading && !isError && (
        <>
          {customers.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block bg-card rounded-2xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-semibold">ลูกค้า</TableHead>
                      <TableHead className="font-semibold">ติดต่อ</TableHead>
                      <TableHead className="font-semibold">Tier</TableHead>
                      <TableHead className="font-semibold">แต้ม</TableHead>
                      <TableHead className="font-semibold hidden xl:table-cell">RFM</TableHead>
                      <TableHead className="font-semibold">ยอดซื้อ</TableHead>
                      <TableHead className="font-semibold hidden xl:table-cell">ออเดอร์</TableHead>
                      <TableHead className="font-semibold hidden xl:table-cell">สมัคร</TableHead>
                      <TableHead className="text-center font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => {
                      const profilePic = getProfilePicture(customer);
                      return (
                      <TableRow key={customer.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            className="flex items-center gap-3 hover:text-primary transition-colors"
                          >
                            {profilePic ? (
                              <img
                                src={profilePic}
                                alt={customer.name || "Profile"}
                                className="h-8 w-8 rounded-full object-cover flex-shrink-0 ring-2 ring-primary/20"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-semibold text-primary flex-shrink-0">
                                {(customer.name || "?").charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="font-medium">{customer.name || "Unknown"}</span>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{customer.phone || "-"}</p>
                            <p className="text-muted-foreground text-xs truncate max-w-[150px]">{customer.email || "-"}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <TierBadge tier={customer.tier} />
                        </TableCell>
                        <TableCell className="font-medium tabular-nums">
                          {customer.points?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <RFMBadge segment={customer.rfm_segment} score={customer.rfm_score} />
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatPrice(customer.total_spent || 0)}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell tabular-nums">
                          {customer.purchase_count || 0}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm hidden xl:table-cell">
                          {formatDate(customer.created_at)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Link href={`/admin/customers/${customer.id}`}>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )})}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden grid sm:grid-cols-2 gap-3">
                {customers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    formatPrice={formatPrice}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-card rounded-2xl border">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {hasFilters ? "ไม่พบลูกค้าที่ตรงกับเงื่อนไข" : "ยังไม่มีลูกค้า"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {hasFilters ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" : "ลูกค้าจะปรากฏที่นี่เมื่อมีการสั่งซื้อ"}
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
                แสดง <span className="font-medium text-foreground">{((page - 1) * limit) + 1}-{Math.min(page * limit, pagination.total)}</span> จาก <span className="font-medium text-foreground">{pagination.total.toLocaleString()}</span> คน
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
