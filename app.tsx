import type React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import DashboardView from "./components/dashboard";
import InboxView from "./components/inbox-view";
import Navbar from "./components/navbar";
import ProfileView from "./components/profile-view";
import SettingsView from "./components/settings-view";
import { UserSwitcher } from "./components/user-switcher";
import { api } from "./lib/api";
import { UserProvider, useUser } from "./lib/user-context";
import type { Conversation, User } from "./types";

// Layout component with navbar and footer
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isInbox = location.pathname.startsWith("/inbox");

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* User Switcher - Testing Mode */}
      <div className="fixed top-20 right-4 z-50">
        <UserSwitcher />
      </div>

      <Navbar />

      {/* Main content */}
      <div>{children}</div>

      {/* Footer - Hide on inbox view */}
      {!isInbox && (
        <footer className="mt-20 border-border border-t bg-card py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-wrap gap-8 font-bold text-muted-foreground text-sm uppercase tracking-wider">
              <button className="hover:text-primary" type="button">
                About
              </button>
              <button className="hover:text-primary" type="button">
                Safety
              </button>
            </div>
            <div className="mt-8 text-muted-foreground text-xs">
              © 1999 - {new Date().getFullYear()} Couchsurfing International,
              Inc.
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

// Profile page wrapper
function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { currentUserId } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const convs = await api.getConversations(currentUserId);
        setConversations(convs);
      } catch (error) {
        console.error("Failed to load conversations:", error);
      }
    };
    loadConversations();
  }, [currentUserId]);

  const handleRequestSend = async (type: "host" | "meetup", user: User) => {
    const existing = conversations.find((c) => c.otherUser.id === user.id);
    if (existing) {
      navigate("/inbox");
      return;
    }

    try {
      const message = `Hi ${user.name}, I would love to ${type === "host" ? "stay with you" : "meet up with you"}!`;
      await api.createConversation(currentUserId, user.id, type, message);
      navigate("/inbox");
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  // If username is provided, view that user's profile, otherwise view current user
  const viewingProfileId = username || null;

  return (
    <ProfileView
      onRequestSend={handleRequestSend}
      viewingProfileId={viewingProfileId}
    />
  );
}

// Inbox page wrapper
function InboxPage() {
  const { currentUserId } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const loadConversations = useCallback(async () => {
    try {
      const convs = await api.getConversations(currentUserId);
      setConversations(convs);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  }, [currentUserId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <InboxView
      conversations={conversations}
      setConversations={setConversations}
    />
  );
}

// Dashboard page wrapper
function DashboardPage() {
  const navigate = useNavigate();

  const handleViewProfile = (userId: string) => {
    navigate(`/people/${userId}`);
  };

  return <DashboardView onViewProfile={handleViewProfile} />;
}

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route element={<DashboardPage />} path="/" />
        <Route element={<DashboardPage />} path="/dashboard" />
        <Route element={<DashboardPage />} path="/search" />
        <Route element={<ProfilePage />} path="/profile" />
        <Route element={<ProfilePage />} path="/people/:username" />
        <Route element={<InboxPage />} path="/inbox" />
        <Route element={<InboxPage />} path="/inbox/:conversationId" />
        <Route element={<SettingsView />} path="/settings" />
        <Route element={<Navigate replace to="/" />} path="*" />
      </Routes>
    </Layout>
  );
}

const App: React.FC = () => (
  <BrowserRouter>
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  </BrowserRouter>
);

export default App;
