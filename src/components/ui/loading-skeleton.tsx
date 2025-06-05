
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

interface CraftsmanCardSkeletonProps {
  count?: number;
}

function CraftsmanCardSkeleton({ count = 6 }: CraftsmanCardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-enhanced overflow-hidden">
          <Skeleton className="h-64 w-full" />
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-16 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export { Skeleton, CraftsmanCardSkeleton }
