"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Search, Download, Eye, ChevronLeft, ChevronRight } from "lucide-react";
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
import { TableSkeleton } from "@/components/ui/skeletons";

export default function AdminCustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [tier, setTier] = useState("");
  const limit = 20;

  const { customers, pagination, isLoading, isError, mutate } = useCustomers(page, limit, search, tier);

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
    });
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer relationships 
            {pagination && ` (${pagination.total} total)`}
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
      <form onSubmit={handleSearch} className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="ค้นหาชื่อ, เบอร์โทร, อีเมล..." 
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Select value={tier} onValueChange={(v) => { setTier(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tier ทั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tier ทั้งหมด</SelectItem>
            <SelectItem value="member">Member</SelectItem>
            <SelectItem value="bronze">Bronze</SelectItem>
            <SelectItem value="silver">Silver</SelectItem>
            <SelectItem value="gold">Gold</SelectItem>
            <SelectItem value="platinum">Platinum</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="default">
          <Search className="h-4 w-4 mr-2" />
          ค้นหา
        </Button>
        {(search || tier) && (
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => { setSearch(""); setSearchInput(""); setTier(""); setPage(1); }}
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

      {/* Customers Table */}
      {!isLoading && !isError && (
        <>
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
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="block w-full font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {customer.name || "Unknown"}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{customer.phone || "-"}</p>
                          <p className="text-muted-foreground text-xs">{customer.email || "-"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <TierBadge tier={customer.tier} />
                      </TableCell>
                      <TableCell className="font-medium">
                        {customer.points?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell>
                        <RFMBadge segment={customer.rfm_segment} score={customer.rfm_score} />
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(customer.total_spent || 0)}
                      </TableCell>
                      <TableCell>
                        {customer.purchase_count || 0}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(customer.created_at)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Link href={`/admin/customers/${customer.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            ดูรายละเอียด
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {search || tier ? "ไม่พบลูกค้าที่ตรงกับเงื่อนไข" : "No customers yet"}
                </h3>
                <p className="text-muted-foreground">
                  {search || tier ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" : "Customers will appear here when they make purchases"}
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
