import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonTable() {
  return (
    <div>
      {/* Filtros */}
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-8 w-1/4 rounded-md" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>

      {/* Tabla Skeleton */}
      <div className="rounded-md border border-gray-300 dark:border-gray-700 overflow-auto">
        <table className="min-w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
          <thead>
            <tr>
              {[...Array(10)].map((_, index) => (
                <th
                  key={index}
                  className="border-b border-gray-300 dark:border-gray-700 p-2"
                >
                  <Skeleton className="h-4 w-full" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                {[...Array(10)].map((_, cellIndex) => (
                  <td key={cellIndex} className="p-2">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer de la tabla */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-36 rounded-md" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
    </div>
  );
}
