import {
  Calendar,
  CheckCircle,
  MapPin,
  User as UserIcon,
  Zap,
} from "lucide-react";
import type React from "react";
import { Link } from "react-router-dom";
import type { User } from "../../types";
import { StatusBadge } from "./status-badge";

type UserIdentityCardProps = {
  user: User;
  variant:
    | "profile-sidebar"
    | "dashboard-grid"
    | "dashboard-list"
    | "inbox-sidebar";
  onClick?: () => void;
  linkTo?: string;
  isBlocked?: boolean;
  showStats?: boolean;
  className?: string;
};

// Stats display component - reused across variants
const StatsDisplay: React.FC<{
  referencesCount: number;
  friendsCount: number;
  layout: "horizontal" | "vertical" | "grid";
  size?: "sm" | "md" | "lg";
}> = ({ referencesCount, friendsCount, layout, size = "md" }) => {
  if (layout === "grid") {
    return (
      <div className="grid grid-cols-2 divide-x divide-gray-100 border-gray-100 border-t dark:divide-gray-700 dark:border-gray-700">
        <div className="cursor-pointer p-4 text-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
          <div className="font-bold text-2xl text-gray-900 dark:text-gray-100">
            {referencesCount}
          </div>
          <div className="font-bold text-gray-400 text-xs uppercase tracking-wider dark:text-gray-500">
            References
          </div>
        </div>
        <div className="cursor-pointer p-4 text-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
          <div className="font-bold text-2xl text-gray-900 dark:text-gray-100">
            {friendsCount}
          </div>
          <div className="font-bold text-gray-400 text-xs uppercase tracking-wider dark:text-gray-500">
            Friends
          </div>
        </div>
      </div>
    );
  }

  if (layout === "horizontal") {
    return (
      <div className="flex justify-center gap-6">
        <div className="text-center">
          <span className="block font-bold text-gray-900 text-lg dark:text-gray-100">
            {referencesCount}
          </span>
          <span className="font-bold text-[10px] text-gray-400 uppercase tracking-wider dark:text-gray-500">
            References
          </span>
        </div>
        <div className="text-center">
          <span className="block font-bold text-gray-900 text-lg dark:text-gray-100">
            {friendsCount}
          </span>
          <span className="font-bold text-[10px] text-gray-400 uppercase tracking-wider dark:text-gray-500">
            Friends
          </span>
        </div>
      </div>
    );
  }

  // vertical layout
  const sizeClasses = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  return (
    <div
      className={`flex items-center gap-3 text-gray-500 dark:text-gray-400 ${sizeClasses[size]}`}
    >
      <span className="font-semibold text-gray-700 dark:text-gray-300">
        {referencesCount} Refs
      </span>
      <span>{friendsCount} Friends</span>
    </div>
  );
};

// Dashboard Grid Card variant
const DashboardGridCard: React.FC<{
  user: User;
  onClick?: () => void;
}> = ({ user, onClick }) => (
  <button
    className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    onClick={onClick}
    type="button"
  >
    <div className="relative h-32">
      <img
        alt={user.name}
        className="h-full w-full object-cover"
        height={128}
        loading="lazy"
        src={user.avatarUrl}
        width={200}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-2 left-3 text-white">
        <h3 className="font-bold text-sm shadow-black drop-shadow-md">
          {user.name}
        </h3>
        <p className="flex items-center gap-1 text-[10px] opacity-90">
          <MapPin size={10} /> {user.location}
        </p>
      </div>
      <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
        {user.verification.payment && (
          <div className="rounded-full bg-white p-0.5 dark:bg-gray-800">
            <CheckCircle className="text-green-600" size={12} />
          </div>
        )}
      </div>
    </div>

    <div className="flex flex-1 flex-col justify-between p-3">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <StatusBadge size="sm" status={user.status} />
          <span className="text-[9px] text-gray-400 dark:text-gray-500">
            {user.responseTime}
          </span>
        </div>
        <p className="line-clamp-2 text-[11px] text-gray-600 leading-relaxed dark:text-gray-400">
          I'm a {user.occupation} who speaks {user.languages[0]}.
        </p>
      </div>
      <div className="mt-3 border-gray-50 border-t pt-2 dark:border-gray-700">
        <StatsDisplay
          friendsCount={user.friendsCount}
          layout="vertical"
          referencesCount={user.referencesCount}
          size="sm"
        />
      </div>
    </div>
  </button>
);

