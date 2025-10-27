import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function NotificationSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function NotificationListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <NotificationSkeleton key={i} />
      ))}
    </div>
  )
}