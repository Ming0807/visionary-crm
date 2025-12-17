"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Package, Edit, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
import { useProducts } from "@/hooks/use-data";
import { TableSkeleton } from "@/components/ui/skeletons";

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const limit = 20;

  const { products, pagination, isLoading, isError, mutate } = useProducts(
    page, limit, search, category, true
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

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog {pagination && `(${pagination.total} total)`}
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Search & Filter */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="ค้นหาชื่อ, แบรนด์..." 
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={(v) => { setCategory(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="หมวดหมู่ทั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="sunglasses">Sunglasses</SelectItem>
            <SelectItem value="eyeglasses">Eyeglasses</SelectItem>
            <SelectItem value="contact-lens">Contact Lens</SelectItem>
            <SelectItem value="accessories">Accessories</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="default">
          <Search className="h-4 w-4 mr-2" />
          ค้นหา
        </Button>
        {(search || category) && (
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => { setSearch(""); setSearchInput(""); setCategory(""); setPage(1); }}
          >
            ล้าง
          </Button>
        )}
      </form>

      {/* Loading State */}
      {isLoading && <TableSkeleton rows={10} columns={9} />}

      {/* Error State */}
      {isError && (
        <div className="text-center py-12 bg-card rounded-2xl border">
          <p className="text-muted-foreground mb-4">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
          <Button onClick={() => mutate()}>ลองใหม่</Button>
        </div>
      )}

      {/* Products Table */}
      {!isLoading && !isError && (
        <>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {products.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Variants</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const variants = product.variants as Array<{
                      id: string;
                      sku?: string;
                      color_code?: string | null;
                      images?: string[];
                      inventory?: Array<{ quantity: number }>;
                    }> | undefined;
                    const firstVariant = variants?.[0];
                    const imageUrl = firstVariant?.images?.[0];
                    const totalStock = variants?.reduce(
                      (sum, v) => sum + (v.inventory?.[0]?.quantity || 0),
                      0
                    ) || 0;

                    return (
                      <TableRow key={product.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary">
                            {imageUrl ? (
                              <Image
                                src={imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="font-medium text-foreground hover:text-primary"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {firstVariant?.sku}
                          </p>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.brand || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.category || "N/A"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {variants?.slice(0, 3).map((v) => (
                              <span
                                key={v.id}
                                className="w-5 h-5 rounded-full border"
                                style={{ backgroundColor: v.color_code || "#ccc" }}
                              />
                            ))}
                            {(variants?.length || 0) > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{(variants?.length || 0) - 3}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(product.base_price)}
                        </TableCell>
                        <TableCell>
                          <span className={totalStock <= 5 ? "text-destructive font-medium" : ""}>
                            {totalStock}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.is_active ? "default" : "secondary"}>
                            {product.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button asChild variant="ghost" size="icon">
                            <Link href={`/admin/products/${product.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {search || category ? "ไม่พบสินค้าที่ตรงกับเงื่อนไข" : "No products yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {search || category ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" : "Get started by adding your first product"}
                </p>
                {!(search || category) && (
                  <Button asChild>
                    <Link href="/admin/products/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Link>
                  </Button>
                )}
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