// Dashboard List Card variant
const DashboardListCard: React.FC<{
  user: User;
  onClick?: () => void;
}> = ({ user, onClick }) => {
  return (
    <button
      className="group flex h-24 w-full cursor-pointer items-center gap-4 overflow-hidden rounded-lg border border-gray-200 bg-white px-4 text-left shadow-sm transition-all hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
      onClick={onClick}
      type="button"
    >
      {/* Avatar */}
      <img
        alt={user.name}
        className="h-16 w-16 shrink-0 rounded-full border border-gray-200 object-cover dark:border-gray-600"
        height={64}
        loading="lazy"
        src={user.avatarUrl}
        width={64}
      />

      {/* Main Info */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <h3 className="truncate font-bold text-gray-900 text-sm dark:text-gray-100">
            {user.name}
          </h3>
          {user.verification.payment && (
            <CheckCircle className="text-green-500" size={14} />
          )}
        </div>
        <p className="mb-1 flex items-center gap-1 text-gray-500 text-xs dark:text-gray-400">
          <MapPin size={12} /> {user.location}
        </p>
        <div className="flex items-center gap-2">
          <StatusBadge size="sm" status={user.status} />
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            • {user.responseTime}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden w-32 shrink-0 flex-col items-end gap-1 text-gray-500 text-xs md:flex dark:text-gray-400">
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          {user.referencesCount} References
        </span>
        <span>{user.friendsCount} Friends</span>
        <span className="text-gray-400 italic dark:text-gray-500">
          Active {user.lastLogin}
        </span>
      </div>
    </button>
  );
};

// Inbox Sidebar Card variant
const InboxSidebarCard: React.FC<{
  user: User;
  linkTo?: string;
  isBlocked?: boolean;
}> = ({ user, linkTo, isBlocked = false }) => {
  const avatarContent = (
    <div className="relative mx-auto mb-3 block h-24 w-24">
      <img
        alt={user.name}
        className={`h-full w-full rounded-full border-4 border-white object-cover shadow-md transition-opacity hover:opacity-80 dark:border-gray-700 ${isBlocked ? "grayscale" : ""}`}
        loading="lazy"
        src={user.avatarUrl}
      />
      <div
        className={`absolute right-1 bottom-1 h-5 w-5 rounded-full border-2 border-white dark:border-gray-800 ${user.status.includes("not") ? "bg-red-400" : "bg-green-400"}`}
      />
    </div>
  );

  const nameContent = (
    <span className="font-bold text-gray-900 text-xl hover:text-orange-600 hover:underline dark:text-gray-100">
      {user.name}
    </span>
  );

  return (
    <div className="relative border-gray-100 border-b p-6 text-center dark:border-gray-700">
      {linkTo ? (
        <Link className="relative mx-auto mb-3 block h-24 w-24" to={linkTo}>
          {avatarContent}
        </Link>
      ) : (
        avatarContent
      )}

      {linkTo ? <Link to={linkTo}>{nameContent}</Link> : nameContent}

      <p className="mt-1 flex items-center justify-center gap-1 font-medium text-gray-500 text-sm dark:text-gray-400">
        <MapPin size={14} /> {user.location}
      </p>

      <div className="mt-6">
        <StatsDisplay
          friendsCount={user.friendsCount}
          layout="horizontal"
          referencesCount={user.referencesCount}
        />
      </div>
    </div>
  );
};

// Quick Info List for inbox sidebar
export const QuickInfoList: React.FC<{
  user: User;
  className?: string;
}> = ({ user, className = "" }) => (
  <div className={className}>
    <h4 className="mb-3 font-bold text-gray-400 text-xs uppercase tracking-wider dark:text-gray-500">
      Quick Info
    </h4>
    <ul className="space-y-3 text-gray-600 text-sm dark:text-gray-400">
      <li className="flex gap-2">
        <Calendar
          className="shrink-0 text-gray-400 dark:text-gray-500"
          size={16}
        />
        <span>Joined {user.joinedDate}</span>
      </li>
      <li className="flex gap-2">
        <Zap className="shrink-0 text-gray-400 dark:text-gray-500" size={16} />
        <span>{user.responseTime}</span>
      </li>
      <li className="flex gap-2">
        <UserIcon
          className="shrink-0 text-gray-400 dark:text-gray-500"
          size={16}
        />
        <span>{user.occupation}</span>
      </li>
    </ul>
  </div>
);

// Main export component that handles variant switching
export const UserIdentityCard: React.FC<UserIdentityCardProps> = ({
  user,
  variant,
  onClick,
  linkTo,
  isBlocked = false,
  className = "",
}) => {
  switch (variant) {
    case "dashboard-grid":
      return (
        <div className={className}>
          <DashboardGridCard onClick={onClick} user={user} />
        </div>
      );
    case "dashboard-list":
      return (
        <div className={className}>
          <DashboardListCard onClick={onClick} user={user} />
        </div>
      );
    case "inbox-sidebar":
      return (
        <div className={className}>
          <InboxSidebarCard isBlocked={isBlocked} linkTo={linkTo} user={user} />
        </div>
      );
    default:
      return null;
  }
};

// Also export the stats component for standalone use
export { StatsDisplay };

export default UserIdentityCard;
