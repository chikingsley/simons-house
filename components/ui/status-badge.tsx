import type React from "react";
import type { UserStatus } from "../../types";

type StatusBadgeProps = {
  status: UserStatus;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
};

const statusConfig: Record<
  UserStatus,
  { label: string; colors: string; dotColor: string }
> = {
  accepting_guests: {
    label: "Accepting Guests",
    colors: "bg-green-100 text-green-700 border-green-200",
    dotColor: "bg-green-500",
  },
  maybe_accepting_guests: {
    label: "Maybe Accepting",
    colors: "bg-yellow-100 text-yellow-700 border-yellow-200",
    dotColor: "bg-yellow-500",
  },
  not_accepting_guests: {
    label: "Not Accepting",
    colors: "bg-red-100 text-red-700 border-red-200",
    dotColor: "bg-red-500",
  },
  wants_to_meet_up: {
    label: "Wants to Meet Up",
    colors: "bg-blue-100 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
  },
};

export const getStatusColor = (status: UserStatus): string =>
  statusConfig[status]?.colors || "bg-gray-100 text-gray-700";

export const getStatusLabel = (status: UserStatus): string =>
  statusConfig[status]?.label || status;

export const getStatusDotColor = (status: UserStatus): string =>
  statusConfig[status]?.dotColor || "bg-gray-500";

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  showLabel = true,
  className = "",
}) => {
  const config = statusConfig[status];
  if (!config) {
    return null;
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-2 text-sm",
  };

  const dotSizes = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-2.5 w-2.5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.colors} ${sizeClasses[size]} ${className}`}
    >
      <span className={`${dotSizes[size]} rounded-full ${config.dotColor}`} />
      {showLabel && config.label}
    </span>
  );
};

export default StatusBadge;
