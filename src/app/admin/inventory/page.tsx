"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, AlertTriangle, XCircle, RefreshCw, Plus, Minus, Save, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface InventoryItem {
    id: string;
    color_name: string | null;
    stock_quantity: number;
    sku: string | null;
    products: {
        id: string;
        name: string;
        brand: string | null;
        is_active: boolean;
    };
}

interface InventoryStats {
    totalVariants: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalStock: number;
    threshold: number;
}

export default function AdminInventoryPage() {
    const { toast } = useToast();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [stats, setStats] = useState<InventoryStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(true);
    const [search, setSearch] = useState("");
    const [editedStocks, setEditedStocks] = useState<Record<string, number>>({});
    const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchInventory();
    }, [showAll]);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/inventory?threshold=5&all=${showAll}`);
            const data = await res.json();
            setItems(data.items || []);
            setStats(data.stats);
            // Initialize edited stocks
            const stocks: Record<string, number> = {};
            (data.items || []).forEach((item: InventoryItem) => {
                stocks[item.id] = item.stock_quantity;
            });
            setEditedStocks(stocks);
        } catch (error) {
            console.error("Failed to fetch inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStockChange = (id: string, value: number) => {
        setEditedStocks((prev) => ({ ...prev, [id]: Math.max(0, value) }));
    };

    const handleQuickAdjust = (id: string, delta: number) => {
        const current = editedStocks[id] || 0;
        handleStockChange(id, current + delta);
    };

    const saveStock = async (variantId: string) => {
        const quantity = editedStocks[variantId];
        if (quantity === undefined) return;

        setSavingIds((prev) => new Set(prev).add(variantId));

        try {
            const res = await fetch("/api/inventory", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ variantId, quantity, type: "set" }),
            });

            if (res.ok) {
                // Update local state optimistically
                setItems((prev) =>
                    prev.map((item) =>
                        item.id === variantId ? { ...item, stock_quantity: quantity } : item
                    )
                );
                toast({ title: "บันทึกแล้ว!" });
            } else {
                toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
            }
        } catch (error) {
            console.error("Failed to update stock:", error);
            toast({ title: "เกิดข้อผิดพลาด", variant: "destructive" });
        } finally {
            setSavingIds((prev) => {
                const next = new Set(prev);
                next.delete(variantId);
                return next;
            });
        }
    };

    const hasChanged = (id: string) => {
        const item = items.find((i) => i.id === id);
        return item && editedStocks[id] !== item.stock_quantity;
    };

    const getStockBadge = (quantity: number) => {
        if (quantity === 0) {
            return (
                <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    หมด
                </Badge>
            );
        }
        if (quantity <= 5) {
            return (
                <Badge className="bg-yellow-100 text-yellow-700 gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    ใกล้หมด
                </Badge>
            );
        }
        return <Badge className="bg-green-100 text-green-700">มีสต๊อก</Badge>;
    };

    // Filter items by search
    const filteredItems = items.filter((item) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            item.products?.name?.toLowerCase().includes(q) ||
            item.sku?.toLowerCase().includes(q) ||
            item.color_name?.toLowerCase().includes(q)
        );
    });

    if (loading) {
        return (
            <div className="p-6 lg:p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-48"></div>
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-24 bg-muted rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">คลังสินค้า</h1>
                    <p className="text-muted-foreground">จัดการสต๊อกสินค้า</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="ค้นหา..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 w-48"
                        />
                    </div>
                    <Button variant="outline" onClick={fetchInventory}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        รีเฟรช
                    </Button>
                    <Button
                        variant={showAll ? "default" : "outline"}
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? "เฉพาะใกล้หมด" : "ทั้งหมด"}
                    </Button>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                <Package className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalStock}</p>
                                <p className="text-sm text-muted-foreground">สต๊อกรวม</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 text-green-600">
                                <Package className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.totalVariants}</p>
                                <p className="text-sm text-muted-foreground">รายการ</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                                <AlertTriangle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.lowStockCount}</p>
                                <p className="text-sm text-muted-foreground">ใกล้หมด</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-100 text-red-600">
                                <XCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.outOfStockCount}</p>
                                <p className="text-sm text-muted-foreground">หมดสต๊อก</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Inventory Table */}
            <Card>
                {filteredItems.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>สินค้า</TableHead>
                                <TableHead>ตัวเลือก</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead className="w-[200px]">จำนวน</TableHead>
                                <TableHead>สถานะ</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredItems.map((item) => {
                                const currentStock = editedStocks[item.id] ?? item.stock_quantity;
                                const changed = hasChanged(item.id);
                                const saving = savingIds.has(item.id);

                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{item.products?.name}</p>
                                                <p className="text-sm text-muted-foreground">{item.products?.brand}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{item.color_name || "Default"}</TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {item.sku || "-"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-8 w-8"
                                                    onClick={() => handleQuickAdjust(item.id, -1)}
                                                    disabled={saving}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <Input
                                                    type="number"
                                                    value={currentStock}
                                                    onChange={(e) =>
                                                        handleStockChange(item.id, parseInt(e.target.value) || 0)
                                                    }
                                                    className="w-20 text-center"
                                                    min="0"
                                                    disabled={saving}
                                                />
                                                <Button
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-8 w-8"
                                                    onClick={() => handleQuickAdjust(item.id, 1)}
                                                    disabled={saving}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStockBadge(currentStock)}</TableCell>
                                        <TableCell>
                                            {changed && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => saveStock(item.id)}
                                                    disabled={saving}
                                                >
                                                    <Save className="h-4 w-4 mr-1" />
                                                    {saving ? "..." : "บันทึก"}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-12">
                        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">ไม่พบสินค้า</h3>
                        <p className="text-muted-foreground">
                            {search ? "ไม่พบสินค้าที่ค้นหา" : "ยังไม่มีสินค้าในคลัง"}
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}
