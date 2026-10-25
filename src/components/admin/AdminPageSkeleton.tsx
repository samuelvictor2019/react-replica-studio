import { Skeleton } from '@/components/ui/skeleton';

type AdminPageSkeletonProps = {
  label: string;
  variant?: 'table' | 'cards' | 'analytics' | 'settings';
  count?: number;
  columns?: number;
};

const AdminPageSkeleton = ({
  label,
  variant = 'table',
  count = 5,
  columns = 5,
}: AdminPageSkeletonProps) => {
  const rows = Array.from({ length: count });
  const cells = Array.from({ length: columns });

  return (
    <div role="status" aria-label={`Loading ${label}`} aria-busy="true" className="space-y-4">
      <span className="sr-only">Loading {label}</span>
      <div className="space-y-2 pb-2" aria-hidden="true">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      {variant === 'table' && (
        <div className="space-y-3" aria-hidden="true">
          {rows.map((_, rowIndex) => (
            <div key={rowIndex} className="grid gap-4 border-b pb-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {cells.map((__, cellIndex) => (
                <Skeleton key={cellIndex} className={`h-4 ${cellIndex % 3 === 0 ? 'w-4/5' : 'w-full'}`} />
              ))}
            </div>
          ))}
        </div>
      )}
      {variant === 'cards' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {rows.map((_, index) => (
            <div key={index} className="space-y-4 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      )}
      {variant === 'analytics' && (
        <div className="space-y-4" aria-hidden="true">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-3 rounded-md border p-4">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-64 w-full rounded-md" />
            <Skeleton className="h-64 w-full rounded-md" />
          </div>
        </div>
      )}
      {variant === 'settings' && (
        <div className="space-y-4" aria-hidden="true">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-3 rounded-md border p-4">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-7 w-1/2" />
              </div>
            ))}
          </div>
          <div className="space-y-5 rounded-md border p-6">
            <Skeleton className="h-5 w-48" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPageSkeleton;