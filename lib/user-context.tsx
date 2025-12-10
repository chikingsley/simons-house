import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ProfileExtended, User } from "../types";
import { api } from "./api";

type UserContextType = {
  currentUser: ProfileExtended | null;
  currentUserId: string;
  allUsers: User[];
  isLoading: boolean;
  switchUser: (userId: string) => void;
  refreshCurrentUser: () => Promise<void>;
  updateCurrentUser: (data: Partial<ProfileExtended>) => Promise<void>;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState("me");
  const [currentUser, setCurrentUser] = useState<ProfileExtended | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshCurrentUser = useCallback(async () => {
    try {
      const user = await api.getUser(currentUserId);
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  }, [currentUserId]);

  const loadUsers = useCallback(async () => {
    try {
      const result = await api.getUsers({ limit: 100 }); // Get all users for switcher
      // Add "me" to the list
      const me = await api.getCurrentUser();
      if (me) {
        setAllUsers([me, ...result.users]);
      } else {
        setAllUsers(result.users);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([refreshCurrentUser(), loadUsers()]);
      setIsLoading(false);
    };
    init();
  }, [refreshCurrentUser, loadUsers]);

  const switchUser = useCallback((userId: string) => {
    setCurrentUserId(userId);
  }, []);

  const updateCurrentUser = useCallback(
    async (data: Partial<ProfileExtended>) => {
      if (!currentUser) {
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
        allUsers,
        isLoading,
        switchUser,
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
