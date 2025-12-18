import { TableSkeleton, SearchBarSkeleton } from "@/components/ui/skeletons";

export default function CustomersLoading() {
    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="h-8 w-28 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-52 bg-muted animate-pulse rounded mt-2" />
                </div>
            </div>

            {/* Search */}
            <SearchBarSkeleton />

            {/* Table */}
            <TableSkeleton rows={10} columns={7} />
        </div>
    );
}
