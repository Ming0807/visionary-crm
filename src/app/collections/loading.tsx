export default function CollectionsLoading() {
    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header Skeleton */}
            <div className="text-center mb-12">
                <div className="h-10 w-48 bg-muted animate-pulse rounded mx-auto mb-4" />
                <div className="h-4 w-96 max-w-full bg-muted animate-pulse rounded mx-auto" />
            </div>

            {/* Special Collections Skeleton */}
            <div className="grid md:grid-cols-3 gap-4 mb-12">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-border">
                        <div className="w-12 h-12 rounded-xl bg-muted animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-5 w-24 bg-muted animate-pulse rounded" />
                            <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Collections Skeleton */}
            <div className="h-6 w-40 bg-muted animate-pulse rounded mb-6" />
            <div className="grid md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="aspect-[16/9] rounded-3xl bg-muted animate-pulse" />
                ))}
            </div>
        </div>
    );
}
