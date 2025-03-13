
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const CardSkeleton = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-2/5" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-12 w-full mb-2" />
        <Skeleton className="h-4 w-3/5" />
      </CardContent>
    </Card>
  );
};

export const ServiceCardSkeleton = () => {
  return (
    <div className="service-card">
      <Skeleton className="mb-4 h-40 w-full rounded-md" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-4" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
};

export const BarberCardSkeleton = () => {
  return (
    <div className="barber-card">
      <div className="flex items-center">
        <Skeleton className="w-16 h-16 rounded-full mr-4" />
        <div className="w-full">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-1" />
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-3 w-3 rounded-full" />
            ))}
            <Skeleton className="h-3 w-8 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const DataCardSkeleton = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-4 w-4/5" />
      </CardContent>
    </Card>
  );
};

export const TableRowSkeleton = ({ columns = 5 }: { columns?: number }) => {
  return (
    <tr>
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="px-3 py-3">
          <Skeleton className="h-5 w-full" />
        </td>
      ))}
    </tr>
  );
};
