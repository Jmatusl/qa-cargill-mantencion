// SkeletonForm.tsx
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";

export default function SkeletonForm() {
  return (
    <Card className="w-full max-w-7xl mx-auto p-6">
      <CardTitle className="text-2xl font-bold mb-4">Editar Equipo</CardTitle>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="flex items-center space-x-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-4 mt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </CardFooter>
    </Card>
  );
}
