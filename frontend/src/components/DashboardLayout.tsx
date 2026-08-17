import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { motion } from "framer-motion";
import { getStoredAuthState } from "../services/authService";
import { supabase } from "../services/supabase";
import { Loader2 } from "lucide-react";

export const DashboardLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [authState, setAuthState] = useState(getStoredAuthState());
  const [isAuthenticating, setIsAuthenticating] = useState(() => {
    if (typeof window === "undefined") return false;
    const hasOAuthHash =
      window.location.hash.includes("access_token=") ||
      window.location.hash.includes("refresh_token=");
    const hasOAuthCode = window.location.search.includes("code=");
    return hasOAuthHash || hasOAuthCode;
  });

  useEffect(() => {
    const handleAuthChanged = () => {
      const updated = getStoredAuthState();
      setAuthState(updated);
      if (updated.isAuthenticated) {
        setIsAuthenticating(false);
      }
    };

    window.addEventListener("datagen_auth_changed", handleAuthChanged);

    // Verify session directly from Supabase for OAuth callbacks
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleAuthChanged();
      }
      // Give a tiny buffer for onAuthStateChange to complete processing if hash present
      setTimeout(() => {
        setIsAuthenticating(false);
      }, 500);
    });

    return () => {
      window.removeEventListener("datagen_auth_changed", handleAuthChanged);
    };
  }, []);

  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-[#081021] text-white flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-300">Authenticating with Google...</p>
      </div>
    );
  }

  // Redirect unauthenticated users to login
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* 100% Fixed Sidebar (Pinned Bottom Profile Card) */}
      <DashboardSidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Fixed Top Header */}
        <DashboardHeader
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Independently Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
