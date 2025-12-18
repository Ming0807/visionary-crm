"use client";

import { useState } from "react";
import { Filter, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductFiltersProps {
    categories: string[];
    brands: string[];
    onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
    category: string;
    brand: string;
    priceRange: string;
    sortBy: string;
}

const priceRanges = [
    { value: "", label: "ทุกราคา" },
    { value: "0-2000", label: "ต่ำกว่า ฿2,000" },
    { value: "2000-5000", label: "฿2,000 - ฿5,000" },
    { value: "5000-10000", label: "฿5,000 - ฿10,000" },
    { value: "10000-", label: "มากกว่า ฿10,000" },
];

const sortOptions = [
    { value: "newest", label: "ใหม่ล่าสุด" },
    { value: "price-asc", label: "ราคา: ต่ำ → สูง" },
    { value: "price-desc", label: "ราคา: สูง → ต่ำ" },
    { value: "name-asc", label: "ชื่อ: ก → ฮ" },
];

export default function ProductFilters({
    categories = [],
    brands = [],
    onFilterChange,
}: ProductFiltersProps) {
    const [filters, setFilters] = useState<FilterState>({
        category: "",
        brand: "",
        priceRange: "",
        sortBy: "newest",
    });
    const [isOpen, setIsOpen] = useState(false);

    const updateFilter = (key: keyof FilterState, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const resetFilters = {
            category: "",
            brand: "",
            priceRange: "",
            sortBy: "newest",
        };
        setFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    const activeFilterCount = [filters.category, filters.brand, filters.priceRange].filter(Boolean).length;

    return (
        <div className="mb-6">
            {/* Mobile Toggle */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
                <Button
                    variant="outline"
                    onClick={() => setIsOpen(!isOpen)}
                    className="gap-2"
                >
                    <Filter className="h-4 w-4" />
                    ตัวกรอง
                    {activeFilterCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>

                {/* Sort Dropdown Mobile */}
                <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilter("sortBy", e.target.value)}
                    className="h-10 px-3 rounded-lg border border-border bg-background text-sm"
                >
                    {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Filters - Desktop always visible, Mobile toggleable */}
            <div className={`${isOpen ? "block" : "hidden"} lg:block`}>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Category Pills */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => updateFilter("category", "")}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                !filters.category
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                        >
                            ทั้งหมด
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => updateFilter("category", cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    filters.category === cat
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="hidden lg:block w-px h-6 bg-border" />

                    {/* Brand Dropdown */}
                    {brands.length > 0 && (
                        <select
                            value={filters.brand}
                            onChange={(e) => updateFilter("brand", e.target.value)}
                            className="h-10 px-3 rounded-full border border-border bg-background text-sm"
                        >
                            <option value="">ทุกแบรนด์</option>
                            {brands.map((brand) => (
                                <option key={brand} value={brand}>
                                    {brand}
                                </option>
                            ))}
                        </select>
                    )}

                    {/* Price Range */}
                    <select
                        value={filters.priceRange}
                        onChange={(e) => updateFilter("priceRange", e.target.value)}
                        className="h-10 px-3 rounded-full border border-border bg-background text-sm"
                    >
                        {priceRanges.map((range) => (
                            <option key={range.value} value={range.value}>
                                {range.label}
                            </option>
                        ))}
                    </select>

                    {/* Sort - Desktop */}
                    <div className="hidden lg:block ml-auto">
                        <select
                            value={filters.sortBy}
                            onChange={(e) => updateFilter("sortBy", e.target.value)}
                            className="h-10 px-3 rounded-full border border-border bg-background text-sm"
                        >
                            {sortOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Clear Filters */}
                    {activeFilterCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-muted-foreground"
                        >
                            <X className="h-4 w-4 mr-1" />
                            ล้างตัวกรอง
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
