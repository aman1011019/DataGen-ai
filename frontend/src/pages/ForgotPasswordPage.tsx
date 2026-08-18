import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "../hooks/useAuth";

export const ForgotPasswordPage = () => {
  const { resetPassword, user } = useAuth();

  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid work email.");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");
    try {
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (err) {
      setErrorMsg((err as Error).message || "Failed to send reset password link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-primary/20">
      {user && (
        <div className="fixed top-4 right-4 z-50">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 p-2 pr-4 rounded-full bg-card border border-border hover:border-primary/40 transition-all shadow-lg text-xs"
          >
            <img
              src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover border border-primary/30"
            />
            <div className="flex flex-col text-left">
              <span className="font-bold text-foreground">{user.name}</span>
              <span className="text-[10px] text-muted-foreground">{user.email}</span>
            </div>
          </Link>
        </div>
      )}

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <Logo className="w-10 h-10 transition-transform group-hover:scale-105" />
          <span className="text-2xl font-extrabold text-foreground tracking-tight">DataGen AI</span>
        </Link>
        <h2 className="text-xl font-bold text-foreground">Reset your password</h2>
        <p className="text-xs text-muted-foreground">Enter your work email to receive password reset instructions</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSubmitted ? (
            <div className="text-center space-y-4 py-4">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto" />
              <h3 className="text-base font-bold text-foreground">Password Reset Link Sent</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If an account exists for <strong className="text-foreground">{email}</strong>, you will receive reset instructions shortly.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline pt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-foreground mb-1 block">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending email...</span>
                  </>
                ) : (
                  <span>Send Reset Password Link</span>
                )}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
