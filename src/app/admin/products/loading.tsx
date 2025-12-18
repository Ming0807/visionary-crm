import { TableSkeleton, SearchBarSkeleton } from "@/components/ui/skeletons";

export default function ProductsLoading() {
    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2" />
                </div>
                <div className="h-10 w-32 bg-muted animate-pulse rounded-full" />
            </div>

            {/* Search */}
            <SearchBarSkeleton />

            {/* Table */}
            <TableSkeleton rows={10} columns={9} />
        </div>
    );
}
