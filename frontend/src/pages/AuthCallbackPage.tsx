import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Logo from "@/components/Logo";
import { UserProfile } from "../types/auth";
import { saveAuthState } from "../services/authService";

const parseJwtPayload = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      // 1. Check search params for explicit error
      const searchParams = new URLSearchParams(window.location.search);
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (errorParam || errorDescription) {
        if (isMounted) {
          setStatus("error");
          setErrorMsg(errorDescription || errorParam || "Google Sign-In was cancelled or failed.");
        }
        return;
      }

      // 2. Check URL Hash fragment for implicit OAuth access_token
      const hash = window.location.hash;
      if (hash && hash.includes("access_token=")) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get("access_token");

        if (accessToken) {
          const payload = parseJwtPayload(accessToken);
          if (payload && payload.email) {
            const cleanEmail = (payload.email || "").trim().toLowerCase();
            const displayName =
              payload.user_metadata?.full_name ||
              payload.user_metadata?.name ||
              payload.name ||
              cleanEmail.split("@")[0] ||
              "Google User";
            const avatarUrl =
              payload.user_metadata?.avatar_url ||
              payload.user_metadata?.picture ||
              payload.picture ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

            const userProf: UserProfile = {
              id: payload.sub || `usr_google_${Date.now()}`,
              name: displayName,
              email: cleanEmail,
              avatarUrl,
              organization: "Google Workspace",
              role: "Data Engineer",
              plan: "Standard",
              datasetsCreated: 0,
              recordsGenerated: 0,
            };

            saveAuthState({
              user: userProf,
              isAuthenticated: true,
              token: accessToken,
            });

            if (isMounted) {
              setStatus("success");
              setTimeout(() => {
                navigate("/dashboard", { replace: true });
              }, 500);
            }
            return;
          }
        }
      }

      // 3. Fallback check Supabase getSession
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          const sbUser = session.user;
          const cleanEmail = (sbUser.email || "").trim().toLowerCase();
          const displayName =
            sbUser.user_metadata?.full_name ||
            sbUser.user_metadata?.name ||
            cleanEmail.split("@")[0] ||
            "Google User";
          const avatarUrl =
            sbUser.user_metadata?.avatar_url ||
            sbUser.user_metadata?.picture ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

          const userProf: UserProfile = {
            id: sbUser.id,
            name: displayName,
            email: cleanEmail,
            avatarUrl,
            organization: "Google Workspace",
            role: "Data Engineer",
            plan: "Standard",
            datasetsCreated: 0,
            recordsGenerated: 0,
          };

          saveAuthState({
            user: userProf,
            isAuthenticated: true,
            token: session.access_token,
          });

          setStatus("success");
          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 500);
          return;
        }
      } catch (e) {
        console.warn("Session check error:", e);
      }

      if (isMounted) {
        setStatus("error");
        setErrorMsg("Google OAuth callback did not return an access token. Please verify your Supabase Anon API key or try again.");
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
        <div className="flex justify-center">
          <Logo className="w-12 h-12" />
        </div>

        {status === "loading" && (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
            <h3 className="text-base font-bold text-foreground">Completing Google Sign In</h3>
            <p className="text-xs text-muted-foreground">Extracting Google account credentials...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-3">
            <CheckCircle2 className="w-8 h-8 text-success mx-auto" />
            <h3 className="text-base font-bold text-foreground">Authentication Successful</h3>
            <p className="text-xs text-muted-foreground">Redirecting to your workspace...</p>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;
