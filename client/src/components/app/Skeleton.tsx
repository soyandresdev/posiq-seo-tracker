export function Skeleton({ className = "" }: { className?: string }) {
    return <div aria-hidden className={`skeleton ${className}`} />;
}

export function RowSkeleton({ rows = 4 }: { rows?: number }) {
    return (
        <div className="card divide-y divide-border">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-5 p-5">
                    <Skeleton className="size-12 rounded-full!" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-4 w-16 hidden sm:block" />
                </div>
            ))}
        </div>
    );
}
