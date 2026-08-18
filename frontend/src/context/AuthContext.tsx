import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../services/supabase";
import { UserProfile } from "../types/auth";
import { getStoredAuthState } from "../services/authService";

export interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ session: Session | null; user: User | null }>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => getStoredAuthState().user);
  const [loading, setLoading] = useState<boolean>(true);

  const mapUserToProfile = (sbUser: User): UserProfile => {
    const cleanEmail = (sbUser.email || "").trim().toLowerCase();
    const displayName =
      sbUser.user_metadata?.full_name ||
      sbUser.user_metadata?.name ||
      cleanEmail.split("@")[0] ||
      "Data Engineer";
    const avatarUrl =
      sbUser.user_metadata?.avatar_url ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

    return {
      id: sbUser.id,
      name: displayName,
      email: cleanEmail,
      avatarUrl,
      organization: sbUser.user_metadata?.organization || "Workspace",
      role: sbUser.user_metadata?.role || "Data Engineer",
      plan: "Standard",
      datasetsCreated: 0,
      recordsGenerated: 0,
    };
  };

  const syncProfileToSupabase = async (profile: UserProfile) => {
    try {
      await supabase.from("UserProfile").upsert({
        id: profile.id,
        supabaseUid: profile.id,
        email: profile.email,
        displayName: profile.name,
        photoUrl: profile.avatarUrl,
        updatedAt: new Date().toISOString(),
      });
      await supabase.from("users").upsert({
        id: profile.id,
        email: profile.email,
        displayName: profile.name,
        photoUrl: profile.avatarUrl,
        organization: profile.organization,
        role: profile.role,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("Supabase database sync notice:", err);
    }
  };

  useEffect(() => {
    // Sync stored local user state if session hasn't finished loading
    const stored = getStoredAuthState();
    if (stored.user) {
      setUserProfile(stored.user);
    }

    // Read initial Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setSupabaseUser(session.user);
        const prof = mapUserToProfile(session.user);
        setUserProfile(prof);
        syncProfileToSupabase(prof).catch(() => {});
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen for Auth changes (login, logout, token refresh, OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        setSupabaseUser(session.user);
        const prof = mapUserToProfile(session.user);
        setUserProfile(prof);
        syncProfileToSupabase(prof).catch(() => {});
      } else {
        const stored = getStoredAuthState();
        if (stored.user) {
          setUserProfile(stored.user);
        } else {
          setSupabaseUser(null);
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    const handleAuthChangedEvent = () => {
      const stored = getStoredAuthState();
      setUserProfile(stored.user);
    };
    window.addEventListener("datagen_auth_changed", handleAuthChangedEvent);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("datagen_auth_changed", handleAuthChangedEvent);
    };
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: name.trim(),
        },
      },
    });

    if (error) {
      throw new Error(error.message || "Registration failed.");
    }

    if (data.user) {
      const prof = mapUserToProfile(data.user);
      setUserProfile(prof);
      syncProfileToSupabase(prof).catch(() => {});
    }

    return { session: data.session, user: data.user };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      throw new Error(error.message || "Invalid email or password.");
    }

    if (data.user) {
      const prof = mapUserToProfile(data.user);
      setUserProfile(prof);
      syncProfileToSupabase(prof).catch(() => {});
    }
  };

  const signInWithGoogle = async () => {
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:8080";
    const redirectUrl = `${currentOrigin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          prompt: "select_account",
          access_type: "offline",
        },
      },
    });

    if (error) {
      throw new Error(error.message || "Google Sign-In failed.");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("datagen_auth_state");
    setSession(null);
    setSupabaseUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:8080";
    const redirectUrl = `${currentOrigin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: redirectUrl,
    });

    if (error) {
      throw new Error(error.message || "Failed to send password reset email.");
    }
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      throw new Error(error.message || "Failed to update password.");
    }
  };

  const isAuthenticated = !!userProfile || (!!session && !!supabaseUser);

  return (
    <AuthContext.Provider
      value={{
        user: userProfile,
        supabaseUser,
        session,
        loading,
        isAuthenticated,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
