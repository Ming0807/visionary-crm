import { cn } from "@/lib/utils";

interface TableSkeletonProps {
    rows?: number;
    columns?: number;
    className?: string;
}

export function TableSkeleton({ rows = 5, columns = 6, className }: TableSkeletonProps) {
    return (
        <div className={cn("bg-card rounded-2xl border border-border overflow-hidden", className)}>
            {/* Header */}
            <div className="bg-muted/50 p-4 border-b">
                <div className="flex gap-4">
                    {Array.from({ length: columns }).map((_, i) => (
                        <div
                            key={i}
                            className="h-4 bg-muted rounded animate-pulse"
                            style={{ width: `${Math.random() * 60 + 40}px` }}
                        />
                    ))}
                </div>
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div
                    key={rowIdx}
                    className="p-4 border-b last:border-0 flex gap-4 items-center"
                >
                    {Array.from({ length: columns }).map((_, colIdx) => (
                        <div
                            key={colIdx}
                            className="h-4 bg-muted rounded animate-pulse"
                            style={{
                                width: colIdx === 0 ? '150px' : `${Math.random() * 80 + 50}px`,
                                opacity: 0.7 - rowIdx * 0.1,
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

interface CardSkeletonProps {
    className?: string;
}

export function CardSkeleton({ className }: CardSkeletonProps) {
    return (
        <div className={cn("bg-card rounded-xl border border-border p-6 animate-pulse", className)}>
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-muted rounded-xl" />
                <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-24 mb-2" />
                    <div className="h-3 bg-muted rounded w-32" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-3/4" />
            </div>
        </div>
    );
}

interface StatsGridSkeletonProps {
    count?: number;
    className?: string;
}

export function StatsGridSkeleton({ count = 4, className }: StatsGridSkeletonProps) {
    return (
        <div className={cn("grid sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-xl" />
                        <div>
                            <div className="h-3 bg-muted rounded w-16 mb-2" />
                            <div className="h-6 bg-muted rounded w-20" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

interface ChartSkeletonProps {
    className?: string;
}

export function ChartSkeleton({ className }: ChartSkeletonProps) {
    return (
        <div className={cn("bg-card rounded-xl border border-border p-6 animate-pulse", className)}>
            <div className="h-4 bg-muted rounded w-32 mb-4" />
            <div className="h-64 bg-muted/50 rounded-lg flex items-end justify-evenly p-4 gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-muted rounded-t w-full max-w-8"
                        style={{ height: `${Math.random() * 80 + 20}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

interface PageHeaderSkeletonProps {
    hasButton?: boolean;
    className?: string;
}

export function PageHeaderSkeleton({ hasButton = true, className }: PageHeaderSkeletonProps) {
    return (
        <div className={cn("flex items-center justify-between mb-8 animate-pulse", className)}>
            <div>
                <div className="h-7 bg-muted rounded w-32 mb-2" />
                <div className="h-4 bg-muted rounded w-48" />
            </div>
            {hasButton && <div className="h-10 bg-muted rounded w-28" />}
        </div>
    );
}

interface SearchBarSkeletonProps {
    className?: string;
}

export function SearchBarSkeleton({ className }: SearchBarSkeletonProps) {
    return (
        <div className={cn("flex gap-4 mb-6 animate-pulse", className)}>
            <div className="h-10 bg-muted rounded w-64" />
            <div className="h-10 bg-muted rounded w-24" />
        </div>
    );
}
