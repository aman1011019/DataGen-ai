export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  organization?: string;
  role?: string;
  plan: "Free Trial" | "Pro Plan" | "Enterprise";
  datasetsCreated: number;
  recordsGenerated: number;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  token: string | null;
}
