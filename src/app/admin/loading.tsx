import { StatsGridSkeleton, ChartSkeleton, CardSkeleton } from "@/components/ui/skeletons";

export default function AdminLoading() {
    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="mb-8">
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-48 bg-muted animate-pulse rounded mt-2" />
            </div>

            {/* Stats */}
            <StatsGridSkeleton count={4} />

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
                <ChartSkeleton />
                <ChartSkeleton />
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-2xl p-6 border border-border">
                <div className="h-6 w-32 bg-muted animate-pulse rounded mb-4" />
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <CardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
