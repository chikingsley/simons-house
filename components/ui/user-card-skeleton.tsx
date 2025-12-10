import type React from "react";
import { Skeleton } from "./skeleton";

type UserCardSkeletonProps = {
  variant?: "dashboard-grid" | "dashboard-list";
};

export const UserCardSkeleton: React.FC<UserCardSkeletonProps> = ({
  variant = "dashboard-grid",
}) => {
  if (variant === "dashboard-list") {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    );
  }

  // Grid variant
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
};

export const UserCardSkeletonGrid: React.FC<{ count?: number }> = ({
  count = 8,
}) => (
  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <UserCardSkeleton key={`skeleton-${i}`} variant="dashboard-grid" />
    ))}
  </div>
);

export const UserCardSkeletonList: React.FC<{ count?: number }> = ({
  count = 6,
}) => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: count }).map((_, i) => (
      <UserCardSkeleton key={`skeleton-${i}`} variant="dashboard-list" />
    ))}
  </div>
);
