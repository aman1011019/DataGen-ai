import { useState, useEffect } from "react";
import { NavLink as RouterNavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  Database,
  LayoutTemplate,
  BarChart3,
  Settings,
  Bot,
  ClipboardCheck,
  LogOut,
  X,
  ShieldCheck
} from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Create Dataset", path: "/dashboard/generate", icon: Sparkles },
  { title: "My Datasets", path: "/dashboard/datasets", icon: Database },
  { title: "Templates", path: "/dashboard/templates", icon: LayoutTemplate },
  { title: "Analytics", path: "/dashboard/analytics", icon: BarChart3 },
  { title: "Agent Monitor", path: "/dashboard/agents", icon: Bot },
  { title: "Validation Report", path: "/dashboard/validation", icon: ClipboardCheck },
  { title: "Settings", path: "/dashboard/settings", icon: Settings },
];

interface DashboardSidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const DashboardSidebar = ({ isMobileOpen, onCloseMobile }: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border w-64 overflow-hidden">
      {/* Brand Header - Fixed Top */}
      <div className="shrink-0 p-5 flex items-center justify-between border-b border-sidebar-border/50">
        <RouterNavLink to="/dashboard" className="flex items-center gap-3 group">
          <Logo className="w-8 h-8 transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-foreground leading-none">DataGen AI</span>
            <span className="text-[10px] text-primary font-semibold mt-0.5">Synthetic Platform</span>
          </div>
        </RouterNavLink>

        {isMobileOpen && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Navigation Items - Scrollable Middle */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
          Workspace Navigation
        </div>
        {navItems.map((item) => {
          const isActive =
            item.path === "/dashboard"
              ? location.pathname === "/dashboard"
              : location.pathname.startsWith(item.path);

          return (
            <RouterNavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`}
            >
              <item.icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
              <span className="truncate">{item.title}</span>
            </RouterNavLink>
          );
        })}
      </nav>

      {/* Bottom Profile Section */}
      <div className="shrink-0 p-3 border-t border-sidebar-border bg-sidebar-accent/50 space-y-2.5 w-full">
        <div className="flex items-center justify-between px-2 text-xs">
          <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-success" /> Standard Quota
          </span>
          <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
            3/wk limit
          </span>
        </div>

        {/* Profile Card pinned at bottom */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-sidebar border border-sidebar-border hover:border-primary/40 transition-colors group">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
              alt={user?.name || "User"}
              className="w-9 h-9 rounded-full object-cover border border-primary/30 shrink-0"
            />
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {user?.name || "Workspace User"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {user?.email || "Signed in"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );


  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block h-screen w-64 shrink-0 sticky top-0 z-30 overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Drawer Slide-over */}
      {isMobileOpen && (
        <div className="fixed inset-y-0 left-0 z-50 lg:hidden animate-in slide-in-from-left duration-200 h-screen w-64">
          {sidebarContent}
        </div>
      )}
    </>
  );
};

export default DashboardSidebar;
