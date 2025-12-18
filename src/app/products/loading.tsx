export default function ProductsLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Skeleton */}
            <div className="mb-8">
                <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
            </div>

            {/* Filters Skeleton */}
            <div className="flex flex-wrap gap-3 mb-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 w-24 bg-muted animate-pulse rounded-full" />
                ))}
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border">
                        <div className="aspect-square bg-muted animate-pulse" />
                        <div className="p-4 space-y-3">
                            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                            <div className="h-5 w-full bg-muted animate-pulse rounded" />
                            <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
