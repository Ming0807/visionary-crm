import { TableSkeleton, SearchBarSkeleton } from "@/components/ui/skeletons";

export default function OrdersLoading() {
    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2" />
                </div>
                <div className="h-10 w-32 bg-muted animate-pulse rounded" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-card rounded-xl p-4 border">
                        <div className="h-4 w-20 bg-muted animate-pulse rounded mb-2" />
                        <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                    </div>
                ))}
            </div>

            {/* Search */}
            <SearchBarSkeleton />

            {/* Table */}
            <TableSkeleton rows={10} columns={8} />
        </div>
    );
}
