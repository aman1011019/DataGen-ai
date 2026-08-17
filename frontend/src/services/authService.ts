import { AuthState, UserProfile } from "../types/auth";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";

const AUTH_STORAGE_KEY = "datagen_auth_state";

export const syncUserToFirebase = async (user: UserProfile | null) => {
  if (!user || !user.email) return;
  try {
    const userDocRef = doc(db, "UserProfile", user.id);
    await setDoc(userDocRef, {
      id: user.id,
      firebaseUid: user.id,
      email: user.email,
      displayName: user.name || "",
      photoUrl: user.avatarUrl || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // Also sync to standard users collection
    const usersRef = doc(db, "users", user.id);
    await setDoc(usersRef, {
      id: user.id,
      email: user.email,
      displayName: user.name || "",
      photoUrl: user.avatarUrl || "",
      organization: user.organization || "",
      role: user.role || "",
      plan: user.plan || "Normal",
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn("Notice: Firebase db sync offline or pending:", err);
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
      syncUserToFirebase(state.user).catch(() => {});
    }
    // Dispatch auth changed event so all components dynamically re-scope
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("datagen_auth_changed"));
      window.dispatchEvent(new Event("datagen_dataset_created"));
    }
  } catch (e) {
    console.error("Failed to save auth state", e);
  }
};

export const loginWithGoogle = async (): Promise<UserProfile> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    const cleanEmail = (firebaseUser.email || "user@datagen.ai").trim().toLowerCase();
    const userId = `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;

    const user: UserProfile = {
      id: userId,
      name: firebaseUser.displayName || "Google user",
      email: cleanEmail,
      avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(firebaseUser.displayName || "User")}`,
      organization: "Enterprise AI Labs",
      role: "Lead Data Engineer",
      plan: "Pro Plan",
      datasetsCreated: 0,
      recordsGenerated: 0,
    };

    const token = await firebaseUser.getIdToken();

    saveAuthState({
      user,
      isAuthenticated: true,
      token,
    });

    return user;
  } catch (error: any) {
    console.warn("Firebase Google Sign-In Popup handled/fallback:", error);
    console.error("Google Sign-In failed:", error);
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
  saveAuthState({
    user: null,
    isAuthenticated: false,
    token: null,
  });
};
