"use client";

import { useState, useEffect } from "react";
import { Package, AlertTriangle, XCircle, ArrowUpDown, RefreshCw, Plus, Minus } from "lucide-react";
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
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [stats, setStats] = useState<InventoryStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

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
        } catch (error) {
            console.error("Failed to fetch inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStock = async (variantId: string, quantity: number, type: "set" | "add" = "set") => {
        try {
            await fetch("/api/inventory", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ variantId, quantity, type }),
            });
            fetchInventory();
            setEditingId(null);
        } catch (error) {
            console.error("Failed to update stock:", error);
        }
    };

    const getStockBadge = (quantity: number) => {
        if (quantity === 0) {
            return (
                <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Out of Stock
                </Badge>
            );
        }
        if (quantity <= 5) {
            return (
                <Badge className="bg-yellow-100 text-yellow-700 gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Low Stock
                </Badge>
            );
        }
        return <Badge className="bg-green-100 text-green-700">In Stock</Badge>;
    };

    if (loading) {
        return (
            <div className="p-6 lg:p-8">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-muted rounded w-48"></div>
                    <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
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
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
                    <p className="text-muted-foreground">Stock levels and alerts</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchInventory}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button
                        variant={showAll ? "default" : "outline"}
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? "Show Low Stock Only" : "Show All"}
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
                                <p className="text-sm text-muted-foreground">Total Stock</p>
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
                                <p className="text-sm text-muted-foreground">Variants</p>
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
                                <p className="text-sm text-muted-foreground">Low Stock</p>
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
                                <p className="text-sm text-muted-foreground">Out of Stock</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Inventory Table */}
            <Card>
                {items.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Variant</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
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
                                        {editingId === item.id ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="w-20"
                                                    min="0"
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => updateStock(item.id, parseInt(editValue))}
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setEditingId(null)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <span
                                                className="font-bold cursor-pointer hover:underline"
                                                onClick={() => {
                                                    setEditingId(item.id);
                                                    setEditValue(item.stock_quantity.toString());
                                                }}
                                            >
                                                {item.stock_quantity}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>{getStockBadge(item.stock_quantity)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-8 w-8"
                                                onClick={() => updateStock(item.id, -1, "add")}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-8 w-8"
                                                onClick={() => updateStock(item.id, 1, "add")}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-12">
                        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                            {showAll ? "No products found" : "All stock levels are healthy!"}
                        </h3>
                        <p className="text-muted-foreground">
                            {showAll
                                ? "Add products to see inventory"
                                : "No items are below the low stock threshold"}
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}
