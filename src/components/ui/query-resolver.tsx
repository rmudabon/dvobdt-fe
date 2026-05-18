import type { UseQueryResult } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

const DefaultSkeleton = () => (
    <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
    </div>
)

type QueryResolverProps<TData> = {
    query: UseQueryResult<TData>
    children: (data: TData) => React.ReactNode
    loadingFallback?: React.ReactNode
}

export function QueryResolver<TData>({ query, children, loadingFallback = <DefaultSkeleton /> }: QueryResolverProps<TData>) {
    if (query.isPending) {
        return loadingFallback
    }

    if (query.isError) {
        return (
            <div className="flex flex-col gap-2">
                <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
                <Button variant="outline" size="sm" className="w-fit" onClick={() => query.refetch()}>
                    Retry
                </Button>
            </div>
        )
    }

    return children(query.data)
}
