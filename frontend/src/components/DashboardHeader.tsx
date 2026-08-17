import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, Sparkles, User, Settings, LogOut, Menu, Shield, Sun, Moon, CheckCheck, Trash2, Database, Download, Cpu, Info } from "lucide-react";
import { getStoredAuthState, logoutUser } from "../services/authService";
import { useTheme } from "../context/ThemeContext";
import {
  getUserNotifications,
  subscribeNotifications,
  markAllNotificationsRead,
  clearAllNotifications,
  RealtimeNotification
} from "../services/notificationService";
import Logo from "./Logo";

interface DashboardHeaderProps {
  onToggleMobileSidebar?: () => void;
}

export const DashboardHeader = ({ onToggleMobileSidebar }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const authState = getStoredAuthState();
  const user = authState.user;
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeNotifications((items) => {
      setNotifications(items);
    });
    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpenNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      markAllNotificationsRead();
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const formatTimeAgo = (isoString: string): string => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getNotifIcon = (type: RealtimeNotification["type"]) => {
    switch (type) {
      case "dataset":
        return <Database className="w-3.5 h-3.5 text-primary" />;
      case "export":
        return <Download className="w-3.5 h-3.5 text-success" />;
      case "ai":
        return <Cpu className="w-3.5 h-3.5 text-accent" />;
      default:
        return <Info className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 backdrop-blur-md px-4 sm:px-6 shrink-0">
      {/* Left side: Mobile menu toggle & Brand + Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
          <Logo className="w-6 h-6 lg:hidden" />
        </button>

        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search datasets, schemas, fields, templates..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-secondary/60 border border-border/80 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Right side: Quick Action CTA + Theme Toggle + Realtime Notifications + User Avatar */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/generate"
          className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Dataset</span>
        </Link>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-primary" />}
        </button>

        {/* Real-time Notifications Center Button */}
        <div className="relative">
          <button
            onClick={handleOpenNotifications}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary relative transition-colors"
            title="Real-time Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-card border border-border shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <span className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                    Real-time Activity
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={() => clearAllNotifications()}
                      className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1 font-medium"
                      title="Clear All"
                    >
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  )}
                  <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
                    {unreadCount > 0 ? `${unreadCount} New` : "Live"}
                  </span>
                </div>
              </div>

              {/* Notification List Stream */}
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    <p>No activity notifications yet.</p>
                    <p className="text-[10px] mt-1">Actions like generating or exporting datasets appear here in real-time.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        !n.read
                          ? "bg-primary/5 border-primary/30"
                          : "bg-secondary/40 border-border/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          {getNotifIcon(n.type)}
                          <span>{n.title}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {formatTimeAgo(n.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Card Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl hover:bg-secondary border border-transparent hover:border-border transition-all group"
          >
            <img
              src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
              alt={user?.name || "User"}
              className="w-8 h-8 rounded-full object-cover border border-primary/30"
            />
            <div className="hidden md:flex flex-col text-left truncate">
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                {user?.name || "Google user"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">{user?.email || "Not signed in"}</span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-card border border-border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2.5 border-b border-border mb-1 flex items-center gap-3">
                <img
                  src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                  alt={user?.name || "User"}
                  className="w-9 h-9 rounded-full object-cover border border-primary/30 shrink-0"
                />
                <div className="flex flex-col truncate">
                  <p className="text-xs font-bold text-foreground truncate">{user?.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 mt-1 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit">
                    <Shield className="w-2.5 h-2.5" /> {user?.plan || "Pro Plan"}
                  </span>
                </div>
              </div>

              <Link
                to="/dashboard/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <User className="w-3.5 h-3.5" /> Profile Settings
              </Link>
              <Link
                to="/dashboard/settings"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Settings className="w-3.5 h-3.5" /> AI Providers & Keys
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
