import { useQuery } from "convex/react";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ProfileExtended } from "../types";
import { api } from "./api";
import { convexApi } from "./convex-api";

type UserContextType = {
  currentUser: ProfileExtended | null;
  currentUserId: string;
  isLoading: boolean;
  refreshCurrentUser: () => Promise<void>;
  updateCurrentUser: (data: Partial<ProfileExtended>) => Promise<void>;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const viewer = useQuery(convexApi.users.getCurrentUser, {}) as
    | ProfileExtended
    | null
    | undefined;
  const [currentUser, setCurrentUser] = useState<ProfileExtended | null>(null);

  const currentUserId = currentUser?.id ?? "";
  const isLoading = viewer === undefined;

  // Keep local currentUser in sync for optimistic UI updates (e.g. settings edits).
  useEffect(() => {
    if (viewer) {
      setCurrentUser(viewer);
    }
  }, [viewer]);

  const refreshCurrentUser = useCallback((): Promise<void> => {
    // No-op: Convex subscriptions keep this current.
    return Promise.resolve();
  }, []);

  const updateCurrentUser = useCallback(
    async (data: Partial<ProfileExtended>) => {
      if (!(currentUser && currentUserId)) {
        return;
      }
      try {
        const updated = await api.updateUser(currentUserId, data);
        if (updated) {
          setCurrentUser(updated);
        }
      } catch (error) {
        console.error("Failed to update user:", error);
      }
    },
    [currentUserId, currentUser]
  );

  return (
    <UserContext.Provider
      value={{
        currentUser,
        currentUserId,
        isLoading,
        refreshCurrentUser,
        updateCurrentUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
