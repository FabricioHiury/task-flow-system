import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <DashboardCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function DashboardChartSkeleton() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="pl-2">
        <Skeleton className="h-[350px] w-full" />
      </CardContent>
    </Card>
  )
}

export function DashboardRecentTasksSkeleton() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="ml-4 space-y-1 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}