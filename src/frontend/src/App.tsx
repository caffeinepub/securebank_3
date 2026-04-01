import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { Layout } from "./components/Layout";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useUserProfile } from "./hooks/useQueries";
import { AccountsPage } from "./pages/AccountsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { HistoryPage } from "./pages/HistoryPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProfileSetupPage } from "./pages/ProfileSetupPage";
import { TransferPage } from "./pages/TransferPage";

type Page = "dashboard" | "accounts" | "transfer" | "history" | "profile";

function AppContent() {
  const { identity, isInitializing, clear } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  if (
    isInitializing ||
    (isAuthenticated && (actorFetching || profileLoading))
  ) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-gold border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm">Loading your account...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (!profile) {
    return <ProfileSetupPage />;
  }

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      userName={profile.fullName}
      onLogout={clear}
    >
      {currentPage === "dashboard" && (
        <DashboardPage
          profile={profile}
          onNavigate={(p) => setCurrentPage(p as Page)}
        />
      )}
      {currentPage === "accounts" && <AccountsPage />}
      {currentPage === "transfer" && (
        <TransferPage onSuccess={() => setCurrentPage("dashboard")} />
      )}
      {currentPage === "history" && <HistoryPage />}
      {currentPage === "profile" && <ProfilePage />}
    </Layout>
  );
}

export default function App() {
  return (
    <>
      <AppContent />
      <Toaster richColors position="top-right" />
    </>
  );
}
