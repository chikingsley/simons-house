import { ArrowUpDown, Grid, List, Loader2, Search, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { User } from "../types";
import {
  UserCardSkeletonGrid,
  UserCardSkeletonList,
} from "./ui/user-card-skeleton";
import { UserIdentityCard } from "./ui/user-identity-card";

type DashboardProps = {
  onViewProfile: (userId: string) => void;
};

const USERS_PER_PAGE = 12;

const DashboardView: React.FC<DashboardProps> = ({ onViewProfile }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<"travelers" | "hosts">("hosts");
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");
  const [location, setLocation] = useState("West Virginia, USA");

  // Filters State
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<"lastLogin" | "references" | "name">(
    "lastLogin"
  );

  // Load users from API
  const loadUsers = useCallback(async (offset = 0, append = false) => {
    if (offset === 0) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    try {
      const result = await api.getUsers({ limit: USERS_PER_PAGE, offset });
      if (append) {
        setUsers((prev) => [...prev, ...result.users]);
      } else {
        setUsers(result.users);
      }
      setHasMore(result.hasMore);
      setTotal(result.total);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadUsers(users.length, true);
    }
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const displayedUsers = useMemo(() => {
    let filtered = [...users];

    // 1. Filter by View Mode (Host vs Traveler)
    if (viewMode === "hosts") {
      filtered = filtered.filter((u) =>
        ["accepting_guests", "maybe_accepting_guests"].includes(u.status)
      );
    } else {
      filtered = filtered.filter((u) =>
        ["wants_to_meet_up", "not_accepting_guests"].includes(u.status)
      );
    }

    // 2. Apply Custom Filters
    if (activeFilters.includes("Verified")) {
      filtered = filtered.filter(
        (u) => u.verification.payment || u.verification.governmentId
      );
    }
    if (activeFilters.includes("With References")) {
      filtered = filtered.filter((u) => u.referencesCount > 0);
    }
    if (activeFilters.includes("Accepting Guests")) {
      filtered = filtered.filter((u) => u.status === "accepting_guests");
    }

    // 3. Sorting
    return filtered.sort((a, b) => {
      if (sortMode === "references") {
        return b.referencesCount - a.referencesCount;
      }
      if (sortMode === "name") {
        return a.name.localeCompare(b.name);
      }
      // Default: Last Login (mock logic)
      return 0;
    });
  }, [users, viewMode, activeFilters, sortMode]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12">
      {/* Attached Search Header */}
      <div className="-mt-1 sticky top-16 z-40 mx-auto mb-6 max-w-7xl rounded-b-xl border-gray-200 border-x border-b bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-center gap-3 md:flex-row">
            {/* Toggle Switch */}
            <div className="flex w-full shrink-0 rounded-lg bg-gray-100 p-1 md:w-auto dark:bg-gray-700">
              <button
                className={`flex-1 rounded-md px-4 py-1.5 font-bold text-xs transition-all md:flex-none ${viewMode === "hosts" ? "bg-white text-orange-600 shadow-sm dark:bg-gray-600" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
                onClick={() => setViewMode("hosts")}
                type="button"
              >
                Find Hosts
              </button>
              <button
                className={`flex-1 rounded-md px-4 py-1.5 font-bold text-xs transition-all md:flex-none ${viewMode === "travelers" ? "bg-white text-orange-600 shadow-sm dark:bg-gray-600" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`}
                onClick={() => setViewMode("travelers")}
                type="button"
              >
                Find Travelers
              </button>
            </div>

            {/* Main Search Bar */}
            <div className="relative flex w-full flex-1 items-center rounded-lg border border-gray-200 bg-gray-50 transition-colors focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:focus-within:ring-orange-500/20">
              <Search className="ml-3 shrink-0 text-gray-400" size={16} />
              <input
                className="w-full bg-transparent px-3 py-2 font-medium text-gray-800 text-sm placeholder-gray-400 outline-none dark:text-gray-200 dark:placeholder-gray-500"
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where do you want to go?"
                type="text"
                value={location}
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 font-bold text-gray-400 text-xs uppercase dark:text-gray-500">
                Filter:
              </span>

              {["Verified", "With References", "Accepting Guests"].map(
                (filter) => (
                  <button
                    className={`flex items-center gap-1 rounded-full border px-3 py-1 font-bold text-xs transition-colors ${
                      activeFilters.includes(filter)
                        ? "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/20 dark:text-orange-400"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:border-gray-500"
                    }`}
                    key={filter}
                    onClick={() => toggleFilter(filter)}
                    type="button"
                  >
                    {filter}
                    {activeFilters.includes(filter) && <X size={12} />}
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Sort Dropdown (Simulated) */}
              <div className="flex items-center gap-2 text-gray-500 text-xs dark:text-gray-400">
                <ArrowUpDown size={14} />
                <select
                  className="cursor-pointer bg-transparent font-medium text-gray-700 outline-none dark:text-gray-300"
                  onChange={(e) =>
                    setSortMode(
                      e.target.value as "lastLogin" | "references" | "name"
                    )
                  }
                  value={sortMode}
                >
                  <option value="lastLogin">Last Login</option>
                  <option value="references">References</option>
                  <option value="name">Name</option>
                </select>
              </div>

              {/* Layout Toggle */}
              <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-700">
                <button
                  className={`rounded p-1.5 ${layoutMode === "grid" ? "bg-white text-gray-800 shadow-sm dark:bg-gray-600 dark:text-gray-200" : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"}`}
                  onClick={() => setLayoutMode("grid")}
                  type="button"
                >
                  <Grid size={16} />
                </button>
                <button
                  className={`rounded p-1.5 ${layoutMode === "list" ? "bg-white text-gray-800 shadow-sm dark:bg-gray-600 dark:text-gray-200" : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"}`}
                  onClick={() => setLayoutMode("list")}
                  type="button"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <div className="mb-4 text-gray-500 text-sm dark:text-gray-400">
          Showing {displayedUsers.length} of {total} users
        </div>
      )}

      {/* Skeleton loading state */}
      {isLoading ? (
        layoutMode === "grid" ? (
          <UserCardSkeletonGrid count={8} />
        ) : (
          <UserCardSkeletonList count={6} />
        )
      ) : (
        <>
          {/* Results grid/list */}
          <div
            className={
              layoutMode === "grid"
                ? "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
                : "flex flex-col gap-2"
            }
          >
            {displayedUsers.map((user) => (
              <UserIdentityCard
                key={user.id}
                onClick={() => onViewProfile(user.id)}
                user={user}
                variant={
                  layoutMode === "grid" ? "dashboard-grid" : "dashboard-list"
                }
              />
            ))}
          </div>

          {displayedUsers.length > 0 && hasMore ? (
            <div className="mt-8 text-center">
              <button
                className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-8 py-2 font-medium text-gray-700 text-sm shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                disabled={isLoadingMore}
                onClick={handleLoadMore}
                type="button"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Loading...
                  </>
                ) : (
                  "Load More Results"
                )}
              </button>
            </div>
          ) : displayedUsers.length === 0 ? (
            <div className="mt-12 text-center text-gray-400 dark:text-gray-500">
              <p>No results found for your filters.</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default DashboardView;
