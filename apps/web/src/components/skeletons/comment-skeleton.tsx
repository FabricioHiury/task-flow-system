import { Skeleton } from "@/components/ui/skeleton"

export function CommentSkeleton() {
  return (
    <div className="flex space-x-3 p-4 border-b">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

export function CommentListSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 3 }).map((_, i) => (
        <CommentSkeleton key={i} />
      ))}
    </div>
  )
}