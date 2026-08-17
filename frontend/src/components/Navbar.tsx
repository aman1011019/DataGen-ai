import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, ShieldCheck, User, LogOut } from "lucide-react";
import Logo from "@/components/Logo";
import { getStoredAuthState, logoutUser } from "@/services/authService";

export const Navbar = () => {
  const authState = getStoredAuthState();
  const user = authState.user;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Name */}
        <Link to="/" className="flex items-center gap-3 group">
          <Logo className="w-8 h-8 transition-transform group-hover:scale-105" />
          <span className="text-xl font-extrabold text-foreground tracking-tight">DataGen AI</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="w-3 h-3" /> Enterprise
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
          <a href="#categories" className="hover:text-foreground transition-colors">Categories</a>
          <Link to="/dashboard/templates" className="hover:text-foreground transition-colors">Templates</Link>
        </nav>

        {/* Right Section: User Profile & Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Active Profile Card */}
              <Link
                to="/dashboard"
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-secondary/80 border border-border hover:border-primary/40 transition-all group"
              >
                <img
                  src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-primary/30"
                />
                <div className="flex flex-col text-left truncate max-w-[120px] sm:max-w-[160px]">
                  <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
                </div>
              </Link>

              <Link
                to="/dashboard/generate"
                className="hidden sm:flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium px-4 py-2 rounded-lg hover:text-foreground text-muted-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/dashboard/generate"
                className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Create Dataset</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
