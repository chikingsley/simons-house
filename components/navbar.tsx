import { SignedIn, UserButton } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import {
  LayoutDashboard,
  Mail,
  Settings as SettingsIcon,
  User,
} from "lucide-react";
import type React from "react";
import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { convexApi } from "../lib/convex-api";
import { useUser } from "../lib/user-context";
import { ThemeToggle } from "./theme-toggle";

const Navbar: React.FC = () => {
  const location = useLocation();
  const { currentUserId } = useUser();
  const conversations = useQuery(
    convexApi.conversations.getConversations,
    {}
  ) as { messages: { senderId: string; isRead: boolean }[] }[] | undefined;
  const unreadCount = useMemo(() => {
    if (!conversations) {
      return 0;
    }
    return conversations.reduce((acc, conv) => {
      const unread = conv.messages.filter(
        (m) => m.senderId !== currentUserId && !m.isRead
      ).length;
      return acc + unread;
    }, 0);
  }, [conversations, currentUserId]);

  const navItemClass = (path: string | string[]) => {
    const paths = Array.isArray(path) ? path : [path];
    const isActive = paths.some(
      (p) => location.pathname === p || location.pathname.startsWith(`${p}/`)
    );
    return `flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors ${
      isActive
        ? "text-orange-600 border-b-2 border-orange-600"
        : "text-gray-600 hover:text-orange-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-orange-400 dark:hover:bg-gray-800"
    }`;
  };

  return (
    <nav className="sticky top-0 z-50 h-16 border-gray-200 border-b bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        {/* Left: Logo */}
        <div className="flex flex-1 items-center gap-6">
          <Link to="/">
            {/* Logo Imitation */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 p-1.5 font-bold font-serif text-white text-xl italic shadow-sm transition-colors hover:bg-orange-600">
              SH
            </div>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex h-full items-center gap-2">
          <Link className={navItemClass(["/", "/dashboard", "/search"])} to="/">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          <Link className={navItemClass("/inbox")} to="/inbox">
            <div className="relative">
              <Mail size={20} />
              {unreadCount > 0 && (
                <span className="-top-1 -right-1 absolute flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span>Inbox</span>
          </Link>
          <Link className={navItemClass("/profile")} to="/profile">
            <User size={20} />
            <span>Profile</span>
          </Link>
          <Link className={navItemClass("/settings")} to="/settings">
            <SettingsIcon size={20} />
            <span>Settings</span>
          </Link>

          {/* Theme Toggle */}
          <div className="ml-2 border-gray-200 border-l pl-4 dark:border-gray-700">
            <ThemeToggle />
          </div>

          <SignedIn>
            <div className="ml-2 border-gray-200 border-l pl-4 dark:border-gray-700">
              <UserButton />
            </div>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
