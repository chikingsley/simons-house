import {
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  SignIn,
  SignUp,
} from "@clerk/clerk-react";
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
import { Toaster } from "sonner";
import DashboardView from "./components/dashboard";
import { AppErrorBoundary } from "./components/error-boundary";
import InboxView from "./components/inbox-view";
import Navbar from "./components/navbar";
import ProfileView from "./components/profile-view";
import SettingsView from "./components/settings-view";
import { ThemeProvider } from "./components/theme-provider";
import { api } from "./lib/api";
import { UserProvider, useUser } from "./lib/user-context";
import type { Conversation, User } from "./types";

// Layout component with navbar and footer
function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isInbox = location.pathname.startsWith("/inbox");

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
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
              © {new Date().getFullYear()} Simon&apos;s House
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
  <AppErrorBoundary>
    <ThemeProvider>
      <BrowserRouter>
        <SignedIn>
          <UserProvider>
            <AppRoutes />
            <Toaster position="top-right" richColors />
          </UserProvider>
        </SignedIn>
        <SignedOut>
          <Routes>
            <Route
              element={<SignIn path="/sign-in" routing="path" />}
              path="/sign-in/*"
            />
            <Route
              element={<SignUp path="/sign-up" routing="path" />}
              path="/sign-up/*"
            />
            <Route element={<RedirectToSignIn />} path="*" />
          </Routes>
        </SignedOut>
      </BrowserRouter>
    </ThemeProvider>
  </AppErrorBoundary>
);

export default App;
