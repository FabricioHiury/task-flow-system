import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TaskHistorySkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          <Skeleton className="h-6 w-48" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-64 mt-2" />
                <div className="mt-3 p-3 bg-muted/30 rounded-md">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-2" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
