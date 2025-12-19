"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const sortOptions = [
    { value: "newest", label: "ใหม่ล่าสุด" },
    { value: "price-low", label: "ราคาต่ำ-สูง" },
    { value: "price-high", label: "ราคาสูง-ต่ำ" },
    { value: "name", label: "ชื่อ A-Z" },
];

interface ProductSortProps {
    currentSort?: string;
}

export default function ProductSort({ currentSort = "newest" }: ProductSortProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "newest") {
            params.delete("sort");
        } else {
            params.set("sort", value);
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">เรียงตาม:</span>
            <select
                value={currentSort}
                onChange={(e) => handleChange(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
                {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
