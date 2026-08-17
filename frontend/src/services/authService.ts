import { AuthState, UserProfile } from "../types/auth";
import { supabase } from "./supabase";

const AUTH_STORAGE_KEY = "datagen_auth_state";

export const syncUserToSupabase = async (user: UserProfile | null) => {
  if (!user || !user.email) return;
  try {
    await supabase.from("UserProfile").upsert({
      id: user.id,
      supabaseUid: user.id,
      email: user.email,
      displayName: user.name || "",
      photoUrl: user.avatarUrl || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await supabase.from("users").upsert({
      id: user.id,
      email: user.email,
      displayName: user.name || "",
      photoUrl: user.avatarUrl || "",
      organization: user.organization || "",
      role: user.role || "",
      plan: user.plan || "Normal",
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Notice: Supabase db sync offline or pending:", err);
  }
};

export const getStoredAuthState = (): AuthState => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to parse auth state", e);
  }
  return {
    user: null,
    isAuthenticated: false,
    token: null,
  };
};

export const getActiveUserId = (): string => {
  try {
    const authState = getStoredAuthState();
    if (authState && authState.user && authState.user.email) {
      return authState.user.email.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
    }
  } catch (e) {
    console.error("Failed to read user for scoping", e);
  }
  return "guest_user";
};

export const saveAuthState = (state: AuthState): void => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
    if (state.user) {
      syncUserToSupabase(state.user).catch(() => {});
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("datagen_auth_changed"));
      window.dispatchEvent(new Event("datagen_dataset_created"));
    }
  } catch (e) {
    console.error("Failed to save auth state", e);
  }
};

// Global listener for Supabase Auth state changes (OAuth callbacks)
if (typeof window !== "undefined") {
  // Clear any stale OAuth error parameters if URL contains bad_oauth_state
  if (window.location.search.includes("error=") || window.location.search.includes("error_code=")) {
    console.warn("Cleaning OAuth URL error parameters:", window.location.search);
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const sbUser = session.user;
      const cleanEmail = (sbUser.email || "user@datagen.ai").trim().toLowerCase();
      const userId = sbUser.id || `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
      const displayName =
        sbUser.user_metadata?.full_name ||
        sbUser.user_metadata?.name ||
        cleanEmail.split("@")[0] ||
        "Google User";
      const avatarUrl =
        sbUser.user_metadata?.avatar_url ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

      const user: UserProfile = {
        id: userId,
        name: displayName,
        email: cleanEmail,
        avatarUrl,
        organization: "Enterprise AI Labs",
        role: "Lead Data Engineer",
        plan: "Pro Plan",
        datasetsCreated: 0,
        recordsGenerated: 0,
      };

      saveAuthState({
        user,
        isAuthenticated: true,
        token: session.access_token || `token_${Date.now()}`,
      });
    }
  });
}

export const loginWithGoogle = async (): Promise<UserProfile> => {
  try {
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const redirectUrl = `${currentOrigin}/dashboard`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          prompt: "select_account",
          access_type: "offline",
        },
      },
    });

    if (error) throw error;

    const { data: sessionData } = await supabase.auth.getSession();
    const sbUser = sessionData?.session?.user;

    if (sbUser) {
      const cleanEmail = (sbUser.email || "user@datagen.ai").trim().toLowerCase();
      const userId = sbUser.id || `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
      const displayName =
        sbUser.user_metadata?.full_name ||
        sbUser.user_metadata?.name ||
        cleanEmail.split("@")[0] ||
        "Google User";
      const avatarUrl =
        sbUser.user_metadata?.avatar_url ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

      const user: UserProfile = {
        id: userId,
        name: displayName,
        email: cleanEmail,
        avatarUrl,
        organization: "Enterprise AI Labs",
        role: "Lead Data Engineer",
        plan: "Pro Plan",
        datasetsCreated: 0,
        recordsGenerated: 0,
      };

      saveAuthState({
        user,
        isAuthenticated: true,
        token: sessionData?.session?.access_token || `token_${Date.now()}`,
      });

      return user;
    }

    // Fallback temporary user while OAuth redirect is processing
    const tempUser: UserProfile = {
      id: `usr_${Date.now()}`,
      name: "Google Account",
      email: "google.user@datagen.ai",
      avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Google",
      organization: "Enterprise Workspace",
      role: "AI Engineer",
      plan: "Pro Plan",
      datasetsCreated: 0,
      recordsGenerated: 0,
    };

    saveAuthState({
      user: tempUser,
      isAuthenticated: true,
      token: `token_${Date.now()}`,
    });

    return tempUser;
  } catch (error: any) {
    console.warn("Supabase Google Sign-In notice:", error);
    throw new Error(error?.message || "Google Sign-In failed. Please try again.");
  }
};

export const loginUser = async (email: string, password?: string): Promise<UserProfile> => {
  await new Promise((res) => setTimeout(res, 400));

  if (!email || !email.includes("@")) {
    throw new Error("Please enter a valid work email address.");
  }

  const cleanEmail = email.trim().toLowerCase();
  const nameFromEmail = cleanEmail.split("@")[0].replace(".", " ");
  const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
  const userId = `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;

  const user: UserProfile = {
    id: userId,
    email: cleanEmail,
    name: formattedName || "Data Engineer",
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}`,
    organization: "Enterprise Workspace",
    role: "Lead Data Engineer",
    plan: "Pro Plan",
    datasetsCreated: 0,
    recordsGenerated: 0,
  };

  saveAuthState({
    user,
    isAuthenticated: true,
    token: `token_${Date.now()}`,
  });

  return user;
};

export const registerUser = async (name: string, email: string): Promise<UserProfile> => {
  await new Promise((res) => setTimeout(res, 500));

  if (!name.trim()) throw new Error("Full name is required.");
  if (!email || !email.includes("@")) throw new Error("Please enter a valid work email.");

  const cleanEmail = email.trim().toLowerCase();
  const userId = `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;

  const user: UserProfile = {
    id: userId,
    name: name.trim(),
    email: cleanEmail,
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
    organization: "Personal Workspace",
    role: "AI Engineer",
    plan: "Pro Plan",
    datasetsCreated: 0,
    recordsGenerated: 0,
  };

  saveAuthState({
    user,
    isAuthenticated: true,
    token: `token_${Date.now()}`,
  });

  return user;
};

export const logoutUser = (): void => {
  supabase.auth.signOut().catch(() => {});
  saveAuthState({
    user: null,
    isAuthenticated: false,
    token: null,
  });
};
